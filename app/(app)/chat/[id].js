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
import { useDeleteMessageMutation, useFetchMessagesQuery, useFetchPrevMessagesMutation, useLazyFetchMessagesQuery, useLazyStartReciveMessagesQuery, useSendErrorMutationMutation } from '../../store/features/messages/messagesApi'
import { Button } from 'react-native-paper'
import { setCurrentChat } from '../../store/features/chats/chatsSlice'
import { removeMessagesFromState } from '../../store/features/messages/messagesSlice'
const MESSAGES_PER_REQUEST_LIMIT = 30;
const Chat = () => {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const chatData = useSelector(state => state.chats.chats.find(chat => chat.id === id))
  const chatUsers = (useSelector(state => state.users.users)).filter(u => {
    if(user.uid === u.id) return false
    if(chatData.users.includes(u.id)) return true
    return false
  })
  const [trigger, {error: fetchMessagesError}] = useLazyFetchMessagesQuery()
  const [deleteMessageAction, {data: deleteResult, error: deleteMessageError}] = useDeleteMessageMutation()
  const [sendErrorToDeleteMessage, {data: errorResult}] = useSendErrorMutationMutation()
  useLayoutEffect(() => {
    trigger({chatId: id, count: MESSAGES_PER_REQUEST_LIMIT, userId: user.uid})
  }, [])
  const messagesData = (useSelector(state => state.messagesData.chatsMessages)).find(m => m.chatId === id)
  const {messages, unreadedMessagesCount, readedMessages, totalMessagesCount, loading: messagesLoading} = messagesData
  const [selectedMessages, setSelectedMessages] = useState([])
  const navigation = useNavigation();
  const router = useRouter();

  // remove from state currentChat i.e. close chat
  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      dispatch(setCurrentChat({currentChat: null}))
    });
   }, [navigation]);

   useEffect(() => {
    if(deleteMessageError){
      Alert.alert(deleteMessageError.message, deleteMessageError.body, [
        {
          text: 'OK',
          onPress: () => {
            sendErrorToDeleteMessage({error: deleteMessageError, platformOS: Platform.OS, platformVersion: Platform.Version})
          },
        }
      ]);
    }
   }, [deleteMessageError])

  const deleteMessages = async (selectedMessages) => {
    deleteMessageAction({selectedMessages, chatId: id, removeMessagesFromState})
    setSelectedMessages([])
  }
  // setup header
  useLayoutEffect(() => {
      const user = chatUsers[0];
      navigation.setOptions({
        headerTitle: () => {
          if(chatData.type === 'private'){
            return <ChatNavigationHeaderTitle 
            contentPressHandle={() => router.push(`user/${user.id}`)} 
            chatData={chatData}
            chatImage={user.image}
            name={user.displayName}
            online={{onlineStatus: user.isOnline, timeStamp: user.timeStamp}}
            selectedMessagesCount={selectedMessages.length}
            handleSelectedMessages={() => deleteMessages(selectedMessages)}
            />
          }
          if(chatData.type === 'public'){
            return <ChatNavigationHeaderTitle 
            contentPressHandle={() => router.push({pathname: 'chat/info', params: {id}})} 
            chatData={chatData}
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

  // const fetchPrevMessagess = async () => {
  //   let loadedMessagesCount = 0;
  //   messages.forEach(m => {
  //     loadedMessagesCount += m.data.length;
  //   })
  //   if(loadedMessagesCount < messagesCount){
  //   setLoading(true)
  //   const lastDoc = await getDoc(doc(database, "messages", id, "message", lastLoadedId));
  //   const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(70), startAt(lastDoc))
  //   const oldMessages = await loadMessages(q)
  //   setMessages(messages => {
  //     const updatedMessages = [
  //       ...messages
  //     ]
  //     oldMessages.forEach(messageItem => {
  //       const findDate = updatedMessages.findIndex(upd => upd.date === messageItem.date)
  //       if(findDate !== -1){
  //         messageItem.data.forEach(messageData => {
  //           if(messageData?.id !== lastLoadedId){
  //             updatedMessages[findDate].data.push(messageData)
  //           }
  //         })
  //       }else{
  //         updatedMessages.push(messageItem) 
  //       }
  //     })
  //     return updatedMessages
  //   })
  //   setLoading(false)
  //   }
  // }

  // const loadMessages = async (query) => {
  //   const result = await getDocs(query)
  //   const oldMessages = [];
  //   const messagesForRead = [];
  //   let lastLoaded = null;
  //   result.docs.forEach(doc => {
  //     const messageData = doc.data();
  //     if(messageData.isRead.includes(user.uid)){
  //     }else{
  //       messagesForRead.push({id: doc?.id, data: messageData})
  //     }

  //     messageData.createdAt.seconds = messageData.createdAt.seconds * 1000;
  //     const messageCreatedAt = new Date(messageData?.createdAt?.seconds)
  //     const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate(); 
  //     const currentDateIndex = oldMessages.findIndex(messages => messages.date === messageSlug);
  //     if(currentDateIndex !== -1){
  //       const existedMessage = oldMessages[currentDateIndex].data.find(message => message?.id === doc?.id)
  //       if(!existedMessage){
  //         oldMessages[currentDateIndex].data.push({...messageData, id: doc?.id})
  //       }
  //     }
  //     else{
  //       oldMessages.push({
  //         date: messageSlug,
  //         data: [
  //           {...messageData, id: doc.id}
  //         ]
  //       })
  //     }
  //     lastLoaded = doc.id     
  //   } 
  //   )
  //   messagesForRead.forEach(messageForRead => {
  //     const data = {
  //       isRead: [...messageForRead.data.isRead, user.uid]
  //     }
  //     updateDoc(doc(database, 'messages', String(id), 'message', messageForRead.id), data)
  //   })
  //   setLastLoadedId(lastLoaded)
  //   return oldMessages
  // }


  const loadPreviousMessages = (atemp = 1) => {
    const lastDisplayedDay = messagesData?.messages[messagesData?.messages.length - atemp]
    if(lastDisplayedDay?.data){
      const lastMessage = lastDisplayedDay.data.findLast(m => !m?.deleted)
      if(lastMessage?.id){
        trigger({chatId: id, count: MESSAGES_PER_REQUEST_LIMIT, lastMessageId: lastMessage.id, userId: user.uid})
      }else{
        loadPreviousMessages(atemp + 1)
      }
    }
  }

  const updateSelectedMessages = useCallback((selectedMessage) => {
    const messageId = selectedMessage.id;
            if(selectedMessage.uid === user.uid) {
                setSelectedMessages(selectedMessages => {
                const findMessage = selectedMessages.find(m => m.id === messageId)
                if(findMessage){
                    return [
                        ...selectedMessages.filter(m => m.id !== messageId)
                    ]
                }
                return [
                    ...selectedMessages,
                    selectedMessage
                ]
            })
        }
  }, [])
  //  
  if(messagesLoading){
    return  <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size='large'/>
            </View>
  }
  
  return (
    <>
    <Button onPress={() => loadPreviousMessages()}>
        <Text>
          Load prev
        </Text>
    </Button>
    <ChatCanvas>
      <> 
        {messages?.length === 0
          ? <View>
              <Text>⚠️No messages⚠️</Text>
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