import { createSlice } from "@reduxjs/toolkit";

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
    }
})

export const { setChats } = chatsSlice.actions

export default chatsSlice.reducer;