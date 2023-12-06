import { createSlice } from "@reduxjs/toolkit";
import { messagesApi } from "./messagesApi";

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
                    state.chatsMessages[index].messages[findDay].data = [...message.data, ...state.chatsMessages[index].messages[findDay].data] 
                }
            }
            state.loading = false
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
                const day = action.payload.messages[0]
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
                state.chatsMessages[index].messages = [...state.chatsMessages[index].messages, ...action.payload.messages.slice(1)]
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
    }
})

export const { setUsers, updateUser, updateOnlineStatus, addLastMessage } = messagesSlice.actions

export default messagesSlice.reducer;