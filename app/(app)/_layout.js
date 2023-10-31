import { View, Text, Image } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { AuthUserContext } from '../_layout'
import { Redirect, Stack } from 'expo-router';
import { onAuthStateChanged, onUserChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const getUserData = async (database, uid) => {
    const qUser = doc(database, "users", String(uid))
    return await getDoc(qUser)
    .then(data => data.data())
    .catch(error => console.log(error))
}

const AppLayout = () => {
    const {user, setUser} = useContext(AuthUserContext);
    useEffect(()=> {
        const unsub = onAuthStateChanged(auth, 
            authUser => {
                authUser ? setUser(authUser) : setUser(null)
            })
        return () => unsub();
    }, [user])

    if (!user) {
        return (
           <Redirect href='auth' />
        )
    }
    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen options={({route}) =>{
            return ({
                headerShown: true,
                headerTitle: "Chat"
            })}
            } name='chat/[id]'/>
            <Stack.Screen name='(drawer)'/>
            <Stack.Screen name='Users' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='user/[userId]' options={{
                headerShown: false
            }}/>
        </Stack>
    )
}

export default AppLayout