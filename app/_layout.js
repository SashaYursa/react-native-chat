import { View, Text } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Stack } from 'expo-router/stack'
import { onAuthStateChanged } from 'firebase/auth';
import { setParams } from 'expo-router/src/global-state/routing';
import { auth, database } from '../config/firebase';
export const AuthUserContext = createContext({});
export const FirebaseContext = createContext({});
const RootLayout = () => {
    const [user, setUser] = useState(null);
    return (
        <FirebaseContext.Provider value={{auth, database}}>
        <AuthUserContext.Provider value={{user, setUser}}>
            <Stack screenOptions={{headerShown: false}}>
            </Stack>
        </AuthUserContext.Provider>
        </FirebaseContext.Provider>
    )
}
export default RootLayout