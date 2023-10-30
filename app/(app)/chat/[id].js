import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, PermissionsAndroid, FlatList, Alert } from 'react-native'
import React, { memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  getDocs
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { AuthUserContext, FirebaseContext } from '../../_layout'
import * as ImagePicker from 'expo-image-picker';
import PreloadImages from '../../components/PreloadImages'
import { fileStorage } from '../../../config/firebase'
import ChatItem from '../../components/ChatItem'
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessageText, setNewMessageText] = useState('');
  const [preloadImages, setPreloadImages] = useState(null);
  const {auth, database} = useContext(FirebaseContext);
  const [uploadImageProgress, setUploadImageProgress] = useState(null);
  const { user } = useContext(AuthUserContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const preloadImagesCountError = preloadImages?.length > 4 ? true : false;
  const buttonDisable = preloadImages?.length > 5 || !preloadImages?.length && newMessageText === '';
  useEffect(() => {
    console.log('rere')
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newMessages = await Promise.all(snapshot.docs.map(element => {
        return {
          ...element.data(),
          id: element.id,
          selected: false
        }
      }))
      setLoading(false)
      setMessages(newMessages.reverse())
    })
    return () => unsubscribe();
  }, [])
  useLayoutEffect(() => {
    if(!chat){
      getChat();
    }
    else{
      if(chat.type === "private"){
        if(selectedUser === null){
          getUser(chat.users.find(id => id !== user.uid))
        }
        else{
          navigation.setOptions({
            headerTitle: () => (
              <TouchableOpacity onPress={() => {router.push(`(drawer)/user/${selectedUser.id}`)}} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Image style={{width: 35, height: 35, borderRadius: 50, overflow: 'hidden', backgroundColor: "#eaeaea"}} source={selectedUser.image === null ? require('../../../assets/default-chat-image.png') : {uri: selectedUser.image}} />
                <Text style={{fontSize: 18, fontWeight: 700}}>{selectedUser.displayName}</Text>
              </TouchableOpacity>
            )
          })
        }
      }
    }
  }, [chat, selectedUser])


  const getChat = async () => {
    const qChat = doc(database, "chats", id);
    const chat = await getDoc(qChat);
    setChat(chat.data());
  } 
  const getUser = async (id) => {
    console.log(id, 'id')
    const qUser = query(collection(database, "users"), where("id", "==", id))
    let res = await getDocs(qUser);
    res = await Promise.all(res.docs.map(item => item.data()))
    setSelectedUser(await res[0]);
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

  return (
    <>
    <ChatCanvas>
      { loading 
      ? <ActivityIndicator style={{alignSelf: 'center'}} color={'blue'} size={'large'}/>
      : messages.length === 0
        ? <View>
            <Text>No data</Text>
          </View>
        : <ChatList messages={messages} setMessages={setMessages}/>
      }
      </ChatCanvas>
    <BottomContainer>
      {preloadImages && <PreloadImages images={preloadImages} removeImage={removePreloadImage}/>}
      <NewMessageContainer>
        <NewMessageButton onPress={selectImages}><Image style={{width: 25, height: 25, transform: [{ rotate: '90deg'}]}} source={require('../../../assets/back.png')}/></NewMessageButton>
        <NewMessageInput value={newMessageText} onChangeText={setNewMessageText} placeholder='Ввеідть повідомлення...'/>
        <NewMessageButton disabled={buttonDisable} style={buttonDisable ? {backgroundColor: 'gray'} : {}} onPress={sendMessage}><NewMessageText>Надіслати</NewMessageText></NewMessageButton>
      </NewMessageContainer>
    </BottomContainer>
    </>
  )
}

const ChatList = React.memo(({messages, setMessages}) => {
  const {user} = useContext(AuthUserContext);
  useEffect(() => {
    console.log('data upd')
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
      <MessagesContainer delayLongPress={300} onLongPress={() => {selectMessage(index)}} activeOpacity={1} style={item.uid == user.uid ? {justifyContent: 'flex-end', ...selected} : {justifyContent: 'flex-start', ...selected} }>
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
const BottomContainer = styled.View`
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