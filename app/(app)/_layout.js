import { View, Text, Image, Platform } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUserContext } from '../_layout'
import { Redirect, Stack } from 'expo-router';
import { onAuthStateChanged, onUserChanged } from 'firebase/auth';
import { auth, database } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';

const AppLayout = () => {
    const user = useSelector(state => state.auth.user);
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
            <Stack.Screen name="chat/settings" options={Platform.OS === 'android' 
            ? {
                title: 'Settings',
                presentation: 'modal',
                headerShown: true    
            }
            : {
                presentation: 'modal',
                headerShown: false
            }
            }/>
            <Stack.Screen name="chat/addUsers" options={Platform.OS === 'android' 
            ? {
                headerShown: false    
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
            <Stack.Screen name='createChat' options={{
                headerShown: false,
                presentation: "modal"
            }}/>
        </Stack>
    )
}

export default AppLayout