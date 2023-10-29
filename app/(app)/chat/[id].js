import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, PermissionsAndroid, FlatList, Alert } from 'react-native'
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  const chatScroll = useRef();
  const preloadImagesCountError = preloadImages?.length > 4 ? true : false;
  const buttonDisable = preloadImages?.length > 5 || !preloadImages?.length && newMessageText === '';
  useEffect(() => {
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newMessages = await Promise.all(snapshot.docs.map(element => {
        return {
          ...element.data(),
          id: element.id
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
        : <ChatScroll ref={chatScroll} inverted showsVerticalScrollIndicator={false} data={messages} renderItem={(({ item }) => {
          if(item.uid == user.uid) {
            return (
              <MyMessage key={item.id}>
                {item?.media?.length &&
                <MessageImagesContainer>
                  {item.media.map(image => (
                  <MessageImageContainer>
                    <MessageImage source={{uri: image}}/>
                  </MessageImageContainer>
                  ))}
                </MessageImagesContainer>
                }
                {item.text !== null &&
                <MessageText>
                  {item.text}
                </MessageText>
                }
              </MyMessage>
            )
          } 
          else{
            return (
              <CompanionMessagesContainer key={item.id}>
                <CompanionImageContainer>
                  <CompanionImage source={{uri: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png'}}/>
                </CompanionImageContainer>
                <CompanionMessages>
                {item?.media?.length &&
                <MessageImagesContainer>
                  {item.media.map(image => (
                  <MessageImageContainer>
                    <MessageImage source={{uri: image}}/>
                  </MessageImageContainer>
                  ))}
                </MessageImagesContainer>
                }
                {item.text !== null &&
                <MessageText>
                  {item.text}
                </MessageText>
                }
                </CompanionMessages>
              </CompanionMessagesContainer>
            )
          }
        })}>
        </ChatScroll>
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

const MyMessage = styled.View`
background-color: #183373;
padding: 5px;
margin-top: 5px;
align-self: flex-end;
border-radius: 12px 0 12px 12px;
flex-shrink: 1;
max-width: 80%;
`
const CompanionMessagesContainer = styled.View`
flex-direction: row;
align-items: flex-end;
gap: 10px;

`
const CompanionMessages = styled.View`
background-color: #296314;
padding: 5px;
margin-top: 5px;
align-self: flex-end;
border-radius: 0 12px 12px 12px;
flex-shrink: 1;
max-width: 80%;
`

const CompanionImageContainer = styled.View`

`
const CompanionImage = styled.Image`
width: 30px;
height: 30px;
border-radius: 15px;
background-color: gray;
`

const MessageImagesContainer = styled.View`
flex-direction: row;
flex-wrap: wrap;
gap: 5px;
width: 100%;
`
const MessageImageContainer = styled.View`
width: 49%;
height: 200px;
border-radius: 12px;
overflow: hidden;
flex-grow: 1;
`

const MessageImage = styled.Image`
width: 100%;
height: 100%;
object-fit: cover;
`


const MessageText = styled.Text`
font-size: 14px;
font-weight: 400;
color: #fff;
padding: 2px 5px;
`

const ChatCanvas = styled.View`
background-color: #eaeaea;
padding: 10px 0; 
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