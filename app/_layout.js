import { View, Text, Platform } from 'react-native'
import React, { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { Stack } from 'expo-router/stack'
import { onAuthStateChanged } from 'firebase/auth';
import { setParams } from 'expo-router/src/global-state/routing';
import { auth, database } from '../config/firebase';
import useDebounce from '../hooks/useDebounce';
import { Provider } from 'react-redux';
import store from './store';
export const AuthUserContext = createContext({});
export const FirebaseContext = createContext({});
export const SelectedChatContext = createContext({});

export const clearChatData = (setChatUsers, setMessages, setChatData) => {
    setChatUsers(null)
    setMessages([])
    setChatData(null)
}
export const reducer = (state, action) =>{
    if(action.type === 'set-chats'){
        return {
            ...state,
            chatsData: action.payload
        }
    }
    if(action.type === 'add-chat'){
        return {
            ...state,
            chatsData: [...state.chatsData, action.payload]
        }
    }
    if(action.type === 'add-users'){
        return {
            ...state,
            users: [...state.users, action.payload]
        }
    }
    if(action.type === 'set-users'){
        return {
            ...state,
            users: action.payload
        }
    }
    if(action.type === 'set-lastmessages'){
        return {
            ...state,
            lastMessages: state.lastMessages.map(lm => {
                if(lm.chatId === action.payload.chatId){
                    return {chatId: action.payload.chatId, messageData: action.payload.messageData} 
                }
                return lm
            })
        }
    }
    if(action.type === 'add-lastmessage'){
        return {
            ...state,
            lastMessages: action.payload
        }
    }
    if(action.type === 'add-messages'){
        return
    }
    if(action.type === 'set-messages'){

    }
}

const RootLayout = () => {
    // console.log('root rerender')
    const [user, setUser] = useState(null);
    const [chatsData, setChatsData] = useState([])
    const [chatUsers, setChatUsers] = useState(null)
    const [messages, setMessages] = useState([])
    const [lastMessages, setLastMessages] = useState([])
    console.log('rerender layout')

    // const [chatStore, dispatch] = useReducer(reducer, {chatsData: [], users: [], lastMessages: [], messages: []})
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
            // console.log(lastMessageIndexInChat, 'last index in ', Platform.OS)
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
        <Provider store={store}>
        <FirebaseContext.Provider value={{auth, database}}>
            <AuthUserContext.Provider value={{user, setUser}}>
                <SelectedChatContext.Provider value={{ getChatData, chatUsers, messages, unreadedMessages, getChatLastMessage, setChatsData, addLastMessage, setChatUsers, setMessages, setUnreadedMessages, setLastMessages}}>
                    <Stack screenOptions={{headerShown: false}}>
                    </Stack>
                </SelectedChatContext.Provider>
            </AuthUserContext.Provider>
        </FirebaseContext.Provider>
        </Provider>
        
    )
}
export default RootLayout