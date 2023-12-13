import { doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";

export const usersApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        // fetchSingleChatUser: builder.query({
        //     async queryFn(userId) {
        //         try{
        //             if(userId){
        //                 const qUser = doc(database, "users", userId)
        //                 const res = await getDoc(qUser)
        //                 const user = res.data()
        //                 return{data: user}  
        //             }
        //             return {error: "no userId"}
        //         }
        //         catch(error){
        //             console.log(error, ' error in fetch users')
        //             return {error}
        //         }
        //     }
        // }),
        fetchAllChatsUsers: builder.query({
            async queryFn(usersIds){
                try{
                    if(usersIds.length){
                        const users = await Promise.all(usersIds.map(async userId => {
                            const qUser = doc(database, "users", userId)
                            const res = await getDoc(qUser)
                            const user = res.data()
                            return {...user, id: res.id, isOnline: undefined}
                        }))
                        return{data: users}                        
                    }
                    return {error: 'no users ids'}
                }
                catch(error){
                    return {error}
                }
            }
        }),
    })
})
export const { useFetchAllChatsUsersQuery } = usersApi