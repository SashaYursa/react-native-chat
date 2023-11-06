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
  limit
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { AuthUserContext, FirebaseContext } from '../../_layout'
import * as ImagePicker from 'expo-image-picker'
import PreloadImages from '../../components/PreloadImages'
import { fileStorage } from '../../../config/firebase'
import ChatItem from '../../components/ChatItem'
import CachedImage from '../../components/CachedImage'

export const ChatContext = createContext({});

const Chat = () => {
  const [chatData, setChatData] = useState(null)
  const [messages, setMessages] = useState([]);
  const [unhandledMessages, setUnhandledMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessageText, setNewMessageText] = useState('');
  const [preloadImages, setPreloadImages] = useState(null);
  const {auth, database} = useContext(FirebaseContext);
  const [uploadImageProgress, setUploadImageProgress] = useState(null);
  const { user } = useContext(AuthUserContext);
  const [chatUsers, setChatUsers] = useState([]);
  const [chatUsersIsLoading, setChatUsersIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState({id: 123, displayName: '123'});
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const preloadImagesCountError = preloadImages?.length > 4 ? true : false;
  const buttonDisable = preloadImages?.length > 5 || !preloadImages?.length && newMessageText === '';

  //--------- виконується 1
  //--------- завантаження даних поточного чату
  //--------- встановлення поля lastSeen для залогіненого юзера в табл. chats значення - online
  //--------- при виході з чату в поле встановлюється значення new Date()
  useEffect(() => {
    const qChat = doc(database, "chats", id);
    const unsubscribe = onSnapshot(qChat, { includeMetadataChanges: true }, async (data) => {
      const chat = data.data();
      let currentUserInfo = null;
      chat.usersInfo.forEach((currentUser, index) => {
        if(currentUser.id === user.uid){
          currentUserInfo = {info: {...currentUser, lastSeen: 'online'}, index};
        }
      })
      if(chat.usersInfo[currentUserInfo.index].lastSeen !== 'online'){
        chat.usersInfo[currentUserInfo.index] = currentUserInfo.info;
        await setDoc(doc(database, "chats", id), chat);
      }
      setChatData(chat);
    })
    return async () => {
      unsubscribe();
      console.log('leave')
      let chat = await getDoc(qChat)
      chat = chat.data();
      const leaveUserChatInfo =  chat.usersInfo.map(userInfo => {
        if(userInfo.id === user.uid){
          return {
            ...userInfo,
            lastSeen: new Date()
          }
        }
        return userInfo
      })
      chat.usersInfo = leaveUserChatInfo;
      setDoc(doc(database, "chats", id), chat)
    }
  }, [id])

  //------ виконується 2
  //------ завантаження користувачів чату
  //------ виконується після завантаження чату
  //------ отрмання всіх користувачів чату, які є в даному чаті по айді
  useEffect(() => {
    if(chatData !== null && chatUsersIsLoading){
      getUsers(chatData.users)
    }
  }, [chatData])

  //----- виконується 3
  //----- встановлення даних про співрозмовника в хедері чату
  //----- виконується після завантаження користувачів чату
  useLayoutEffect(() => {
    if(!chatUsersIsLoading){
      const user = chatUsers[0];
      const userLastSeen = chatData.usersInfo.find(userInfo => userInfo.id === user.id).lastSeen;
      const userIsOnline = userLastSeen === 'online' && user.status !== 'offline';

      navigation.setOptions({
        headerTitle: () => (
          <TouchableOpacity onPress={() => {router.push(`user/${user.id}`)}} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <UserImage style={{width: 35, height: 35, borderRadius: 50, overflow: 'hidden', backgroundColor: "#eaeaea"}} imageUrl={user.image} />
            <Text style={{fontSize: 18, fontWeight: 700}}>{user.displayName}</Text>
            <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
              {userIsOnline 
            ? 
              <>
                <View style={{width: 15, height: 15, borderRadius: 15, backgroundColor: 'green'}}></View>
                <Text>Зараз в чаті</Text>
              </>
            : 
              <>
                <View style={{width: 15, height: 15, borderRadius: 15, backgroundColor: 'gray'}}></View>
                <Text>Не онлайн</Text>
              </>
            }
            </View>
          </TouchableOpacity>
        )
      })
    }
  }, [chatUsersIsLoading, chatData])

  // ----------- виконується 3
  // ----------- виконується після завантаження всіх користувачів в чаті 
  // ----------- оримує повідомлення чату і стежить за їх обновленнями
  useEffect(() => {
    if(!chatUsersIsLoading){
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'desc'), limit(50))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newMessages = await Promise.all(snapshot.docs.map(element => {
        const data = element.data();
        const userImage = chatUsers.find(chatUser => chatUser.id === data.uid)?.image 
        ? chatUsers.find(chatUser => chatUser.id === data.uid).image
        : null
        return {
          ...data,
          id: element.id,
          userImage,
          selected: false
        }
      }))
      setLoading(false)
      setMessages(newMessages)
    })
    return () => unsubscribe();
    }
  }, [chatUsersIsLoading])

    //--------------- обновляє поле users.lastCheckedStatus в таблиці chats за user.uid
    //--------------- потрібна для відстеження онлайн статусу


    //--------------- отримує користувача з яким спілкується залогінений користувач із таблиці users,
    //--------------- слідкує за тим, чи користувач знаходиться в чаті
    //--------------- чи користувач оновив свій час останнього відвідування(викликається кожні 5 сек)
  // useEffect(() => {
  //   if(chatUsers[0]?.id){
  //   const qProfile = doc(database, 'users', chatUsers[0].id);
  //   let timeout = setTimeout(() => {
  //     console.log('he not in chat')
  //     //TODO викликати функцію, яка задасть статус користувача з яким спілкуються - не онлайн
  //   }, 7000);
  //   const unsubscribe = onSnapshot(qProfile, { includeMetadataChanges: true }, async (data) => {
  //     clearTimeout(timeout);
  //     timeout = setTimeout(() => {
  //       console.log('he is out')
  //     }, 7000);
  //   })
  //   return () => unsubscribe()
  //   }
  //   //return () => unsubscribe(); 
  // }, [chatUsers])

  //------- вибірка даних всіх користувачів в даному чаті,
  //------- встановлення їх в змінну chatUsers
  //------- встановлення в chatUsersIsLoading - false
  const getUsers = async (ids) => {
    setChatUsersIsLoading(true)
    const chatUsers = [];
    for(const id of ids){
      if(user.uid !== id){
        const qUser = query(collection(database, "users"), where("id", "==", id))
        let res = await getDocs(qUser);
        res = await Promise.all(res.docs.map(item => item.data()))
        chatUsers.push(await res[0])
      }
    }
    setChatUsers(chatUsers);
    setChatUsersIsLoading(false)
  }
  
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
    await addDoc(collection(database, 'messages', String(id), 'message'),data)
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
    <ChatContext.Provider value={{chatData}}>
    <ChatCanvas>
      { loading 
      ? <ActivityIndicator style={{alignSelf: 'center'}} color={'blue'} size={'large'}/>
      : messages.length === 0
        ? <View>
            <Text>No data</Text>
          </View>
        : <ChatContent messages={messages} setMessages={setMessages}/>
      }
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
    </ChatContext.Provider>
  )
  // return(
  //   <View>
  //     <Text>
  //       Chat
  //     </Text>
  //   </View>
  // )
}
export const UserImage = React.memo(({imageUrl, style}) => {
  return imageUrl === null 
  ? <Image source={require('../../../assets/default-chat-image.png')} style={style}/> 
  :  <CachedImage style={style} url={imageUrl}/>
 
})

