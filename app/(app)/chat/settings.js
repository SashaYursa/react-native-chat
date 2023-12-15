import { View, Text, SafeAreaView, Platform, Button } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import EditChatForm from '../../components/Forms/EditChatForm'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { database, fileStorage } from '../../../config/firebase'
import { useDispatch, useSelector } from 'react-redux'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { setUploadChatImageStatus } from '../../store/features/chats/chatsSlice'
import { useUpdateChatMutation } from '../../store/features/chats/chatsApi'
import * as Progress from 'react-native-progress';
import { goBack } from 'expo-router/src/global-state/routing'
const Settings = () => {
    const { id } = useLocalSearchParams()
    const chatData = useSelector(state => state.chats.chats.find(chat => chat.id === id))
    const uploadChatImageStatus = useSelector(state => state.chats.uploadChatImageStatus)
    const user = useSelector(state => state.auth.user)
    const [updateChatAction, {error: updateChatError, data: updateChatData}] = useUpdateChatMutation()
    const dispatch = useDispatch()
    const router = useRouter()

    useEffect(() => {
        if(uploadChatImageStatus){
        dispatch(setUploadChatImageStatus(null))
        }
    }, [])
    useEffect(() => {
        if(updateChatData){
            router.back()
        }
    }, [updateChatData])

    const updateChat = async (updateData) => {
        updateChatAction({updateData, chatData, setUploadChatImageStatus})
    }
    
    return (
        <Container>
        {
            uploadChatImageStatus ?
            <UploadContainer>
                <Progress.Bar progress={uploadChatImageStatus} width={200} />
            </UploadContainer>
            : null
        }
        {Platform.OS === 'ios' &&
            <Header>
                <Button  title='Back' onPress={() => {
                    router.back()
                }}/>
                <HeaderTitle>
                    Chat settings
                </HeaderTitle>
                {/* <></> */}
                <Button disabled color='#fff' title='Save' onPress={() => {
                }}/>
            </Header>
        }
        <EditChatForm chatData={chatData} updateChat={updateChat} />
        </Container>
        
    )
}
const UploadContainer = styled.View`
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
background-color: rgba(0, 0, 0, 0.52);
z-index: 3;
align-items: center;
justify-content: center;
`
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