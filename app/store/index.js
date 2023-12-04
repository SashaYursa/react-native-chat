import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import usersReducer from "./features/users/usersSlice";
import chatsReducer from "./features/chats/chatsSlice";
import lastMessagesReducer from "./reducers/lastMessages";
import authSlice from "./features/auth/authSlice";
import { rootApi } from "./features/rootApi/rootApi";
import { setupListeners } from "@reduxjs/toolkit/query";
const store = configureStore({
    reducer: {
        [rootApi.reducerPath]: rootApi.reducer,
        users: usersReducer,
        chats: chatsReducer,
        lastMessages: lastMessagesReducer,
        auth: authSlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(rootApi.middleware)
})

setupListeners(store.dispatch)

export default store;