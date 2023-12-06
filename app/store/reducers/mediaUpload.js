import { createSlice } from "@reduxjs/toolkit";
import { messagesApi } from "../features/messages/messagesApi";

export const mediaUploadSlice = createSlice({
    name: "media",
    initialState: {
        mediaItems: [],
    },
    reducers: {
        setMediaItems: (state, action) => {
            state.mediaItems = action.payload
        },
        addMediaItems: (state, action) => {
            state.mediaItems.push(...action.payload)
        },
        setMediaUploadStatus: (state, {payload: {name, statusUpload}}) => {
            const itemIndex = state.mediaItems.findIndex(i => i.name === name)
            state.mediaItems[itemIndex] = {
                ...state.mediaItems[itemIndex],
                statusUpload
            } 
        },
        removeMediaItem: (state, action) => {
            state.mediaItems = state.mediaItems.filter(item => item.name !== action.payload)
        },
        removeAllMediaItems: (state, action) => {
            state.mediaItems = []
        }
    }
})

export const { setMediaItems, setMediaUploadStatus, addMediaItems, removeMediaItem, removeAllMediaItems } = mediaUploadSlice.actions

export default mediaUploadSlice.reducer;