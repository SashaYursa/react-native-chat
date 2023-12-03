import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { database } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";

export const chatsApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchChats: builder.query({
            async queryFn(userId) {
                try{
                    if(userId){
                        const qChats = query(collection(database, "chats"), where("users", "array-contains", userId));
                        const res = await getDocs(qChats);
                        const chats = res.docs.map(doc => {
                            const chatData = doc.data()
                            return {...chatData, id: doc.id}
                        })
                        return {data: chats, error: null}
                    }
                    return {data: null, error: "no userId"}
                }
                catch(error){
                    console.log(error, ' error in fetch users')
                    return {error, data: undefined}
                }
            }
        })
    })
})

export const { useFetchChatsQuery } = chatsApi