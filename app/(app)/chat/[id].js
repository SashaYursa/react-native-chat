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

const Chat = () => {
  const [selectedMessages, setSelectedMessages] = useState([])
  const [loading, setLoading] = useState(true);
  const { database } = useContext(FirebaseContext);
  const { user } = useContext(AuthUserContext);
  const [chatUsersIsLoading, setChatUsersIsLoading] = useState(true);
  const [messagesCount, setMessagesCount] = useState(null)
  const [lastLoadedId, setLastLoadedId] = useState(null)
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const {chatUsers, getChatData, setChatUsers, setChatData, messages = {}, setMessages} = useContext(SelectedChatContext)
  //--------- виконується 1
  //--------- завантаження даних поточного чату
  //--------- встановлення поля lastSeen для залогіненого юзера в табл. chats значення - online
  //--------- при виході з чату в поле встановлюється значення new Date()
  const chatData = getChatData(id)

  // useEffect(() => {
  //   const qChat = doc(database, "chats", id);
  //   const unsubscribe = onSnapshot(qChat, { includeMetadataChanges: true }, async (data) => {
  //     const chat = data.data();
  //     const newChatData = {...chat, id: data.id}
  //       if(!compareObjects(newChatData, chatData)){
  //         setChatData(newChatData);
  //       }
  //   })
  //   return async () => {
  //     unsubscribe();
  //   }
  // }, [id])

  //------ виконується 2
  //------ завантаження користувачів чату
  //------ виконується після завантаження чату
  //------ отрмання всіх користувачів чату, які є в даному чаті по айді
  useEffect(() => {
    const loadUsers = async () => {
      if(chatData !== null && chatUsersIsLoading){
        const users = await getUsers(chatData.users)
        if(!compareObjects(users, chatUsers)){
          setChatUsers(users);
        }
        setChatUsersIsLoading(false)
      }
    }
    loadUsers();
  }, [chatData])

  useEffect(() => {
    const firstFetch = async () => {
      const prevQ = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(10))
      const lastMessages = await loadMessages(prevQ);
      setMessages(lastMessages)
    }
    if(chatData ){
      firstFetch();
    }
    
  }, [chatData])
  
  // ----------- виконується 3
  // ----------- виконується після завантаження всіх користувачів в чаті 
  // ----------- оримує повідомлення чату і стежить за їх оновленнями
  useEffect(() => {
    if(chatData){
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(1))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let newMessages = []
      let messagesLenght = 0;
      let lastId = null;
      snapshot.docChanges().forEach(change => {
        if(change.type === 'added') {
          // console.log('added')
          const messageData = change.doc.data();
          const docId = change.doc.id;
          if(!messageData.createdAt){
            messageData.createdAt = {
              seconds: Date.now()
            }
          }else{
            messageData.createdAt = {
              ...messageData.createdAt,
              seconds: messageData.createdAt.seconds * 1000
            }
          }
          if(!messageData.isRead.includes(user.uid)){
            const data = {
              isRead: [...messageData.isRead, user.uid]
            }
            updateDoc(doc(database, 'messages', String(id), 'message', docId), data)
          }
          const messageCreatedAt = new Date(messageData.createdAt.seconds)
          const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate(); 
          newMessages.push({date: messageSlug, data: [{...messageData, id: change.doc.id}]})
          lastId = docId;
          messagesLenght++;
        }
        if(change.type === 'modified'){
          // console.log('modified on ', Platform.OS)
        }
      })
      setMessages(messages => {
        const updatedMessages = [
          ...messages
        ]
        newMessages.forEach(messageItem => {
          const findDate = updatedMessages.findIndex(upd => upd.date === messageItem.date)
          if(findDate !== -1){
            messageItem.data.forEach(messageData => {
              if(!updatedMessages[findDate].data.find(m => m.id === messageData.id)){
                updatedMessages[findDate].data.unshift(messageData)
              }
            })
          }else{
            updatedMessages.unshift(messageItem) 
          }
        })
        return updatedMessages
      })
    }, 
    (error) => {console.log(error, '----> firebase onSnapshot messages')})
    return () => unsubscribe();
    }
  }, [chatData])

  useEffect(() => {
    const setCount = async () => {
      setMessagesCount((await getCountFromServer(collection(database, 'messages', id, 'message'))).data().count)
    }
    setCount()
  }, [id])


      //----- виконується 3
      //----- встановлення даних про співрозмовника в хедері чату
      //----- виконується після завантаження користувачів чату
  useLayoutEffect(() => {
    if(!chatUsersIsLoading){
      const user = chatUsers[0];
      navigation.setOptions({
        headerTitle: () => {
          if(chatData.type === 'private'){
            return <ChatNavigationHeaderTitle 
            contentPressHandle={() => router.push(`user/${user.id}`)} 
            chatType={chatData.type} 
            chatImage={user.image}
            name={user.displayName}
            online={{onlineStatus: user.onlineStatus, timeStamp: user.timeStamp}}
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
    }
  }, [chatUsers, selectedMessages])

  //--------------- виокнується 4 
  //--------------- Отримує статус кожного користувача чату і стежить за його оновленнями
  //--------------- стежить за даними з realtime firebase database, 
  //--------------- містить колбек, який спрацьовує коли користувач від'єднався від програми
  useEffect(() => {
    let unsubs = [];
    if(!loading){
      unsubs = chatUsers.map(chatUser => {
        const unsub = onValue(realRef(rDatabase, '/status/' + chatUser.id), (snapShot) => {
          const value = snapShot.val();
          setChatUsers(chats => {
            return chats.map(u => {
              if(chatUser.id === u.id){
                    return {
                        ...u,
                        onlineStatus: value?.isOnline,
                        timeStamp: value?.timeStamp
                    }
                }
                return u;
            })
        })
      })
    return unsub;
  })
  }
  return () => unsubs.forEach(unsub => {
  unsub();    
  });
  }, [loading])

  useEffect(() => {
    if(chatData && chatUsers && messages){
      setLoading(false)
    }
  }, [chatData, chatUsers, messages])

  //------- вибірка даних всіх користувачів в даному чаті,
  //------- встановлення їх в змінну chatUsers
  //------- встановлення в chatUsersIsLoading - false
  const getUsers = async (ids) => {
    setChatUsersIsLoading(true)
    const loadedChatUsers = [];
    for(const id of ids){
      if(user.uid !== id){
        const qUser = query(collection(database, "users"), where("id", "==", id))
        let res = await getDocs(qUser);
        res = await Promise.all(res.docs.map(item => item.data()))
        loadedChatUsers.push(await {
          ...res[0],
          onlineStatus: false,
          lastSeen: null
        })
      }
    }
    return loadedChatUsers
  }

  const loadPreviousMessages = useCallback(async () => {
    if(!loading){
      fetchPrevMessagess()
    }
  }, [messagesCount, messages, loading, lastLoadedId])

  const fetchPrevMessagess = async () => {
    let loadedMessagesCount = 0;
    messages.forEach(m => {
      loadedMessagesCount += m.data.length;
    })
    if(loadedMessagesCount < messagesCount){
    setLoading(true)
    const lastDoc = await getDoc(doc(database, "messages", id, "message", lastLoadedId));
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(20), startAt(lastDoc))
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
    // console.log('fetched 100 messages');
    const result = await getDocs(query)
    const oldMessages = [];
    const messagesForRead = [];
    let lastLoaded = null;
    result.docs.forEach(doc => {
      const messageData = doc.data();
      if(messageData.isRead.includes(user.uid)){
        // console.log('is read')
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

  const deleteMessages = (messagesForDelete) => {
    messagesForDelete.forEach(message => {
      let selectedMessage;  
      messages.forEach(element => {
        if(!selectedMessage){
          const findItem  = element.data.find(m => m.id === message)
          if(findItem){
            selectedMessage = findItem
          }
        }
      });
      if(selectedMessage.media){
        const storage = getStorage();
        selectedMessage.media.forEach(mediaItem => {
          const mediaParam = mediaItem.split("/media%2F")[1];
          const name = mediaParam.split("?")[0];
          const desertRef = ref(storage, `media/${name}`);
          deleteObject(desertRef)
          .then(res => {
            const name = shorthash.unique(mediaItem);
            const path = `${FileSystem.cacheDirectory}${name}`;
            FileSystem.deleteAsync(path);
            deleteDoc(doc(database, 'messages', id, 'message', message));
          })
          .catch((error) => {
            Alert.alert('File not delete, try again',`${error}`, [
              {
                text: 'OK',
                onPress: () => {
                  addDoc(collection(database, 'errors', ), {error: `File not delete: ${error}`, platform: `${Platform.OS}, ${Platform.Version}`})
                  console.log('Cancel Pressed')
                },
              }
            ]);
          });
        }) 
      }
      else{
        deleteDoc(doc(database, 'messages', id, 'message', message));
      }
      setSelectedMessages(messages => messages.filter(m => m !== selectedMessage.id))
    })
    setMessages(messages => messages.map(item => ({...item, data: item.data.filter(m => {
          const deleteMessage = messagesForDelete.find(forDelete => forDelete === m.id)
          if(deleteMessage) return false
          return true
        })
      })
    ))
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

  if(!chatUsers || !messages || !chatData){
    return <ActivityIndicator size='large'/>
  }
  return (
    <>
    <ChatCanvas>
      <> 
        {loading && <ActivityIndicator style={{alignSelf: 'center'}} color={'blue'} size={'large'}/>}
        {!messages.length
          ? <View>
              <Text>No data</Text>
            </View>
          : <ChatItemContainer 
          messagesCount={messagesCount} 
          chatData={chatData} 
          chatUsers={chatUsers} 
          messages={messages} 
          selectedMessages={selectedMessages} 
          updateSelectedMessages={updateSelectedMessages} 
          loadPreviousMessages={loadPreviousMessages}/>
        }
      </>
    </ChatCanvas>
    <ChatActions id={id}/>
    </>
  )
}

const ChatCanvas = styled.View`
background-color: #eaeaea; 
flex-shrink: 1;
flex-grow: 1;
`

export default Chat