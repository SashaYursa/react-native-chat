import { collection, doc, getDoc, getDocs, orderBy, query, limit, getDocFromCache, startAt, addDoc, serverTimestamp, onSnapshot, getCountFromServer, where } from "firebase/firestore";
import { database, fileStorage } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { useDispatch } from "react-redux";
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
                        const lastDoc = await getDoc(doc(database, 'messages', chatId, 'message', lastMessageId));
                        messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count), startAt(lastDoc))
                    }else{
                        messagesQuery = query(collection(database, 'messages', chatId, 'message'), orderBy('createdAt', 'desc'), limit(count))
                    
                    }
                    const messagesDocs = await getDocs(messagesQuery)
                    if(messagesDocs.docs.length === 0){
                        return {error: 'no data'}
                    }
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
                    return{data: {chatId, messages}}  
                }
                catch(error){
                    console.log('error fetch prev messages ----> ', error)
                    return {error}
                }
            }
        }),
        sendMessage: builder.mutation({
            async queryFn({media, userId, text, chatId, addMessage}){
                try{
                    const newText = text?.trim() === '' ? null : text
                    const data = {
                        uid: userId,
                        text: newText,
                        media,
                        createdAt: serverTimestamp(),
                        isRead: [userId]
                    }
                    let result = null;
                    await addDoc(collection(database, 'messages', chatId, 'message'), data).then(data => {
                        const res = data.data()
                       result = {data: {...res, id: data.id}}
                    })
                    return result
                }
                catch(error){
                    return {error: 'send message error: ->', error}
                }
            },
            async onQueryStarted({media, userId, text, chatId, addMessage}, {dispatch}) {
                const messageCreatedAt = new Date(Date.now());
                const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate();      
                const newText = text?.trim() === '' ? null : text
                const data = {
                    uid: userId,
                    text: newText,
                    media,
                    createdAt: Date.now(),
                    isRead: [userId],
                    id: messageCreatedAt
                }
                dispatch(addMessage({
                    message: {
                        date: messageSlug, 
                        data: [{
                            ...data,
                            isPending: true
                        }],
                       
                    },
                    chatId,
                }))
            }
        }),
    //     startReciveMessages: builder.query({
    //         async queryFn({chatsData, userId}){
    //             const messagesQuery = chatsData.data.map(chat => {
    //                 return {query: query(collection(database, "messages", chat.id, "message"), orderBy('createdAt', 'desc'), limit(1)), chat}
    //             })
    //             // try{
    //             //     const unsubscribe = await addMessageReciverForChat({chatId, dispatch, userId})
    //             //     return {data: unsubscribe}
    //             // }
    //             // catch(error) {
    //             //     return {error: `recive message error----->, ${error}`}
    //             // }
    //             return {data: {messagesQuery, userId}}
    //         },
    //         async onCacheEntryAdded(
    //             {messagesQuery, userId},
    //             { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
    //           ) {
    //             const unsbs = messagesQuery.map(({query, query}) => {
    //             return onSnapshot(query, async (snapShot) => {
    //                 if(!snapShot.docs.length){
    //                     dispatch(addBlankMessage({
    //                         chatId
    //                     }))
    //                 }
    //                 snapShot.docs.forEach(async e => { 
    //                     const data = e.data();
                        
    //                     if(!data.isRead.includes(user.uid) && userIsInChat(chatId)){
    //                         console.log(Platform.OS, 'user in chat and read this message')
    //                     }
    //                     if(data?.createdAt?.seconds){
    //                         const messageCreatedAt = new Date(data?.createdAt?.seconds * 1000)
    //                         const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate();  
    //                         // let unreadedMessagesCount = await checkMessages(chatId)
    //                         dispatch(addLastMessage({
    //                             message: {
    //                                 date: messageSlug, 
    //                                 data: [{
    //                                     ...data,
    //                                     id: e.id, 
    //                                 }]
    //                             }, 
    //                             chatId,
    //                             // ...unreadedMessagesCount
    //                         }))
    //                     }
    //                     });
    //             })
    //             })
    //             // return unsubscribe;  
    //             // let unsubscribe = null;
    //             // create a websocket connection when the cache subscription starts
    //             // const ws = new WebSocket('ws://localhost:8080')
    //             // try {
    //             //   // wait for the initial query to resolve before proceeding
    //             //   await cacheDataLoaded
    //             //   console.log(chatId, userId, 'credentials')
    //             //     const qMessages = query(collection(database, "messages", chatId, "message"), orderBy('createdAt', 'desc'), limit(1));
    //             //     unsubscribe = onSnapshot(qMessages, async (snapShot) => {
    //             //     if(!snapShot.docs.length){
    //             //         // dispatch(addBlankMessage({
    //             //         //     chatId: chatId
    //             //         // }))
    //             //         updateCachedData((draft) => {
    //             //             return {error: 'not found'}
    //             //             // draft.push("no messages")
    //             //         })
    //             //     }
    //             //     const datas = snapShot.docs.map(async e => { 
    //             //         const data = e.data();
    //             //         return data
    //             //         // console.log(data,'____________________________________________here_____________________________________________________')
    //             //         if(data?.createdAt?.seconds){
    //             //             const messageCreatedAt = new Date(data?.createdAt?.seconds * 1000)
    //             //             const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate();  
    //             //             let unreadedMessagesCount = await checkMessages(chatId, userId)
    //             //             // dispatch(addLastMessage({
    //             //             //     message: {
    //             //             //         date: messageSlug, 
    //             //             //         data: [{
    //             //             //             ...data,
    //             //             //             id: e.id, 
    //             //             //         }]
    //             //             //     }, 
    //             //             //     chatId: chatId,
    //             //             //     ...unreadedMessagesCount
    //             //             // }))
    //             //             return{
    //             //                 message: {
    //             //                     date: messageSlug, 
    //             //                     data: [{
    //             //                         ...data,
    //             //                         id: e.id, 
    //             //                     }]
    //             //                 }, 
    //             //                 chatId: chatId,
    //             //                 ...unreadedMessagesCount
    //             //             }
    //             //         }
    //             //     });
    //             //     console.log(await datas, 'datas')
    //             //     updateCachedData((draft) => {
    //             //         draft.data ={docs: snapShot.docs}
    //             //     })
                    
    //             // })
    //               // when data is received from the socket connection to the server,
    //               // if it is a message and for the appropriate channel,
    //               // update our query result with the received message
    //             //   const listener = (event) => {
    //             //     const data = JSON.parse(event.data)
    //             //     if (!isMessage(data) || data.channel !== arg) return
        
    //             //     updateCachedData((draft) => {
    //             //       draft.push(data)
    //             //     })
    //             //   }
        
    //             //   ws.addEventListener('message', listener)


    //             // } catch(error) {
    //             //     console.log('error ______________', error)
    //             //   // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
    //             //   // in which case `cacheDataLoaded` will throw
    //             // }
    //             // cacheEntryRemoved will resolve when the cache subscription is no longer active
    //             await cacheEntryRemoved
    //             // perform cleanup steps once the `cacheEntryRemoved` promise resolves
    //             // ws.close()
    //             return unsubscribe()
    //           },
    //     })
    //     // uploadChatMedia: builder.mutation({
    //     //     async queryFn({images, callback}){
    //     //         try{
    //     //             const uploadedImagesURL = await Promise.all(images.map(async ({name}) => {
    //     //                 return await callback(name)
    //     //                 })                  
    //     //             )
    //     //             return {data: uploadedImagesURL}
    //     //         }
    //     //         catch(error){
    //     //             return {error: 'upload image error ->', error}
    //     //         }
    //     //     }
    //     // })
    })
})

