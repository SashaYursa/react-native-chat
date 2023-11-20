import { View, Text, Image, Platform } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUserContext } from '../_layout'
import { Redirect, Stack } from 'expo-router';
import { onAuthStateChanged, onUserChanged } from 'firebase/auth';
import { auth, database } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
export const getUserData = async (database, uid) => {
    const qUser = doc(database, "users", String(uid))
    return await getDoc(qUser)
    .then(data => data.data())
    .catch(error => console.log(error))
}

export const checkUserStatus = async (database, uid, callback) => {
    setInterval( async () => {
        const user = await getUserData(database, uid);
        console.log(user.status, user.displayName);
        if(user.status === "online"){
            const currentDate = new Date();
            currentDate.setSeconds(currentDate.getSeconds() - 20);
            const date = new Date();
            if(new Date(user.lastCheckedStatus).getTime() < currentDate.getTime()){
                setDoc(doc(database, 'users', uid), {
                    ...user,
                    lastCheckedStatus: date,
                    status: 'offline'
                })
                callback({status: 'offline', lastCheckedStatus: date})
                //console.log(user.displayName, 'leave from programm')
            }
            else{
                callback({status: 'online', lastCheckedStatus: date})
              //  console.log('more')
            }
        }
        else{
            console.log('user is not online')
        }
    }, 5000);
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
            <Stack.Screen options={({route}) => {
            return ({
                headerShown: true,
                headerTitle: "Chat"
            })}
            } name='chat/[id]'/>
            <Stack.Screen name="chat/info" options={Platform.OS === 'android' 
            ? {
                title: 'Info',
                presentation: 'modal',
                headerShown: true    
            }
            : {
                presentation: 'modal',
                headerShown: false
            }
            }/>
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