import { createSlice } from "@reduxjs/toolkit";
import { chatsApi } from "./chatsApi";

export const chatsSlice = createSlice({
    name: 'chats',
    initialState: {
        currentChat: null,
        chats: [],
        loading: true,
        error: null,
        uploadChatImageStatus: null
    },
    reducers: {
        setChats:(state, action) => {
            return ({
            ...state,
            chats: action.payload,
            loading: false
            })
        },
        setCurrentChat: (state, {payload: {currentChat}}) => {
            if(state.currentChat !== currentChat){
                state.currentChat = currentChat
            }
        },
        setUploadChatImageStatus: (state, action) => {
            state.uploadChatImageStatus = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
        .addMatcher(chatsApi.endpoints.fetchChats.matchFulfilled, (state, action) => {
            state.chats = action.payload
            state.loading = false
        })
        .addMatcher(chatsApi.endpoints.createChat.matchFulfilled, (state, action) => {
            state.chats.push(action.payload)
        })
        .addMatcher(chatsApi.endpoints.addUser.matchFulfilled, (state, action) => {
            const findChatId = state.chats.findIndex(chat => chat.id === action.payload.chatId)
            if(findChatId){
                state.chats[findChatId].users = action.payload.users
            }
        })
        .addMatcher(chatsApi.endpoints.deleteUserFromChat.matchFulfilled, (state, action) => {
            const findChatId = state.chats.findIndex(chat => chat.id === action.payload.chatId)
            if(findChatId){
                state.chats[findChatId].users = action.payload.newUsers
            }
        })
        .addMatcher(chatsApi.endpoints.updateChat.matchFulfilled, (state, action) => {
            const findChatId = state.chats.findIndex(chat => chat.id === action.payload.chatData.id)
            if(findChatId){
                state.chats[findChatId] = {
                    ...state.chats[findChatId],
                    ...action.payload.updatedChat
                }
            }
        })
    }
})

export const { setChats, setCurrentChat, setUploadChatImageStatus } = chatsSlice.actions

export default chatsSlice.reducer;