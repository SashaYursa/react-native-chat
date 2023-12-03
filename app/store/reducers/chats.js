import { createSlice } from "@reduxjs/toolkit";
import { chatsApi } from "../features/chats/chatsApi";

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
        builder.addMatcher(
            chatsApi.endpoints.fetchChats.useQuery,
            (state, {payload}) => {
                console.log('initiate-----------------------')
                // state.chats = payload
            }
        )
    }
})

export const { setChats } = chatsSlice.actions

export default chatsSlice.reducer;