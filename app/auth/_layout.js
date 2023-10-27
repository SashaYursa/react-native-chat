import { View, Text, Pressable } from 'react-native'
import React, { useContext } from 'react'
import { Stack } from 'expo-router/stack'
import styled from 'styled-components'
import { Redirect, useRouter } from 'expo-router'
import { AuthUserContext } from '../_layout'

const AuthLayout = () => {
  const router = useRouter();
  const {user} = useContext(AuthUserContext)
  console.log('auth')
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