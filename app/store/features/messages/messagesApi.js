import { collection, doc, getDoc, getDocs, orderBy, query, limit, getDocFromCache, startAt } from "firebase/firestore";
import { database } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";

export const messagesApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchMessages: builder.query({
            async queryFn({chatId, count}){
                try{
                    if(!count || !chatId){
                        return {error: 'error in fetchMessages, not enought expected valuse'}
                    }
                        const messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count))
                        const messagesDocs = await getDocs(messagesQuery)
                        const messages = [];
                        messagesDocs.docs.forEach(doc => {
                            const message = doc.data()
                            message.createdAt ? message.createdAt.seconds *= 1000 : message.createdAt = {seconds: Date.now()};
                            const messageCreatedAt = new Date(message?.createdAt?.seconds)
                            const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate(); 
                            const currentDateIndex = messages.findIndex(messages => messages.date === messageSlug);
                            if(currentDateIndex !== -1){
                                messages[currentDateIndex].data.push({...message, id: doc.id})
                            }
                            else{
                                messages.push({
                                date: messageSlug,
                                data: [
                                    {...message, id: doc.id}
                                ]
                                })
                            }
                            // return {...message, id: doc.id}
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
                try{
                    const lastDoc = await getDoc(doc(database, "messages", chatId, "message", lastMessageId));
                    const messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count), startAt(lastDoc))
                    const messagesDocs = await getDocs(messagesQuery)
                    const messages = messagesDocs.docs.map(doc => {
                        const message = doc.data()
                        return {...message, id: doc.id}
                    })
                    return{data: {chatId, messages}}  
                }
                catch(error){
                    console.log('error fetch prev messages ----> ', error)
                    return {error}
                }
            }
        })
    })
})
export const { useFetchMessagesQuery, useFetchPrevMessagesMutation } = messagesApi