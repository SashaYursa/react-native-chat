import { View, Text } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Stack } from 'expo-router/stack'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { setParams } from 'expo-router/src/global-state/routing';

export const AuthUserContext = createContext({});

const RootLayout = () => {
    const [user, setUser] = useState(null);
    const prevContext = AuthUserContext;
    useEffect(()=> {
        console.log('context changed')
    }, [AuthUserContext])
    return (
        <AuthUserContext.Provider value={{user, setUser}}>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name='(auth)' />
                <Stack.Screen name='(drawer)' />
            </Stack>
        </AuthUserContext.Provider>
    )
}
export default RootLayout