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
} from 'firebase/firestore'
import * as FileSystem from 'expo-file-system'
import { ref, getStorage, deleteObject } from 'firebase/storage'
import {ref as realRef} from 'firebase/database'
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
  // console.log('rerender', Platform.OS)
  // const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([])
  const [loading, setLoading] = useState(true);
  const { database } = useContext(FirebaseContext);
  const { user } = useContext(AuthUserContext);
  const [chatUsersIsLoading, setChatUsersIsLoading] = useState(true);
  const [messagesCount, setMessagesCount] = useState(null)
  const [canFetched, setCanFetched] = useState(false)
  const [canSnapshot, setCanSnapshot] = useState(false)
  const [lastLoadedId, setLastLoadedId] = useState(null)
  const [loadMessagesStatus, setLoadMessagesStatus] = useState(null)
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  // const [messages, setMessages] = useState({});
  const {chatUsers, chatData, setChatUsers, setChatData, messages = {}, setMessages} = useContext(SelectedChatContext)
  //--------- виконується 1
  //--------- завантаження даних поточного чату
  //--------- встановлення поля lastSeen для залогіненого юзера в табл. chats значення - online
  //--------- при виході з чату в поле встановлюється значення new Date()
  useEffect(() => {
    const qChat = doc(database, "chats", id);
    const unsubscribe = onSnapshot(qChat, { includeMetadataChanges: true }, async (data) => {
      const chat = data.data();
      const newChatData = {...chat, id: data.id}
        if(!compareObjects(newChatData, chatData)){
          setChatData(newChatData);
        }
    })
    return async () => {
      unsubscribe();
    }
  }, [id])

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

  // useEffect(() => {
  //   const firstFetch = async () => {
  //     const prevQ = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(100))
  //     const docs = await getDocs(prevQ);
  //     let lastDoc = null;
  //     docs.forEach(data => {
  //       // console.log('for each 111111')
  //       fetchPrevMessagess(0, data)
  //     })
  //   }
  //   // console.log('here rerender')
  //   firstFetch();
    
  // }, [canFetched])
  
  // ----------- виконується 3
  // ----------- виконується після завантаження всіх користувачів в чаті 
  // ----------- оримує повідомлення чату і стежить за їх оновленнями
  useEffect(() => {
    if(canFetched){
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(1))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let newMessages = {}
      let messagesLenght = 0;
      let lastId = null;
      snapshot.docChanges().forEach(change => {
        if(change.type === 'added') {
          const messageData = change.doc.data();
          const id = change.doc.id;
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
          const messageCreatedAt = new Date(messageData.createdAt.seconds)
          const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate(); 
          if(newMessages[messageSlug]){
            newMessages[messageSlug].push({...messageData, id})
          }else{
            newMessages[messageSlug] = [
              {...messageData, id}
            ]
          }
          lastId = id;
          messagesLenght++;
        }
      })
        setMessages(oldMessages => {
          const prevKeys = Object.keys(oldMessages);
          const assignMessages = oldMessages;
          for (const key in newMessages) {
            if(prevKeys.find(prevKey => prevKey === key)){
              assignMessages[key].unshift(...newMessages[key])
            }else{
              assignMessages[key] = newMessages[key]
            }
          }
          return assignMessages
        })
    }, 
    (error) => {console.log(error, '----> firebase onSnapshot messages')})
    return () => unsubscribe();
    }
  }, [canFetched])

  useEffect(() => {
    console.log('i use')
    const setCount = async () => {
      setMessagesCount((await getCountFromServer(collection(database, 'messages', id, 'message'))).data().count)
    }
    setCount()
  }, [chatData])

  useEffect(() => {
    if(messagesCount){
      setCanFetched(true)
    }
  }, [messagesCount])


  const setFetchedMessages = async (fetchedMessages) => {
    const fetchedMessagesKeys = Object.keys(fetchedMessages)
    // if(!(messages.length === 0 && messagesCount > 1 
    //   && fetchedMessagesKeys.length === 0 
    //   && fetchedMessages[fetchedMessagesKeys[0]].length < 2)){
    //   console.log('can')
    // }
      setMessages(fetchedMessages)
      setLoadMessagesStatus({
        messagesCount: messagesCount,
        loadedMessagesCount: fetchedMessages.length,
        canLoadedMessages: true
      })
    // }
  }

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
                        onlineStatus: value.isOnline,
                        timeStamp: value.timeStamp
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

  const loadPreviousMessages = useCallback(async (loadedMessagesLength) => {
    if(!loading){

      fetchPrevMessagess(loadedMessagesLength)
    }
  }, [messagesCount, messages, loading, lastLoadedId])

  const fetchPrevMessagess = async (loadedMessagesLength, lastDoc = null) => {
    console.log(loadedMessagesLength, messagesCount)
    if(loadedMessagesLength < messagesCount){
    setLoading(true)
    if(!lastDoc){
    lastDoc = await getDoc(doc(database, "messages", id, "message", lastLoadedId));
    }
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(100), startAt(lastDoc))
    const oldMessages = await loadMessages(q)
     const prevKeys = Object.keys(messages);
     if(prevKeys.length){
        const assignMessages = messages;
        for (const key in oldMessages) {
          if(prevKeys.find(prevKey => prevKey === key)){
            assignMessages[key].push(...oldMessages[key])
          }else{
            assignMessages[key] = oldMessages[key]
          }
        } 
        setMessages(assignMessages)
      }else{
        setMessages(oldMessages)
      }
    setCanSnapshot(true)
    setLoading(false)
    }
  }

  const loadMessages = async (query) => {
    const result = await getDocs(query)
    const oldMessages = {};
    let lastLoaded = null;
    result.docs.forEach((doc, index) => {
      if(index !== 0){
        const messageData = doc.data();
        messageData.createdAt.seconds = messageData.createdAt.seconds * 1000;
        const messageCreatedAt = new Date(messageData?.createdAt?.seconds)
        const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate(); 
        if(oldMessages[messageSlug]){
          oldMessages[messageSlug].push({...messageData, id: doc.id})
        }else{
          oldMessages[messageSlug] = [
            {...messageData, id: doc.id}
          ]
        }
        lastLoaded = doc.id     
      } 
    })
    setLastLoadedId(lastLoaded)
    return oldMessages
  }

  const deleteMessages = (messagesForDelete) => {
    messagesForDelete.forEach(message => {
      console.log(message)
      const selectedMessage = messages.find(m => m.id === message)
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
      setSelectedMessages(messages => {
        return messages.filter(m => m !== message)
      })
    })
     setMessages(messages => messages.filter(m => {
      const deleteMessage = messagesForDelete.find(forDelete => forDelete === m.id)
      if(deleteMessage) return false
      return true
    }))
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
  const messagesLength = Object.keys(messages)
  return (
    <>
    <ChatCanvas>
      <> 
        {loading && <ActivityIndicator style={{alignSelf: 'center'}} color={'blue'} size={'large'}/>}
        {!messagesLength
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