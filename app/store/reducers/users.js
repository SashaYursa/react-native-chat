import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        loading: true,
        error: null
    },
    reducers: {
        setUsers: (state, action) => {
            state.users = action.payload
            state.loading = false
        },
        updateUser: (state, action) => {
            state.users = [...state.users, action.payload]
            state.loading = false
        }

    }
})

export const { setUsers, updateUser } = usersSlice.actions

export default usersSlice.reducer;