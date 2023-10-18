import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router/stack'
import styled from 'styled-components'
import { useRouter } from 'expo-router'

const AuthLayout = () => {
  const router = useRouter();
  return (
    <Stack>
        <Stack.Screen name='Login' options={{
          headerRight: () => <MoveButton
          onPress = {()=> router.push('SignUp')}
          style={({pressed}) => [
            {
              backgroundColor: pressed ? 'gray' : 'white',
            },
          ]}
          ><ButtonText>SignUp</ButtonText>
          </MoveButton>
        }}/>
        <Stack.Screen name='SignUp' />
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