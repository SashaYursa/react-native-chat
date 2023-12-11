import { createSlice } from "@reduxjs/toolkit";
import { messagesApi } from "./messagesApi";
import { chatsApi } from "../chats/chatsApi";

export const messagesSlice = createSlice({
    name: "messagesData",
    initialState: {
        chatsMessages: [],
        loading: true,
        error: null
    },
    reducers: {
        setMessages: (state, {payload: {chatId, messages}}) => {
            state.chatsMessages = [
                ...state.chatsMessages,
                {chatId, messages}
            ]
            state.loading = false
        },
        addMessages: (state, {payload: {chatId, messages}}) => {
            const index = state.chatsMessages.findIndex(item => item.chatId === chatId)
            state.chatsMessages = [...state.chatsMessages, {chatId, messages: [...state.chatsMessages[index].messages, ...messages]}]
            state.loading = false
        },
        addLastMessage: (state, {payload}) => {
            const {message, chatId, ...rest} = payload
            const index = state.chatsMessages.findIndex(item => item.chatId === chatId)
            if(index === -1){
                    state.chatsMessages.push({...rest, chatId, messages: [payload.message]})
            }
            else{
                const findDay = state.chatsMessages[index].messages.findIndex(item => item.date === message.date)
                if(findDay === -1){
                    state.chatsMessages[index] = {
                        ...state.chatsMessages[index],
                        ...rest,
                        chatId,
                        messages: [message, ...state.chatsMessages[index].messages],
                    }
                }
                else{
                    state.chatsMessages[index] = {
                        ...state.chatsMessages[index],
                        ...rest,
                        chatId,
                    }
                    // const messageIndex = state.chatsMessages[index].messages[findDay].data.findIndex(m => m.id === message.data[0]?.id)
                    // if(messageIndex !== -1){
                    //     console.log('here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                        const findIndexPending = state.chatsMessages[index].messages[findDay].data.findIndex(m => m.id === message.data[0].id)
                        if(findIndexPending === -1){
                            state.chatsMessages[index].messages[findDay].data = [...message.data, ...state.chatsMessages[index].messages[findDay].data] 
                        }
                    // }else{
                    //     const message = state.chatsMessages[index].messages[findDay].data[messageIndex]
                    //     if(!message?.deleted){
                    //         state.chatsMessages[index].messages[findDay].data[messageIndex] = message.data[0]
                    //     }
                    // }
                }
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        addBlankMessage: (state, {payload: {chatId}}) => {
            state.chatsMessages.push({chatId, messages: [], unreadedMessagesCount: 0, totalMessagesCount: 0, readedMessages: 0})
        },
        removeMessagesFromState: (state, action) => {
            console.log(action.payload, 'payload -here')
            for(const deletedMessage of action.payload.messagesForDelete){
                const chatIndex = state.chatsMessages.findIndex(item => item.chatId === action.payload.chatId)
                const dayIndex = state.chatsMessages[chatIndex].messages.findIndex(day => day.date === deletedMessage.date)
                const messageIndex = state.chatsMessages[chatIndex].messages[dayIndex].data.findIndex(m => m.id === deletedMessage.data.id)
                state.chatsMessages[chatIndex].messages[dayIndex].data[messageIndex] = {
                    ...state.chatsMessages[chatIndex].messages[dayIndex].data[messageIndex],
                    deleted: true,
                } 
            }
        }
    },
    extraReducers: (builder) => {
        builder
        .addMatcher(messagesApi.endpoints.fetchMessages.matchFulfilled, (state, action) => {
            const index = state.chatsMessages.findIndex(item => item.chatId === action.payload.chatId)
            if(index === -1){
                state.chatsMessages[index] = {
                    ...state.chatsMessages[index],
                    messages: [...state.chatsMessages[index]?.messages, ...action.payload.messages]
                }
            }
            else{
                action.payload.messages.forEach(day => {
                    const findDay = state.chatsMessages[index].messages.findIndex(d => d.date === day.date)
                    if(findDay !== -1){
                        const concatDayMessages = state.chatsMessages[index].messages[findDay].data.concat(day.data)
                        const uniqueIds = [];
                        const filteredMessages = [];
                        for (const message of concatDayMessages) {
                            // Перевіряємо, чи id вже є у списку унікальних id
                            if (!uniqueIds.includes(message.id)) {
                                // Додаємо id до списку унікальних id
                                uniqueIds.push(message.id);                            
                                // Додаємо повідомлення до відфільтрованого масиву
                                filteredMessages.push(message);
                            }
                        }
                        state.chatsMessages[index].messages[findDay].data = filteredMessages
                    }
                    else{
                        state.chatsMessages[index].messages.push(day)
                    }
                })
            }
            state.loading = false
        })
        .addMatcher(messagesApi.endpoints.fetchPrevMessages.matchFulfilled, (state, action) => {
            const index = state.chatsMessages.findIndex(item => item.chatId === action.payload.chatId)
            state.chatsMessages[index] = {
                ...state.chatsMessages[index],
                messages: [...state.chatsMessages[index].messages, ...action.payload.messages]
            }
        })
        .addMatcher(chatsApi.endpoints.createChat.matchFulfilled, (state, action) => {
            state.chatsMessages.push({chatId: action.payload.id, messages: [], unreadedMessagesCount: 0, totalMessagesCount: 0, readedMessages: 0})
        })
        .addMatcher(messagesApi.endpoints.sendMessage.matchFulfilled, (state, {payload: {newMessageId, date, chatId, oldMessageId}}) => {
            const chatIndex = state.chatsMessages.findIndex(item => item.chatId === chatId)
            const dayIndex = state.chatsMessages[chatIndex].messages.findIndex(day => day.date === date)
            const messageIndex = state.chatsMessages[chatIndex].messages[dayIndex].data.findIndex(m => m.id === oldMessageId)
            state.chatsMessages[chatIndex].messages[dayIndex].data[messageIndex] = {
                ...state.chatsMessages[chatIndex].messages[dayIndex].data[messageIndex],
                id: newMessageId, 
                isPending: false
            }
        })
    }
})

export const { setUsers, updateUser, updateOnlineStatus, addLastMessage, addBlankMessage, setLoading, removeMessagesFromState } = messagesSlice.actions

export default messagesSlice.reducer;