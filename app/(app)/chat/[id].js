import { View, Text, Alert, Platform, ActivityIndicator} from 'react-native'
import React, { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  where,
  getDocs,
  limit,
  deleteDoc,
  startAt,
  getCountFromServer,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import * as FileSystem from 'expo-file-system'
import { ref, getStorage, deleteObject } from 'firebase/storage'
import {ref as realRef, update} from 'firebase/database'
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { AuthUserContext, FirebaseContext, SelectedChatContext } from '../../_layout'
import { rDatabase } from '../../../config/firebase'
import { onValue } from 'firebase/database'
import ChatItemContainer from '../../components/ChatItemContainer'
import shorthash from 'shorthash'
import { compareObjects } from '../_layout'
import ChatNavigationHeaderTitle from '../../components/ChatNavigationHeaderTitle'
import ChatActions from '../../components/ChatActions'
import { useDispatch, useSelector } from 'react-redux'
import { useFetchMessagesQuery, useFetchPrevMessagesMutation, useLazyFetchMessagesQuery } from '../../store/features/messages/messagesApi'
import { Button } from 'react-native-paper'
const MESSAGES_PER_REQUEST_LIMIT = 10;
const Chat = () => {
  // console.log('rerender top')
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const chatData = useSelector(state => state.chats.chats.find(chat => chat.id === id))
  const chatUsers = (useSelector(state => state.users.users)).filter(u => {
    if(user.uid === u.id) return false
    if(chatData.users.includes(u.id)) return true
    return false
  })
  const [trigger, result] = useLazyFetchMessagesQuery()
  useEffect(() => {
    trigger({chatId: id, count: MESSAGES_PER_REQUEST_LIMIT})
  }, [])
  // {error, isLoading: firstLoadingMessages, error: firstMessagesError, refetch}
  const [fetchPrevMessages, {isLoading: prevMessagesIsLoading, error: fetchPrevError}] = useFetchPrevMessagesMutation()

  const messagesData = ((useSelector(state => state.messagesData.chatsMessages)).find(m => m.chatId === id))
  const {messages, unreadedMessagesCount, readedMessages, totalMessagesCount, loading: messagesLoading} = messagesData
  const [selectedMessages, setSelectedMessages] = useState([])
  // const [loading, setLoading] = useState(true);
  // const [chatUsersIsLoading, setChatUsersIsLoading] = useState(true);
  // const [messagesCount, setMessagesCount] = useState(null)
  // const [lastLoadedId, setLastLoadedId] = useState(null)
  // const router = useRouter();
  const navigation = useNavigation();
  // const [messages, setMessages] = useState([])
  // const {chatUsers, getChatData, setChatUsers, setChatData} = useContext(SelectedChatContext)

  const deleteMessages = (selectedMessages) => {

  }

  // useEffect(() => {
  //   const firstFetch = async () => {
  //     const prevQ = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(70))
  //     const lastMessages = await loadMessages(prevQ);
  //     setMessages(lastMessages)
  //   }
  //   if(chatData ){
  //     firstFetch();
  //   }
    
  // }, [chatData])
  
  // // ----------- виконується 3
  // // ----------- виконується після завантаження всіх користувачів в чаті 
  // // ----------- оримує повідомлення чату і стежить за їх оновленнями
  // useEffect(() => {
  //   if(chatData){
  //   const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(1))
  //   const unsubscribe = onSnapshot(q, async (snapshot) => {
  //     let newMessages = []
  //     let messagesLenght = 0;
  //     let lastId = null;
  //     snapshot.docChanges().forEach(change => {
  //       if(change.type === 'added') {
  //         const messageData = change.doc.data();
  //         const docId = change.doc.id;
  //         if(!messageData.createdAt){
  //           messageData.createdAt = {
  //             seconds: Date.now()
  //           }
  //         }else{
  //           messageData.createdAt = {
  //             ...messageData.createdAt,
  //             seconds: messageData.createdAt.seconds * 1000
  //           }
  //         }
  //         if(!messageData.isRead.includes(user.uid)){
  //           const data = {
  //             isRead: [...messageData.isRead, user.uid]
  //           }
  //           updateDoc(doc(database, 'messages', String(id), 'message', docId), data)
  //         }
  //         const messageCreatedAt = new Date(messageData.createdAt.seconds)
  //         const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate(); 
  //         newMessages.push({date: messageSlug, data: [{...messageData, id: change.doc.id}]})
  //         lastId = docId;
  //         messagesLenght++;
  //       }
  //       if(change.type === 'modified'){
  //       }
  //     })
  //     setMessages(messages => {
  //       const updatedMessages = [
  //         ...messages
  //       ]
  //       newMessages.forEach(messageItem => {
  //         const findDate = updatedMessages.findIndex(upd => upd.date === messageItem.date)
  //         if(findDate !== -1){
  //           messageItem.data.forEach(messageData => {
  //             if(!updatedMessages[findDate].data.find(m => m.id === messageData.id)){
  //               updatedMessages[findDate].data.unshift(messageData)
  //             }
  //           })
  //         }else{
  //           updatedMessages.unshift(messageItem) 
  //         }
  //       })
  //       return updatedMessages
  //     })
  //   }, 
  //   (error) => {console.log(error, '----> firebase onSnapshot messages')})
  //   return () => unsubscribe();
  //   }
  // }, [chatData])

  // useEffect(() => {
  //   const setCount = async () => {
  //     setMessagesCount((await getCountFromServer(collection(database, 'messages', id, 'message'))).data().count)
  //   }
  //   setCount()
  // }, [id])


  //     //----- виконується 3
  //     //----- встановлення даних про співрозмовника в хедері чату
  //     //----- виконується після завантаження користувачів чату
  useLayoutEffect(() => {
      const user = chatUsers[0];
      navigation.setOptions({
        headerTitle: () => {
          if(chatData.type === 'private'){
            return <ChatNavigationHeaderTitle 
            contentPressHandle={() => router.push(`user/${user.id}`)} 
            chatType={chatData.type} 
            chatImage={user.image}
            name={user.displayName}
            online={{onlineStatus: user.isOnline, timeStamp: user.timeStamp}}
            selectedMessagesCount={selectedMessages.length}
            handleSelectedMessages={() => deleteMessages(selectedMessages)}
            />
          }
          if(chatData.type === 'public'){
            return <ChatNavigationHeaderTitle 
            contentPressHandle={() => router.push('chat/info')} 
            chatType={chatData.type} 
            chatImage={chatData.image}
            name={chatData.name}
            online={chatUsers.map(chatUser => chatUser.onlineStatus)}
            selectedMessagesCount={selectedMessages.length}
            handleSelectedMessages={() => deleteMessages(selectedMessages)}
            />
          }
        }
      })
  }, [chatData, chatUsers])

  // //--------------- виокнується 4 
  // //--------------- Отримує статус кожного користувача чату і стежить за його оновленнями
  // //--------------- стежить за даними з realtime firebase database, 
  // //--------------- містить колбек, який спрацьовує коли користувач від'єднався від програми
  // useEffect(() => {
  //   let unsubs = [];
  //   if(!loading){
  //     unsubs = chatUsers.map(chatUser => {
  //       const unsub = onValue(realRef(rDatabase, '/status/' + chatUser.id), (snapShot) => {
  //         const value = snapShot.val();
  //         setChatUsers(chats => {
  //           return chats.map(u => {
  //             if(chatUser.id === u.id){
  //                   return {
  //                       ...u,
  //                       onlineStatus: value?.isOnline,
  //                       timeStamp: value?.timeStamp
  //                   }
  //               }
  //               return u;
  //           })
  //       })
  //     })
  //   return unsub;
  // })
  // }
  // return () => unsubs.forEach(unsub => {
  // unsub();    
  // });
  // }, [loading])

  // useEffect(() => {
  //   if(chatData && chatUsers && messages){
  //     setLoading(false)
  //   }
  // }, [chatData, chatUsers, messages])

  // //------- вибірка даних всіх користувачів в даному чаті,
  // //------- встановлення їх в змінну chatUsers
  // //------- встановлення в chatUsersIsLoading - false
  // const getUsers = async (ids) => {
  //   setChatUsersIsLoading(true)
  //   const loadedChatUsers = [];
  //   for(const id of ids){
  //     if(user.uid !== id){
  //       const qUser = query(collection(database, "users"), where("id", "==", id))
  //       let res = await getDocs(qUser);
  //       res = await Promise.all(res.docs.map(item => item.data()))
  //       loadedChatUsers.push(await {
  //         ...res[0],
  //         onlineStatus: false,
  //         lastSeen: null
  //       })
  //     }
  //   }
  //   return loadedChatUsers
  // }

  // const loadPreviousMessages = useCallback(async () => {
  //   if(!loading){
  //     fetchPrevMessagess()
  //   }
  // }, [messagesCount, messages, loading, lastLoadedId])

  const fetchPrevMessagess = async () => {
    let loadedMessagesCount = 0;
    messages.forEach(m => {
      loadedMessagesCount += m.data.length;
    })
    if(loadedMessagesCount < messagesCount){
    setLoading(true)
    const lastDoc = await getDoc(doc(database, "messages", id, "message", lastLoadedId));
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(70), startAt(lastDoc))
    const oldMessages = await loadMessages(q)
    setMessages(messages => {
      const updatedMessages = [
        ...messages
      ]
      oldMessages.forEach(messageItem => {
        const findDate = updatedMessages.findIndex(upd => upd.date === messageItem.date)
        if(findDate !== -1){
          messageItem.data.forEach(messageData => {
            if(messageData.id !== lastLoadedId){
              updatedMessages[findDate].data.push(messageData)
            }
          })
        }else{
          updatedMessages.push(messageItem) 
        }
      })
      return updatedMessages
    })
    setLoading(false)
    }
  }

  const loadMessages = async (query) => {
    const result = await getDocs(query)
    const oldMessages = [];
    const messagesForRead = [];
    let lastLoaded = null;
    result.docs.forEach(doc => {
      const messageData = doc.data();
      if(messageData.isRead.includes(user.uid)){
      }else{
        messagesForRead.push({id: doc.id, data: messageData})
      }

      messageData.createdAt.seconds = messageData.createdAt.seconds * 1000;
      const messageCreatedAt = new Date(messageData?.createdAt?.seconds)
      const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate(); 
      const currentDateIndex = oldMessages.findIndex(messages => messages.date === messageSlug);
      if(currentDateIndex !== -1){
        const existedMessage = oldMessages[currentDateIndex].data.find(message => message.id === doc.id)
        if(!existedMessage){
          oldMessages[currentDateIndex].data.push({...messageData, id: doc.id})
        }
      }
      else{
        oldMessages.push({
          date: messageSlug,
          data: [
            {...messageData, id: doc.id}
          ]
        })
      }
      lastLoaded = doc.id     
    } 
    )
    messagesForRead.forEach(messageForRead => {
      const data = {
        isRead: [...messageForRead.data.isRead, user.uid]
      }
      updateDoc(doc(database, 'messages', String(id), 'message', messageForRead.id), data)
    })
    setLastLoadedId(lastLoaded)
    return oldMessages
  }

  // const deleteMessages = (messagesForDelete) => {
  //   messagesForDelete.forEach(message => {
  //     let selectedMessage;  
  //     messages.forEach(element => {
  //       if(!selectedMessage){
  //         const findItem  = element.data.find(m => m.id === message)
  //         if(findItem){
  //           selectedMessage = findItem
  //         }
  //       }
  //     });
  //     if(selectedMessage.media){
  //       const storage = getStorage();
  //       selectedMessage.media.forEach(mediaItem => {
  //         const mediaParam = mediaItem.split("/media%2F")[1];
  //         const name = mediaParam.split("?")[0];
  //         const desertRef = ref(storage, `media/${name}`);
  //         deleteObject(desertRef)
  //         .then(res => {
  //           const name = shorthash.unique(mediaItem);
  //           const path = `${FileSystem.cacheDirectory}${name}`;
  //           FileSystem.deleteAsync(path);
  //           deleteDoc(doc(database, 'messages', id, 'message', message));
  //         })
  //         .catch((error) => {
  //           Alert.alert('File not delete, try again',`${error}`, [
  //             {
  //               text: 'OK',
  //               onPress: () => {
  //                 addDoc(collection(database, 'errors', ), {error: `File not delete: ${error}`, platform: `${Platform.OS}, ${Platform.Version}`})
  //                 console.log('Cancel Pressed')
  //               },
  //             }
  //           ]);
  //         });
  //       }) 
  //     }
  //     else{
  //       deleteDoc(doc(database, 'messages', id, 'message', message));
  //     }
  //     setSelectedMessages(messages => messages.filter(m => m !== selectedMessage.id))
  //   })
  //   setMessages(messages => messages.map(item => ({...item, data: item.data.filter(m => {
  //         const deleteMessage = messagesForDelete.find(forDelete => forDelete === m.id)
  //         if(deleteMessage) return false
  //         return true
  //       })
  //     })
  //   ))
  // }

  const loadPreviousMessages = () => {
    const lastDisplayedDay = messagesData?.messages[messagesData?.messages.length -1]
    const lastMessage = lastDisplayedDay.data[lastDisplayedDay.data.length - 1]
    trigger({chatId: id, count: MESSAGES_PER_REQUEST_LIMIT, lastMessageId: lastMessage.id})
  }

  const updateSelectedMessages = useCallback((selectedMessage) => {
    const messageId = selectedMessage.id;
            if(selectedMessage.uid === user.uid) {
                setSelectedMessages(selectedMessages => {
                const findMessage = selectedMessages.find(id => id === messageId)
                if(findMessage){
                    return [
                        ...selectedMessages.filter(id => id !== messageId)
                    ]
                }
                return [
                    ...selectedMessages,
                    messageId
                ]
            })
        }
  }, [])
  // return <View>
  //   <Text>
  //     12312312431
  //   </Text>
  // </View>
  // return(<View><Text>123123123213</Text></View>)
  if( fetchPrevError){
    return <View>
      <Text>
      ⚠️error fetching messages⚠️
      </Text>
    </View>
  }
  if( messagesLoading){
    return  <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size='large'/>
            </View>
  }
  
  // if(!chatUsers || !messages || !chatData){
  //   return <ActivityIndicator size='large'/>
  // }
  return (
    <>
    <ChatCanvas>
      <> 
        {prevMessagesIsLoading && <ActivityIndicator style={{alignSelf: 'center', paddingTop: 5}} color={'blue'} size={'large'}/>}
        {messages?.length === 0
          ? <View>
              <Text>No data</Text>
            </View>
          : <ChatItemContainer 
              messagesCount={totalMessagesCount} 
              chatData={chatData} 
              chatUsers={chatUsers} 
              messages={messagesData.messages} 
              selectedMessages={selectedMessages} 
              updateSelectedMessages={updateSelectedMessages} 
              loadPreviousMessages={loadPreviousMessages}/>
        }
      </>
    </ChatCanvas>
    <Button onPress={loadPreviousMessages}>
        <Text>
          Load prev
        </Text>
    </Button>
    <ChatActions id={id}/>
    </>
  )
  return (
    <View>
      <Text>
        123123
      </Text>
      <Button onPress={() => {fetchPrevMessages({chatId: id, lastMessageId: (messagesData?.messages[messagesData?.messages.length -1]).id, count: MESSAGES_PER_REQUEST_LIMIT})}}>
        <Text>
          Load prev
        </Text>
      </Button>
    </View>
  )
}

const ChatCanvas = styled.View`
background-color: #eaeaea; 
flex-shrink: 1;
flex-grow: 1;
`

export default Chat