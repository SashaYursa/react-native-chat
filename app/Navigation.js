import { View, Text } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Stack } from 'expo-router/stack'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Redirect, router } from 'expo-router';

const Navigation = ({user}) => {
    console.log(!!user, 'as user')
    return !!user 
    ? <Redirect href={'chats'} />
    : <Redirect href={'Login'} />
}
export default Navigation