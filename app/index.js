import { View, Text } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'

const Root = () => {
  return (
    <Redirect href={"/chats"}/>
  )
}

export default Root