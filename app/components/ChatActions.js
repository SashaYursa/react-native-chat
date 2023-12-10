import { Alert, KeyboardAvoidingView, Text, TouchableOpacity, TextInput, View, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import PreloadImages from './PreloadImages'
import * as ImagePicker from 'expo-image-picker'
import { fileStorage, rDatabase } from '../../config/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { AuthUserContext, FirebaseContext } from '../_layout'
import { getDownloadURL, ref, getStorage, deleteObject, uploadBytesResumable } from 'firebase/storage'
import { useDispatch, useSelector } from 'react-redux'
import { useSendMessageMutation, useUploadChatMediaMutation } from '../store/features/messages/messagesApi'
import { addMediaItems, removeAllMediaItems, removeMediaItem, setMediaUploadStatus } from '../store/reducers/mediaUpload'
import { addLastMessage } from '../store/features/messages/messagesSlice'

const ChatActions = ({id}) => {
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch()
    const preloadImages = useSelector(state => state.mediaUpload.mediaItems)
  const [newMessageText, setNewMessageText] = useState('');
  const [sendMessage, {isLoading: sendMessageIsLoading, error: senddMessageError}] = useSendMessageMutation()
  const preloadImagesCountError = preloadImages?.length > 5;
  const buttonDisable = preloadImagesCountError || (!preloadImages?.length && !newMessageText.trim());
  const removePreloadImage = (image) => {
    dispatch(removeMediaItem(image))
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
        return {
            name: item.uri, 
            statusUpload: null
        }
      }
    })
    dispatch(addMediaItems(images))
    }
    }
  }

  const sendMessageHandler = async () => {
    if(!preloadImagesCountError){ 
        let media = null
        if(preloadImages.length){
            console.log(preloadImages)
            media = await Promise.all(preloadImages.map(async ({name}) => {
                return await uploadChatMediaItem(name)
            })) 
        }
        sendMessage({media, userId: user.uid, text: newMessageText, chatId: id, addMessage: addLastMessage})
        setNewMessageText('');
        dispatch(removeAllMediaItems())
    }
  } 

  const uploadChatMediaItem = async (path) => {
    const fileName = path.split('/').pop();
    
    const response = await fetch(path).catch(err => console.log(err))
    const blobImage = await response.blob();
    
    const storageRef = ref(fileStorage, `media/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blobImage)
    uploadTask.on("state_changed", (snapshot => {
      const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
      dispatch(setMediaUploadStatus({name: path, statusUpload: progress}))
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
        <NewMessageButton disabled={buttonDisable} style={buttonDisable ? {backgroundColor: 'gray'} : {}} onPress={sendMessageHandler}>
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