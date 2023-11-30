import { View, Text, SafeAreaView, Platform, Button } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { AuthUserContext, SelectedChatContext } from '../../_layout'
import EditChatForm from '../../components/Forms/EditChatForm'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { database, fileStorage } from '../../../config/firebase'
const Settings = () => {
  const {chatData, setChatData} = useContext(SelectedChatContext)
  const { user } = useContext(AuthUserContext)
  const [uploadImageStatus, setUploadImageStatus] = useState(null);
  useEffect(() => {
    console.log(uploadImageStatus, 'status--->')
  }, [uploadImageStatus])
  const uploadChatImage = async (path) => {
        const fileName = path.split('/').pop();
        
        const response = await fetch(path).catch(err => console.log(err))
        const blobImage = await response.blob();
        
        const storageRef = ref(fileStorage, `usersImages/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, blobImage)
        uploadTask.on("state_changed", (snapshot => {
          const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100) / 100
            setUploadImageStatus(progress)
        }),
        (error => console.log('uploadTask.on error --------->', error))
        )
        return uploadTask.then(async () => {
          return await getDownloadURL(uploadTask.snapshot.ref).then(url => url)
        })
        .catch(error => console.log('uploadTask error -----> ', error))
    }

    const updateChat = async (updateData) => {
        let image = updateData.image;
        if(updateData.uploadedImage !== null){
        console.log('updated')
        image = await uploadChatImage(updateData.uploadedImage);
        }

        const chatDocRef =  doc(database, 'chats', chatData.id)
        const updatedChat = {
          image,
          name: updateData.chatName
        }
        
        await updateDoc(chatDocRef, updatedChat).catch(error => {
            console.log('setDoc error in EditChat --->', error)
        })
    }
  return (
    <Container>
      <Header>
        <Button  title='Back' onPress={() => {
            router.back()
        }}/>
        <HeaderTitle>
            Chat settings
        </HeaderTitle>
        <Button  title='Save' onPress={() => {
        }}/>
      </Header>
      <EditChatForm chatData={chatData} updateChat={updateChat} />
    </Container>
    
  )
}
const Container = styled.SafeAreaView`
flex-grow: 1;
background-color: #fff;
`
const Header = styled.View`
flex-direction: row;
justify-content: space-between;
border-bottom-width: 1px;
border-color: #e6e6e6;
padding: 5px;
align-items: center;
`
const HeaderTitle = styled.Text`
font-size: 18px;
font-weight: 700;
color: #000;
`

export default Settings