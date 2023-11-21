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
  const [loadMessagesCount, setLoadMessagesCount] = useState(null)
  const [loadMessagesStatus, setLoadMessagesStatus] = useState(null)
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const preloadImagesCountError = preloadImages?.length > 4 ? true : false;
  const buttonDisable = preloadImages?.length > 5 || !preloadImages?.length && newMessageText === '';
  const {chatUsers, chatData, setChatUsers, setChatData, messages, setMessages} = useContext(SelectedChatContext)
  //--------- виконується 1
  //--------- завантаження даних поточного чату
  //--------- встановлення поля lastSeen для залогіненого юзера в табл. chats значення - online
  //--------- при виході з чату в поле встановлюється значення new Date()
  useEffect(() => {
    const qChat = doc(database, "chats", id);
    const unsubscribe = onSnapshot(qChat, { includeMetadataChanges: true }, async (data) => {
      const chat = data.data();
      const newChatData = {...chat, id: data.id}
      // if(JSON.stringify(newChatData) !== JSON.stringify(chatData)){
        if(!compareObjects(newChatData, chatData)){
          setChatData(newChatData);
          // console.log('not equals', newChatData, chatData)
        }
        // console.log('chat data not equals', JSON.stringify(newChatData), '----------------', JSON.stringify(chatData))
      // }
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
          // <View style={{flexDirection: 'row', width: '90%', justifyContent: 'space-between'}}>
          //   <TouchableOpacity onPress={() => {router.push(`user/${user.id}`)}} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          //     <UserImage style={{width: 35, height: 35, borderRadius: 50, overflow: 'hidden', backgroundColor: "#eaeaea"}} imageUrl={user.image} />
          //     <View >
          //       <Text style={{fontSize: 18, fontWeight: 700}}>{user.displayName}</Text>
          //       <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
          //         {user.onlineStatus 
          //       ? 
          //         <>
          //           <View style={{width: 15, height: 15, borderRadius: 15, backgroundColor: 'green'}}></View>
          //           <Text>Зараз онлайн</Text>
          //         </>
          //       : 
          //         <>
          //           <View style={{width: 15, height: 15, borderRadius: 15, backgroundColor: 'gray'}}></View>
          //           <TimeAgo date={user.timeStamp} textAfter="тому"/>
          //         </>
          //       }
          //       </View>
          //     </View>
          //   </TouchableOpacity>
          //   {selectedMessages.length > 0 
          //     ? <TouchableOpacity onPress={() => deleteMessages(selectedMessages)} style={{alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          //       <Image style={{width: 30, height: 30}} source={require('../../../assets/delete.png')} />
          //       <View style={{position: 'absolute', top: -3, right: -3, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8, backgroundColor: 'blue'}}>
          //         <Text style={{fontWeight: 700, color: '#fff', fontSize: 12}}>
          //           {selectedMessages.length}
          //         </Text>
          //       </View>
          //     </TouchableOpacity>
          //     : <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center'}} onPress={openChatInfo}>
          //       <View style={{width: 30, height: 30}}>
          //         <Image source={require('../../../assets/chat-info.png')} style={{height: '100%', width: '100%'}}/>
          //       </View>
          //     </TouchableOpacity>
          //   }
          // </View>
      })
    }
  }, [chatUsers, selectedMessages])

  // ----------- виконується 3
  // ----------- виконується після завантаження всіх користувачів в чаті 
  // ----------- оримує повідомлення чату і стежить за їх оновленнями
  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(30))
      const loadedMessages = await loadMessages(q);
      const countMessages = (await getCountFromServer(collection(database, 'messages', id, 'message'))).data().count
        if(!compareObjects(loadedMessages, messages)){
          setMessages(loadedMessages)
        }
        setLoadMessagesStatus({
          messagesCount: countMessages,
          loadedMessagesCount: loadedMessages.length,
          canLoadedMessages: true
        })
    }
    if(!chatUsersIsLoading){
    fetchMessages();
    const snapshotQ = query(collection(database, 'messages', String(id), 'message'))

    const unsubscribe = onSnapshot(snapshotQ, async (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if(change.type === 'modified'){
          const addedMessage = change.doc.data()
          setMessages(m => [addedMessage, ...m])
        }
      })
    })
    return () => unsubscribe();
    }
  }, [chatUsersIsLoading])

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
    fetchPrevMessagess()
  })

  const fetchPrevMessagess = async () => {
    if(loadMessagesStatus.loadedMessagesCount < loadMessagesStatus.messagesCount){
    setLoadMessagesStatus(status => ({
      ...status,
      canLoadedMessages: false
    }))
    setLoading(true)
    const lastDoc = messages[messages.length - 1]
    const docSnap = await getDoc(doc(database, "messages", id, "message", lastDoc.id));
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(30), startAt(docSnap))
    const newMessages = await loadMessages(q)
    setLoading(false)
    newMessages.shift();
    if(newMessages.length === 0) setHasNextMessages(false)
    else {
      setMessages(m => [...m, ...newMessages])
    }
    setLoadMessagesStatus(prevStatus => ({
      ...prevStatus,
      loadedMessagesCount: prevStatus.loadedMessagesCount + newMessages.length,
      canLoadedMessages: true
    }))
    }
  }

  const loadMessages = async (query) => {
    const result = await getDocs(query)
    const messages = result.docs.map(doc => {
      const message = doc.data()
      const userImage = chatUsers.find(chatUser => chatUser.id === message.uid)?.image 
              ? chatUsers.find(chatUser => chatUser.id === message.uid).image
              : null
              return {
                ...message,
                id: doc.id,
                userImage
              }          
            })
    setLoading(false)
    return messages
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
    if(preloadImages.length === 1){
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

  return (
    <>
    <ChatCanvas>
      <> 
      { loading && <ActivityIndicator style={{alignSelf: 'center'}} color={'blue'} size={'large'}/>}
      {messages.length === 0 
        ? <View>
            <Text>No data</Text>
          </View>
        : <ChatItemContainer loadMessagesStatus={loadMessagesStatus} messages={messages} selectedMessages={selectedMessages} updateSelectedMessages={updateSelectedMessages} loadPreviousMessages={loadPreviousMessages}/>
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