import { Alert, KeyboardAvoidingView, Text, TouchableOpacity, TextInput, View, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import PreloadImages from './PreloadImages'
import * as ImagePicker from 'expo-image-picker'
import { fileStorage, rDatabase } from '../../config/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { AuthUserContext, FirebaseContext } from '../_layout'
import { getDownloadURL, ref, getStorage, deleteObject, uploadBytesResumable } from 'firebase/storage'

const ChatActions = ({id}) => {
  const [preloadImages, setPreloadImages] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const preloadImagesCountError = preloadImages?.length > 5;
  const buttonDisable = preloadImagesCountError || (!preloadImages?.length && !newMessageText.trim());
  const {database} = useContext(FirebaseContext);
  const {user} = useContext(AuthUserContext);
  const removePreloadImage = (image) => {
    if(preloadImages?.length === 1){
      setPreloadImages(null);
    }
    else{
      setPreloadImages(preloadImages.filter(preloadImage => preloadImage.path !== image));
    }
  }

  const selectImages = async () => {
    if(preloadImages?.length > 4){
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
      createdAt: serverTimestamp(),
      isRead: [user.uid]
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
    <Container  
    behavior={Platform.OS === "ios" ? "padding" : undefined} 
    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    style={Platform.OS === 'ios' && {marginBottom: 20}}>
      {preloadImages && <PreloadImages images={preloadImages} removeImage={removePreloadImage}/>}
      <NewMessageContainer>
        <NewMessageButton onPress={selectImages}>
          <Image style={{width: 25, height: 25, transform: [{ rotate: '90deg'}]}} source={require('../../assets/back.png')}/>
        </NewMessageButton>
        <NewMessageInput value={newMessageText} onChangeText={setNewMessageText} placeholder='Введіть повідомлення...'/>
        <NewMessageButton disabled={buttonDisable} style={buttonDisable ? {backgroundColor: 'gray'} : {}} onPress={sendMessage}>
          <NewMessageText>
            Надіслати
          </NewMessageText>
        </NewMessageButton>
      </NewMessageContainer>
    </Container>
  )
}

const Container = styled.KeyboardAvoidingView`
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
const NewMessageText = styled.Text`
font-size: 14px;
font-weight: 700;
color: #fff;
`
const NewMessageButton = styled.TouchableOpacity`
padding: 5px 10px;
background-color: #1657f2;
border-radius: 12px;
align-items: center;
justify-content: center;
`

export default ChatActions