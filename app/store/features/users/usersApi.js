import { rootApi } from "../rootApi/rootApi";

export const usersApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchUsers: builder.query({
            async queryFn() {
                
            }
        })
    })
})