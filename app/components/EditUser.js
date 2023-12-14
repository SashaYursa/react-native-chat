import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { memo, useEffect, useState } from 'react'
import styled from 'styled-components'
import BackButton from './Buttons/BackButton'
import EditUserForm from './Forms/EditUserForm';
import { auth, database, fileStorage } from '../../config/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import * as Progress from 'react-native-progress';
import { setDoc, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { setUploadUserImageStatus } from '../store/features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useUpdateUserMutation } from '../store/features/auth/authApi';
const EditUser = ({user, setDisplayModal, uploadUser}) => {
    const uploadImageStatus = useSelector(state => state.auth.uploadUserImageStatus)
    const [updateUserMutation, {error: updateUserError, data: updateUserData}] = useUpdateUserMutation()
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setUploadUserImageStatus(null))
    }, [])

    useEffect(() => {
        if(updateUserData){
            setDisplayModal(false)
        }
    }, [updateUserData])
    useEffect(() => {
        console.log('update user error', updateUserError)
    }, [updateUserError])

    const updateUser = async (updateData) => {
        updateUserMutation({user, updateData, setUploadUserImageStatus})
    }
    return (
        <Container>
            {
                uploadImageStatus 
                ?   <UploadContainer>
                        <Progress.Bar progress={uploadImageStatus} width={200} />
                    </UploadContainer>
                : null
            }
            <EditWrapper contentContainerStyle={{paddingVertical: 50}}>
                <BackButtonContainer>
                    <BackButton onPress={() => setDisplayModal(false)}/>
                </BackButtonContainer>
                <EditUserForm userData={user} updateUser={updateUser}/>
            </EditWrapper>
        </Container>
    )
}

const Container = styled.View`
flex-grow: 1;
background-color: #fff;
position: relative;
`

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

const BackButtonContainer = styled.View`
flex-direction: row;
align-items: flex-start;
justify-content: flex-start;
`

const EditWrapper = styled.ScrollView`
flex-grow: 1;
`


export default EditUser