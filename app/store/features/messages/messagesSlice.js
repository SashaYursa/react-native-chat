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
                const messageDateIndex = state.chatsMessages[index].findIndex(item => item.date === message.date)
                if(messageDateIndex === -1){
                    state.chatsMessages[index] = {
                        ...state.chatsMessages[index],
                        ...rest,
                        chatId,
                        messages: [message, ...state.chatsMessages[index]],
                    }
                }
                else{
                    state.chatsMessages[index] = {
                        ...state.chatsMessages[index],
                        ...rest,
                        chatId,
                    }
                    state.chatsMessages[index].messages[messageDateIndex].unshift(message.data)
                }
            }
            state.loading = false
            }
    },
    extraReducers: (builder) => {
        builder
        .addMatcher(messagesApi.endpoints.fetchMessages.matchFulfilled, (state, action) => {
            // console.log(JSON.stringify(action.payload), '----> payload')
            // console.log(JSON.stringify(state.chatsMessages), '----> state')
            const index = state.chatsMessages.findIndex(item => item.chatId === action.payload.chatId)
            // console.log(index, 'index is --------------------')
            if(index !== -1){
                state.chatsMessages[index] = {
                    ...state.chatsMessages[index],
                    messages: [...state.chatsMessages[index]?.messages, ...action.payload.messages]
                }
            }
            else{
                action.payload.messages.forEach(messageDay => {
                    const findDay = state.chatsMessages[index].messages.findIndex(d => d.date === messageDay.date)
                    if(findDay !== -1){
                        state.chatsMessages[index].messages.push(messageDay)
                    }
                    else{
                        state.chatsMessages[index].messages[index].push(...messageDay.data)
                    }
                })
                // const messageDateIndex = state.chatsMessages[index].findIndex(item => item.date === message.date)
                // if(messageDateIndex === -1){
                //     state.chatsMessages[index] = {
                //         ...state.chatsMessages[index],
                //         messages: [message, ...state.chatsMessages[index]],
                //     }
                // }
                // else{
                //     state.chatsMessages[index] = {
                //         ...state.chatsMessages[index],
                //         ...rest,
                //         chatId,
                //     }
                //     state.chatsMessages[index].messages[messageDateIndex].unshift(message.data)
                // }
                // state.chatsMessages = [
                //     ...state.chatsMessages,
                //     {...action.payload}
                // ]
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