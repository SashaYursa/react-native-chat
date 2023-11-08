import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { memo, useState } from 'react'
import styled from 'styled-components'
import BackButton from './Buttons/BackButton'
import EditUserForm from './Forms/EditUserForm';
import { auth, database, fileStorage } from '../../config/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import * as Progress from 'react-native-progress';
import { setDoc, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
const EditUser = ({user, updateCurrentUser, setDisplayModal, uploadUser}) => {

    const [uploadImageStatus, setUploadImageStatus] = useState(null);

    const uploadUserImage = async (path) => {
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

    const updateUser = async (updateData) => {
        let image = updateData.image;
        if(updateData.uploadedImage !== null){
        console.log('updated')
        image = await uploadUserImage(updateData.uploadedImage);
        }

        const userDocRef = doc(database, 'users', user.id)
        const updatedUser = {
            ...user,
            image,
            displayName: updateData.displayName
        }

        await setDoc(userDocRef, updatedUser).catch(error => {
            console.log('setDoc error in EditUser --->', error)
        })

        await updateProfile(auth.currentUser, {
        displayName: updateData.displayName, 
        photoURL: image
        })
        .then(() => {
            updateCurrentUser(updatedUser)
        })
        .catch(error => console.log('updateProfile error in EditUser --->', error))
    }
    console.log(uploadImageStatus)
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