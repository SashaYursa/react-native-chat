import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi";

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        error: null
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        }, 
    },
    extraReducers: (builder) => {
        builder
        .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
            state.user = action.payload.user
        })
    }
})

export const { setUser } = authSlice.actions

export default authSlice.reducer;