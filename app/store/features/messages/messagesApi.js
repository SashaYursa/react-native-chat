import { collection, doc, getDoc, getDocs, orderBy, query, limit, getDocFromCache, startAt } from "firebase/firestore";
import { database } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";

export const messagesApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        fetchMessages: builder.query({
            async queryFn({chatId, count, lastMessageId}){
                console.log('fetched messages')
                try{
                    if(!count || !chatId){
                        return {error: 'error in fetchMessages, not enought expected valuse'}
                    }   
                    let messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count))
                    if(lastMessageId){
                        const lastDoc = await getDoc(doc(database, "messages", chatId, "message", lastMessageId));
                        messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count), startAt(lastDoc))
                    }else{
                        messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count))
                    
                    }
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
                    // if(messages.length){
                        return{data: {chatId, messages}}                        
                    // }
                    // else{
                        // return{error: 'no messages'}
                    // }
                }
                catch(error){
                    return {error}
                }
            }
        }),
        fetchPrevMessages: builder.mutation({
            async queryFn({chatId, lastMessageId, count}){
                console.log('fetch prev')
                try{
                    const lastDoc = await getDoc(doc(database, "messages", chatId, "message", lastMessageId));
                    const messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count), startAt(lastDoc))
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
                        console.log(messages)
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
export const { useLazyFetchMessagesQuery, useFetchPrevMessagesMutation } = messagesApi