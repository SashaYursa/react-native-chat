import { View, Text, Image, TouchableOpacity, Modal, Pressable, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AuthUserContext } from '../../../_layout'
import User from '../../../components/User';
import styled from 'styled-components';
import { DrawerToggleButton } from '@react-navigation/drawer';
import EditUser from '../../../components/EditUser';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { database } from '../../../../config/firebase';
import { auth } from '../../../../config/firebase';
import { signOut, updateProfile } from "firebase/auth";
import { router } from 'expo-router';
import { Button } from 'react-native-paper';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { fileStorage } from '../../../../config/firebase';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
const Profile = ({}) => {
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(true)
  const [displayModal, setDisplayModal] = useState(false)
  const [userData, setUserData] = useState(null)
  const [uploadImageStatus, setUploadImageStatus] = useState(null)
  useEffect(() => {
    setLoading(true)
    const getUser = async () =>{
    const qUser = query(collection(database, "users"), where("id", "==", user.uid))
    let res = await getDocs(qUser);
    res = await Promise.all(res.docs.map(item => item.data()))
    setUserData(await res[0]);
    setLoading(false)
    } 
    getUser()
  }, [user.uid])

  const handleEditUser = () => {
    setDisplayModal(displayModal => !displayModal)
  }

  const updateCurrentUser = async (updateData) => {
    console.log(updateData, 'ddddd')
    setUserData(updateData);
    setDisplayModal(false);
  }

  useEffect(() => {
    console.log(uploadImageStatus, 'preload')
  }, [uploadImageStatus])

  const logout = () => {
    ReactNativeAsyncStorage.removeItem("email")
    ReactNativeAsyncStorage.removeItem("password")
    signOut(auth).then(()=> {
      router.push('auth/Login')
    })
  }
  if(displayModal){
    return (
      <Modal animationType='slide'>
        <EditUser setDisplayModal={setDisplayModal} user={userData} updateCurrentUser={updateCurrentUser}/>
      </Modal>
    )
  }
  return loading 
  ? (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <ActivityIndicator size='large'/>
    </View>
  )
  : (
    <SafeArea>
    <Container>
    <TopButtonsContainer>
      <TopButton>
        <DrawerToggleButton tintColor='#fff' backgroundColor="#000"/>
      </TopButton>
      <TopButton>
        <EditButton activeOpacity={1} onPress={handleEditUser}>
          <Image source={require('../../../../assets/edit.png')} style={{width: 20, height: 20}}/>
        </EditButton>
      </TopButton>
    </TopButtonsContainer>
    <User user={userData}>
    <ActionContainer>
      <ActionData>
      </ActionData>
      <Button style={{justifySelf: 'flex-end'}} icon="logout" mode="elevated" textColor='#000' onPress={logout}>
        Logout
      </Button>
    </ActionContainer>
    </User>
    </Container>
    </SafeArea>
  )
}

const SafeArea = styled.View`
padding: 15px 0;
overflow: hidden;
background-color: #fff;
`
const Container = styled.View`
position: relative;
`
const TopButtonsContainer = styled.View`
flex-direction: row;
justify-content: space-between;
flex-grow: 1;
position: absolute;
top: 40px;
right: 10px;
left: 10px;
z-index: 2;
`
const TopButton = styled.View`
align-items: center;
justify-content: center;
background-color: #000;
border-radius: 12px;
padding: 2px;
`

const EditButton = styled.TouchableOpacity`
background-color: #000;
border-radius: 6px;
margin: 5px 12px;
`
const ActionContainer = styled.View`
flex-grow: 1;
flex-direction: column;
`
const ActionData = styled.View`
flex-grow: 1;
`

const LogoutButton = styled.Button`

`

export default Profile