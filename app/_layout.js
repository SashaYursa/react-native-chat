import { View, Text } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Stack } from 'expo-router/stack'
import { onAuthStateChanged } from 'firebase/auth';
import { setParams } from 'expo-router/src/global-state/routing';
import { auth, database } from '../config/firebase';
export const AuthUserContext = createContext({});
export const FirebaseContext = createContext({});
export const SelectedChatContext = createContext({});

export const clearChatData = (setChatUsers, setMessages, setChatData) => {
    setChatUsers(null)
    setMessages([])
    setChatData(null)
}

const RootLayout = () => {
    // console.log('root rerender')
    const [user, setUser] = useState(null);
    const [chatData, setChatData] = useState(null)
    const [chatUsers, setChatUsers] = useState(null)
    const [messages, setMessages] = useState([])
    const [unreadedMessages, setUnreadedMessages] = useState(null)
    return (
        <FirebaseContext.Provider value={{auth, database}}>
            <AuthUserContext.Provider value={{user, setUser}}>
                <SelectedChatContext.Provider value={{chatData, chatUsers, messages, unreadedMessages, setChatData, setChatUsers, setMessages, setUnreadedMessages}}>
                    <Stack screenOptions={{headerShown: false}}>
                    </Stack>
                </SelectedChatContext.Provider>
            </AuthUserContext.Provider>
        </FirebaseContext.Provider>
        
    )
}
export default RootLayout