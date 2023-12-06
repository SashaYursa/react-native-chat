import { collection, doc, getDoc, getDocs, orderBy, query, limit, getDocFromCache, startAt, addDoc, serverTimestamp } from "firebase/firestore";
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
        }),
        sendMessage: builder.mutation({
            async queryFn({media, userId, text, chatId}){
                try{
                    let mediaItems = null;
                    const newText = text?.trim() === '' ? null : text
                    const data = {
                        uid: userId,
                        text: newText,
                        media,
                        createdAt: serverTimestamp(),
                        isRead: [userId]
                    }
                    await addDoc(collection(database, 'messages', chatId, 'message'), data)
                    return {data: "ok"}
                }
                catch(error){
                    return {error: 'send message error: ->', error}
                }
            }
        }),
        // uploadChatMedia: builder.mutation({
        //     async queryFn({images, callback}){
        //         try{
        //             const uploadedImagesURL = await Promise.all(images.map(async ({name}) => {
        //                 return await callback(name)
        //                 })                  
        //             )
        //             return {data: uploadedImagesURL}
        //         }
        //         catch(error){
        //             return {error: 'upload image error ->', error}
        //         }
        //     }
        // })
    })
})

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

export const { useLazyFetchMessagesQuery, useFetchPrevMessagesMutation, useSendMessageMutation,} = messagesApi