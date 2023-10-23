import { View, Text } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { AuthUserContext } from '../_layout'
import { Redirect, Stack } from 'expo-router';
import { onAuthStateChanged, onUserChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';

const AppLayout = () => {
    const {user, setUser} = useContext(AuthUserContext);
    useEffect(()=> {
        const unsub = onAuthStateChanged(auth, 
            authUser => {
                authUser ? setUser(authUser) : setUser(null)
            })
        return () => unsub();
    }, [user])
    if (!user) return (
        <Redirect href={'auth'}/>
    )
  return (
    <Stack screenOptions={{
        headerShown: false
    }}>
        <Stack.Screen options={({route}) =>({
            headerShown: true,
            headerTitle: () => <Text style={{fontSize: 18}}>{route.params.id}</Text>
        })} name='chat/[id]'/>
        <Stack.Screen name='(drawer)' />
    </Stack>
    )
}

export default AppLayout