const checkMessages = async (chatId, userId) => {
    const totalMessagesCount = (await getCountFromServer(collection(database, 'messages', chatId, 'message'))).data().count
    const readedMessages = (await getCountFromServer(query(collection(database, 'messages', chatId, 'message'), where("isRead", "array-contains", userId)))).data().count
    return {unreadedMessagesCount: (totalMessagesCount - readedMessages), totalMessagesCount, readedMessages}
}

// const addMessageReciverForChat = async ({chatId, dispatch, userId}) => {
//     const qMessages = query(collection(database, "messages", chatId, "message"), orderBy('createdAt', 'desc'), limit(1));
//     const unsubscribe = onSnapshot(qMessages, async (snapShot) => {
//         if(!snapShot.docs.length){
//             dispatch(addBlankMessage({
//                 chatId: chatId
//             }))
//         }
//         snapShot.docs.forEach(async e => { 
//             const data = e.data();
//             if(data?.createdAt?.seconds){
//                 const messageCreatedAt = new Date(data?.createdAt?.seconds * 1000)
//                 const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate();  
//                 let unreadedMessagesCount = await checkMessages(chatId, userId)
//                 dispatch(addLastMessage({
//                     message: {
//                         date: messageSlug, 
//                         data: [{
//                             ...data,
//                             id: e.id, 
//                         }]
//                     }, 
//                     chatId: chatId,
//                     ...unreadedMessagesCount
//                 }))
//             }
//         });
//     })
//     return unsubscribe;
// }

const uploadChatMedia = async (path) => {
    const fileName = path.split('/').pop();
    
    const response = await fetch(path).catch(err => console.log(err))
    const blobImage = await response.blob();
    
    const storageRef = ref(fileStorage, `media/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blobImage)
    uploadTask.on("state_changed", (snapshot => {
        const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        setPreloadImages(images => images.map(img => {
            if(img.path === path){
            return {...img, progress}
            }
            return img
        }))
    }),
    (error => console.log('uploadTask.on error --------->', error))
    )
    return uploadTask.then(async data => {
      return await getDownloadURL(uploadTask.snapshot.ref).then(url => url)
    })
    .catch(error => console.log('uploadTask error -----> ', error))
  }

export const { useLazyFetchMessagesQuery, useFetchPrevMessagesMutation, useSendMessageMutation} = messagesApi