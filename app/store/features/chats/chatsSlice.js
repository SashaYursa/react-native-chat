import { createSlice } from "@reduxjs/toolkit";
import { chatsApi } from "./chatsApi";

export const chatsSlice = createSlice({
    name: 'chats',
    initialState: {
       chats: [],
       loading: true,
       error: null 
    },
    reducers: {
        setChats:(state, action) => {
            return ({
            ...state,
            chats: action.payload,
            loading: false
            })
        }
    },
    extraReducers: (builder) => {
        builder
        .addMatcher(chatsApi.endpoints.fetchChats.matchFulfilled, (state, action) => {
            state.chats = action.payload
            state.loading = false
        })
    }
})

export const { setChats } = chatsSlice.actions

export default chatsSlice.reducer;