import { addDoc, collection, getDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
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
        }),
        createChat: builder.mutation({
            async queryFn(params) {
                const chat = {
                    ...params,
                    image: null,
                    createdAt: serverTimestamp()
                }
                try{
                    return await addDoc(collection(database, 'chats'), chat)
                    .catch(error => {
                        console.log(error, 'create Chat error')
                        return {error: error + ' create error'}
                    })
                    .then(doc => {
                        return {data: {...chat, id: doc.id, createdAt: {seconds: Date.now()}}}
                    })
                }
                catch(error){
                    console.log(error, 'create chat error')
                    return {error}
                }
            }
        })
    })
})

export const { useFetchChatsQuery, useCreateChatMutation } = chatsApi