import { collection, doc, getDoc, getDocs, orderBy, query, limit } from "firebase/firestore";
import { database } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";

export const messagesApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchMessages: builder.query({
            async queryFn({chatId, count}){
                try{
                    if(!limit || !chatId){
                        return {error: 'error in fetchMessages, not enought expected valuse'}
                    }
                        const messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count))
                        const messagesDocs = await getDocs(messagesQuery)
                        const messages = messagesDocs.docs.map(doc => {
                            const message = doc.data()
                            return {...message, id: doc.id}
                        })
                        return{data: {chatId, messages}}                        
                }
                catch(error){
                    return {error}
                }
            }
        }),
        fetchPrevMessages: builder.mutation({
            async queryFn({chatId, lastMessageId, count}){
                const lastDoc = await getDocFromCache(doc(database, "messages", chatId, "message", lastMessageId));
                const messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count). startAt(lastDoc))
                const messagesDocs = await getDocs(messagesQuery)
                const messages = messagesDocs.docs.map(doc => {
                    const message = doc.data()
                    return {...message, id: doc.id}
                })
                return{data: {chatId, messages}}  
            }
        })
    })
})
export const { useFetchMessagesQuery, useFetchPrevMessagesMutation } = messagesApi