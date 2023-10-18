import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Stack } from 'expo-router/stack'
import Root from '.'
const RootLayout = () => {
    const [isAuth, setIsAuth] = useState(false)
    console.log('layout rerender')
  return (
      <RootLayoutNav /> 
  )
}
const RootLayoutNav = () => {
    return(
    <Stack screenOptions={{
        headerShown: false
    }}>
        <Stack.Screen name='(drawer)'/>
        <Stack.Screen name='(auth)'/>  
    </Stack>
    )
}
export default RootLayout