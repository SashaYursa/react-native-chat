import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, PermissionsAndroid, KeyboardAvoidingView, FlatList, Alert, Platform, SafeAreaView } from 'react-native'
import React, { createContext, memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  where,
  getDocs,
  setDoc,
  limit,
  deleteDoc,
  startAfter,
  startAt,
  getCountFromServer,
} from 'firebase/firestore'
import * as FileSystem from 'expo-file-system'
import { getDownloadURL, ref, getStorage, deleteObject, uploadBytesResumable } from 'firebase/storage'
import {ref as realRef} from 'firebase/database'
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { AuthUserContext, FirebaseContext, SelectedChatContext } from '../../_layout'
import * as ImagePicker from 'expo-image-picker'
import PreloadImages from '../../components/PreloadImages'
import { fileStorage, rDatabase } from '../../../config/firebase'
import ChatItem from '../../components/ChatItem'
import CachedImage from '../../components/CachedImage'
import { onValue } from 'firebase/database'
import ChatItemContainer from '../../components/ChatItemContainer'
import shorthash from 'shorthash'
import UserImage from '../../components/UserImage'
import TimeAgo from '../../components/TimeAgo'
import { compareObjects } from '../_layout'
import ChatNavigationHeaderTitle from '../../components/ChatNavigationHeaderTitle'

