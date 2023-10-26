import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { AuthUserContext } from '../../../_layout'
import { Redirect } from 'expo-router'

const index = () => {
    const {user} = useContext(AuthUserContext)
  return (
    <Redirect href={`user/${user.uid}`} />
  )
}

export default index