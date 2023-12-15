import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi";
const initialState = {
        user: null,
        error: null,
        uploadUserImageStatus: null
    }
export const authSlice = createSlice({
    name: "auth",
    initialState,
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
        .addMatcher(authApi.endpoints.loguot.matchFulfilled, (state) => {
            state.user = null
        })
        .addMatcher(authApi.endpoints.registration.matchFulfilled, (state, action) => {
            state.user = action.payload
        })
    }
})

export const { setUser, setUploadUserImageStatus } = authSlice.actions

export default authSlice.reducer;