const Chat = () => {
  // console.log('rerender', Platform.OS)
  // const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([])
  const [loading, setLoading] = useState(true);
  const [newMessageText, setNewMessageText] = useState('');
  const [preloadImages, setPreloadImages] = useState(null);
  const { database } = useContext(FirebaseContext);
  const { user } = useContext(AuthUserContext);
  const [chatUsersIsLoading, setChatUsersIsLoading] = useState(true);
  const [canLoadedMessages, setCanLoadedMessages] = useState(false); 
  const [messagesCount, setMessagesCount] = useState(null)
  const [lastLoadedId, setLastLoadedId] = useState(null)
  const [loadMessagesStatus, setLoadMessagesStatus] = useState(null)
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const preloadImagesCountError = preloadImages?.length > 4 ? true : false;
  const buttonDisable = preloadImages?.length > 5 || !preloadImages?.length && newMessageText === '';
  const {chatUsers, chatData, setChatUsers, setChatData, messages = [], setMessages} = useContext(SelectedChatContext)
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

  
  // ----------- виконується 3
  // ----------- виконується після завантаження всіх користувачів в чаті 
  // ----------- оримує повідомлення чату і стежить за їх оновленнями
  useEffect(() => {
    if(messagesCount){
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(30))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let newMessages = {}
      let messagesLenght = 0;
      let lastId = null;
      snapshot.docs.forEach((doc, index) => {
        const messageData = doc.data();
        const messageCreatedAt = new Date(messageData.createdAt.seconds * 1000)
        const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate(); 
        if(newMessages[messageSlug]){
          newMessages[messageSlug].push({...messageData, id: doc.id})
        }else{
          newMessages[messageSlug] = [
            {...messageData, id: doc.id}
          ]
        }
        lastId = doc.id;
        messagesLenght++;
        })
        // Object.keys(newMessages).forEach(key => {
        //   console.log('\n', key, ': ', newMessages[key])
        // })
        
        setMessages(newMessages)
        setLastLoadedId(lastId)
        setLoadMessagesStatus({
          messagesCount: messagesCount,
          loadedMessagesCount: messagesLength,
        })
    }, 
    (error) => {console.log(error, '----> firebase onSnapshot messages')})
    return () => unsubscribe();
    }
  }, [messagesCount])

  useEffect(() => {
    const setCount = async () => {
      setMessagesCount((await getCountFromServer(collection(database, 'messages', id, 'message'))).data().count)
    }
    setCount()
  }, [])

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

  const fetchPrevMessagess = async (loadedMessagesLength) => {
    console.log(loadedMessagesLength, messagesCount)
    if(loadedMessagesLength < messagesCount){
    setLoading(true)
    const docSnap = await getDoc(doc(database, "messages", id, "message", lastLoadedId));
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(30), startAt(docSnap))
    const oldMessages = await loadMessages(q)
   // setLoading(false)
    // setMessages(prev => {
    //   const prevKeys = Object.keys(prev);
    //   const assignMessages = prev;
    //   for (const key in oldMessages) {
    //     console.log(key, 'key')
    //     if(prevKeys.find(prevKey => prevKey === key)){
    //       assignMessages[key] = [
    //         ...assignMessages[key],
    //         ...oldMessages[key]
    //       ]  
    //     }else{
    //       assignMessages[key] = oldMessages[key]
    //     }
    //   }
    //   return assignMessages
    // })

     const prevKeys = Object.keys(messages);
      const assignMessages = messages;
      for (const key in oldMessages) {
        if(prevKeys.find(prevKey => prevKey === key)){
          assignMessages[key].push(...oldMessages[key])
        }else{
          assignMessages[key] = oldMessages[key]
        }
      }
    setMessages(assignMessages)
    setLoading(false)
    }
  }

  const loadMessages = async (query) => {
    const result = await getDocs(query)
    const oldMessages = {};
    console.log(result.docs.length, 'length-----')
    let lastLoaded = null;
    result.docs.forEach((doc, index) => {
      if(index !== 0){
        const messageData = doc.data();
        const messageCreatedAt = new Date(messageData.createdAt.seconds * 1000)
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

  const selectImages = async () => {
    if(preloadImagesCountError){
      Alert.alert('Error', 'Max count images is 5', [
        {
          text: 'OK'
        }
      ]);
    }
    else{
      const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: .4,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    }
    const result = await ImagePicker.launchImageLibraryAsync(options);
    if(!result.canceled){
      const images = result.assets.map(item => {
      if(item.type === 'image'){
        return {path: item.uri, progress: null}
      }
    })
    setPreloadImages(preloadImages ? [...preloadImages, ...images] : images)
    }
    }
  }

  const removePreloadImage = (image) => {
    if(preloadImages?.length === 1){
      setPreloadImages(null);
    }
    else{
      setPreloadImages(preloadImages.filter(preloadImage => preloadImage.path !== image));
    }
  }

  const sendMessage = async () => {
    if(!preloadImagesCountError){    
    let mediaItems = null;
    if(preloadImages?.length){
       mediaItems = await Promise.all(await preloadImages.map(async image => {
        return await uploadChatMedia(image.path)
      }))
    }
    const newText = newMessageText === '' ? null : newMessageText
    const data = {
      uid: user.uid,
      text: newText,
      media: mediaItems,
      createdAt: serverTimestamp()
    }
    setNewMessageText('');
    setPreloadImages(null)
    await addDoc(collection(database, 'messages', String(id), 'message'), data)
    }
  }  

  const uploadChatMedia = async (path) => {
    const fileName = path.split('/').pop();
    
    const response = await fetch(path).catch(err => console.log(err))
    const blobImage = await response.blob();
    
    const storageRef = ref(fileStorage, `media/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blobImage)
    uploadTask.on("state_changed", (snapshot => {
      const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
      setPreloadImages(images => images.map(img => {
        if(img.path === path){
          return {...img, progress}
        }
        return img
      }))
    }),
    (error => console.log('uploadTask.on error --------->', error))
    )
    return uploadTask.then(async data => {
      return await getDownloadURL(uploadTask.snapshot.ref).then(url => url)
    })
    .catch(error => console.log('uploadTask error -----> ', error))
  }

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
        : <ChatItemContainer messagesCount={messagesCount} chatData={chatData} chatUsers={chatUsers} messages={messages} selectedMessages={selectedMessages} updateSelectedMessages={updateSelectedMessages} loadPreviousMessages={loadPreviousMessages}/>
      }
      </>
      </ChatCanvas>
    <BottomContainer  
    behavior={Platform.OS === "ios" ? "padding" : undefined} 
    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    style={Platform.OS === 'ios' && {marginBottom: 20}}>
      {preloadImages && <PreloadImages images={preloadImages} removeImage={removePreloadImage}/>}
      <NewMessageContainer>
        <NewMessageButton onPress={selectImages}><Image style={{width: 25, height: 25, transform: [{ rotate: '90deg'}]}} source={require('../../../assets/back.png')}/></NewMessageButton>
        <NewMessageInput value={newMessageText} onChangeText={setNewMessageText} placeholder='Введіть повідомлення...'/>
        <NewMessageButton disabled={buttonDisable} style={buttonDisable ? {backgroundColor: 'gray'} : {}} onPress={sendMessage}><NewMessageText>Надіслати</NewMessageText></NewMessageButton>
      </NewMessageContainer>
    </BottomContainer>
    </>
  )
}


const CompanionMessages = styled.View`
background-color: #296314;
padding: 5px ;
margin: 2.5px 0;
align-self: flex-start;
border-radius: 0 12px 12px 12px;
flex-shrink: 1;
max-width: 80%;
`
const MessageButton = styled.TouchableOpacity`
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
background-color: red;
z-index: 1;
opacity: 0;
`
const ChatCanvas = styled.View`
background-color: #eaeaea; 
flex-shrink: 1;
flex-grow: 1;
`

const BottomContainer = styled.KeyboardAvoidingView`
background-color: #fff;
padding: 5px;
`
const NewMessageContainer = styled.View`
flex-direction: row;
gap: 10px;
flex-shrink: 1;
border-radius: 12px 12px 0 0;
`

const NewMessageInput = styled.TextInput`
border-radius: 12px;
padding: 5px 10px;
background-color: #fff;
border-color: #eaeaea;
border-width: 1px;
color: #000;
font-size: 14px;
font-weight: 400;
flex-grow: 1;
flex-shrink: 1;
`

const NewMessageButton = styled.TouchableOpacity`
padding: 5px 10px;
background-color: #1657f2;
border-radius: 12px;
align-items: center;
justify-content: center;
`

const NewMessageText = styled.Text`
font-size: 14px;
font-weight: 700;
color: #fff;
`

export default Chat