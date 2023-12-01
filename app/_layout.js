import { View, Text, Platform } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Stack } from 'expo-router/stack'
import { onAuthStateChanged } from 'firebase/auth';
import { setParams } from 'expo-router/src/global-state/routing';
import { auth, database } from '../config/firebase';
import useDebounce from '../hooks/useDebounce';
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
    const [chatsData, setChatsData] = useState([])
    const [chatUsers, setChatUsers] = useState(null)
    const [messages, setMessages] = useState([])
    const [lastMessages, setLastMessages] = useState([])
    const debouncedLastMessages = useDebounce(lastMessages, 100)
    const getChatData = (chatId = null) => {
        if(chatId){
            const data = chatsData.find(chats => chats.id === chatId)
            return data
        }
        return chatsData
    }
    const setChatData = (data) => {
        setChatsData(chats => [...chats, ...data])
    }
    const getChatLastMessage = (chatId = null) => {
        if(!chatId){
            return debouncedLastMessages
        }
        return debouncedLastMessages.find(lm => lm.chatId === chatId)
    }
    const addLastMessage = (messageData, chatId) => {
        setLastMessages(lastMessages => {
            const lastMessageIndexInChat = lastMessages.findIndex(lm => lm?.chatId === chatId)
            console.log(lastMessageIndexInChat, 'last index in ', Platform.OS)
            if(lastMessageIndexInChat === -1){
            
                return [
                    ...lastMessages,
                    {messageData, chatId}
                ]
            }
            else{
            if(lastMessages[lastMessageIndexInChat].messageData.id !== messageData.id){
                console.log('need to update')
                    return lastMessages.map((lm, index) => {
                        if(index === lastMessageIndexInChat){
                            return {chatId, messageData} 
                        }
                        return lm
                    })
            }
            return lastMessages
        }
        })
        
            // if(!messageData.createdAt){
        //     messageData.createdAt = {
        //       seconds: Date.now()
        //     }
        //   }
        // else{
        //     messageData.createdAt = {
        //         ...messageData.createdAt,
        //         seconds: messageData.createdAt.seconds * 1000
        //     }
        // }
        // const messageCreatedAt = new Date(messageData.createdAt.seconds)
        // const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate();

    }

    const [unreadedMessages, setUnreadedMessages] = useState(null)
    return (
        <FirebaseContext.Provider value={{auth, database}}>
            <AuthUserContext.Provider value={{user, setUser}}>
                <SelectedChatContext.Provider value={{getChatData, chatUsers, messages, unreadedMessages, getChatLastMessage, setChatsData, addLastMessage, setChatUsers, setMessages, setUnreadedMessages}}>
                    <Stack screenOptions={{headerShown: false}}>
                    </Stack>
                </SelectedChatContext.Provider>
            </AuthUserContext.Provider>
        </FirebaseContext.Provider>
        
    )
}
export default RootLayout