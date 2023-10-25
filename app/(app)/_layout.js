import { View, Text, Image } from 'react-native'
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
        <Stack.Screen options={({route}) =>{
        console.log(route.params)
        return ({
            headerShown: true,
            headerTitle: () => <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    <Image style={{width: 35, height: 35, borderRadius: 50, overflow: 'hidden'}} source={route.params.chatImage === 'default' ? require('../../assets/default-chat-image.png') : {uri: route.params.chatImage}} />
                    <Text style={{fontSize: 18}}>{route.params.title}</Text>
                </View>
        })}
        } name='chat/[id]'/>
        <Stack.Screen name='(drawer)' />
    </Stack>
    )
}

export default AppLayout