const ChatContent = React.memo(({messages, setMessages}) => {
  const {user} = useContext(AuthUserContext);
  useEffect(() => {

  }, [user])
  const openImage = (imageId) => {
    console.log('openedImage: ', imageId)
  }
  const selectMessage = (index) => {
    setMessages(messages => {
      const newMessages = Array.from(messages);
      newMessages[index].selected = !messages[index].selected
      return newMessages;
    })
  }
  
  const rerenderItem = useCallback(({ item, index }) => {
    const selected = item.selected ? {
      backgroundColor: '#85aded'
    }
    : {

    }
    return(
      <MessagesContainer 
      delayLongPress={300} 
      onLongPress={() => {selectMessage(index)}} 
      activeOpacity={1} 
      style={item.uid == user.uid 
      ? {justifyContent: 'flex-end', ...selected} 
      : {justifyContent: 'flex-start', ...selected} }>
        <ChatItem item={item} index={index} openImage={openImage} selectMessage={selectMessage} />
      </MessagesContainer>
      )
  }, [])
  
  return (
    <ChatScroll contentContainerStyle={{paddingVertical: 10}} 
                inverted showsVerticalScrollIndicator={false} 
                data={messages} 
                renderItem={rerenderItem} />
  )
})

const MessagesContainer = styled.TouchableOpacity`
flex-direction: row;
align-items: flex-end;
width: 100%;
gap: 10px;
padding: 2.5px 0;
position: relative;
`
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
const ChatScroll = styled.FlatList`
padding: 0 5px;
flex-direction: column;
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