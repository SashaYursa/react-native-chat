import { createSlice } from "@reduxjs/toolkit";
import { usersApi } from "./usersApi";

export const usersSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        loading: true,
        error: null,
        statusLoading: true
    },
    reducers: {
        setUsers: (state, action) => {
            state.users = action.payload
        },
        updateUser: (state, action) => {
            state.users = [...state.users, action.payload]
        },
        updateOnlineStatus: (state, {type, payload: {id, isOnline, timeStamp}}) => {
            const index = state.users.findIndex(u => u.id === id)
            state.users[index] = {
                ...state.users[index],
                isOnline,
                timeStamp 
            } 
        },
        setUsersStatusLoading: (state, action) => {
            state.statusLoading = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
        .addMatcher(usersApi.endpoints.fetchAllChatsUsers.matchFulfilled, (state, action) => {
            state.users = action.payload
            state.loading = false
        })
    }
})

export const { setUsers, updateUser, updateOnlineStatus, setUsersStatusLoading } = usersSlice.actions

export default usersSlice.reducer;