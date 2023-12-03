import { createSlice } from "@reduxjs/toolkit";

export const lastMessagesSlice = createSlice({
    name: "lastMessages",
    initialState: {
        messages: [],
    },
    reducers: {
        setLastMessages: (state, action) => {
            state.messages = action.payload
        },
        addLastMessage: (state, action) => {
            state.messages = [...state.messages, action.payload]
        }

    }
})

export const { setLastMessages, addLastMessage } = lastMessagesSlice.actions

export default lastMessagesSlice.reducer;