import { View, Text, SafeAreaView } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Link, Redirect, useGlobalSearchParams, useLocalSearchParams, useNavigation } from 'expo-router'
import { Stack} from 'expo-router/stack';
import { ActivityIndicator } from 'react-native-paper';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import Navigation from './Navigation';
import { AuthUserContext } from './_layout';

const Root = () => {
  const  user = useContext(AuthUserContext)
  useEffect(()=> {
    console.log(user, '12312312312')
  }, [AuthUserContext])
  console.log(user, 'ess')
  return (
      <Navigation user={user}/>
  )
}

export default Root