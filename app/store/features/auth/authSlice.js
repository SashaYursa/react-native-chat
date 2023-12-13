import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi";

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        error: null,
        uploadUserImageStatus: null
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        }, 
        setUploadUserImageStatus: (state, action) => {
            state.uploadUserImageStatus = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
        .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
            state.user = action.payload.user
        })
        .addMatcher(authApi.endpoints.updateUser.matchFulfilled, (state, action) => {
            state.user = {
                ...state.user,
                ...action.payload
            }
        })
    }
})

export const { setUser, setUploadUserImageStatus } = authSlice.actions

export default authSlice.reducer;