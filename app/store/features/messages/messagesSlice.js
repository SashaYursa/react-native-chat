import { createSlice } from "@reduxjs/toolkit";
import { messagesApi } from "./messagesApi";

export const messagesSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [],
        loading: true,
        error: null
    },
    reducers: {
        setMessages: (state, {payload: {chatId, messages}}) => {
            state.messages = [
                ...state.messages,
                {chatId, messages}
            ]
            state.loading = false
        },
        addMessages: (state, {payload: {chatId, messages}}) => {
            const index = state.messages.findIndex(item => item.chatId === chatId)
            state.messages = [...state.messages, {chatId, messages: [...state.messages[index].messages, ...messages]}]
            state.loading = false
        },
    },
    extraReducers: (builder) => {
        builder
        .addMatcher(messagesApi.endpoints.fetchMessages.matchFulfilled, (state, action) => {
            state.messages = [
                ...state.messages,
                {chatId: action.payload.chatId, messages: action.payload.messages}
            ]
            state.loading = false
        })
        .addMatcher(messagesApi.endpoints.fetchPrevMessages.matchFulfilled, (state, action) => {
            const index = state.messages.findIndex(item => item.chatId === action.payload.chatId)
            state.messages = [
                ...state.messages,
                {chatId: action.payload.chatId, messages: [...state.messages[index].messages, ...action.payload.messages]}
            ]
        })
    }
})

export const { setUsers, updateUser, updateOnlineStatus } = messagesSlice.actions

export default messagesSlice.reducer;