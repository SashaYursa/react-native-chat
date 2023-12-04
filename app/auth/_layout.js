import { View, Text, Pressable } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { Stack } from 'expo-router/stack'
import styled from 'styled-components'
import { Redirect, useRouter } from 'expo-router'
import { useSelector } from 'react-redux'
import { useLoginMutation } from '../store/features/auth/authApi'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const AuthLayout = () => {
  const router = useRouter();
  const [login] = useLoginMutation()
  const user = useSelector(state => state.auth.user);
  useEffect(() => {
    const autoLogin = async () => {
      const email = await ReactNativeAsyncStorage.getItem("email")
      const password = await ReactNativeAsyncStorage.getItem("password")
      if(email && password){
        login({email, password}).then(data => {
          if(data.data){
            console.log('logined')
          }
        })
      }
    }
    autoLogin()
  }, [])
  if(user) return <Redirect href='(drawer)/chats'/>
  return (
    <Stack>
        <Stack.Screen name='Login' options={{
          headerTitle: '',
          headerRight: () => <MoveButton
          onPress = {()=> router.push('auth/SignUp')}
          style={({pressed}) => [
            {
              backgroundColor: pressed ? 'gray' : 'white',
            },
          ]}
          ><ButtonText>SignUp</ButtonText>
          </MoveButton>
        }}/>
        <Stack.Screen name='SignUp' options={{
          headerTitle: ''
        }} />
    </Stack>
  )
}
const MoveButton = styled.Pressable`
background-color: fff;
border-width: 1px;
border-color: gray;
padding: 5px 10px;
border-radius: 12px;
`
const ButtonText = styled.Text`
font-size: 14px;
font-weight: 700;
color: #000;
`

export default AuthLayout