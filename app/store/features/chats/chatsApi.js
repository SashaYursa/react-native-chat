import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { database, fileStorage } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";
import { deleteObject, getDownloadURL, ref as sRef, uploadBytesResumable } from "firebase/storage";

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
                    .then(async doc => {
                        // await addDoc(collection(database, 'messages', doc.id, 'message'))
                        return {data: {...chat, id: doc.id, createdAt: {seconds: Date.now()}}}
                    })
                }
                catch(error){
                    console.log(error, 'create chat error')
                    return {error}
                }
            }
        }),
        addUser:  builder.mutation({
            async queryFn({chatId, users}) {
                try{
                    const chatDoc = doc(database, 'chats', chatId)
                    await updateDoc(chatDoc, {users})
                    return {data: {chatId, users}}
                }
                catch(error){ 
                    return {error}
                }
    			// const chatDocData = (await getDoc(chatDoc)).data()

            }
        }),
        deleteUserFromChat: builder.mutation({
            async queryFn({newUsers, chatId}){
                try{
                    const chatDoc = doc(database, 'chats', chatId) 
                    updateDoc(chatDoc, {users: newUsers})
                    return {data: {newUsers, chatId}}
                }
                catch(error){
                    return {error}
                }
            }
        }),
        updateChat: builder.mutation({
            async queryFn({updateData, chatData, setUploadChatImageStatus}, {dispatch}){
                const uploadChatImage = async (path) => {
                    const fileName = path.split('/').pop();
                    
                    const response = await fetch(path).catch(err => console.log(err))
                    const blobImage = await response.blob();
                    
                    const storageRef = sRef(fileStorage, `chatsImages/${fileName}`);
                    const uploadTask = uploadBytesResumable(storageRef, blobImage)
                    uploadTask.on("state_changed", (snapshot => {
                      const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100) / 100
                        dispatch(setUploadChatImageStatus(progress))
                    }),
                    (error => console.log('uploadTask.on error --------->', error))
                    )
                    return uploadTask.then(async () => {
                      return await getDownloadURL(uploadTask.snapshot.ref).then(url => url)
                    })
                    .catch(error => console.log('uploadTask error -----> ', error))
                  }
                  const removePrevImage = (prevImage) => {
                    const mediaParam = prevImage.split("/chatsImages%2F")[1];
                    const name = mediaParam.split("?")[0];
                    const desertRef = sRef(fileStorage, `chatsImages/${name}`);
                    // Delete the file
                    deleteObject(desertRef)
                    .catch((error) => {
                        console.log('delet chat image error -----> ', error)
                    });
                  }
                try{
                    let image = updateData.image;
                    if(updateData.uploadedImage !== null){
                        if(chatData.image){
                            removePrevImage(chatData.image)
                        }
                        image = await uploadChatImage(updateData.uploadedImage);
                    }
                    else if(updateData.imageIsRemoved){
                        if(chatData.image){
                            removePrevImage(chatData.image)
                        }
                    }
                    const updatedChat = {
                    image,
                    name: updateData.chatName
                    }
                    await updateDoc(doc(database, 'chats', chatData.id), updatedChat).catch(error => {
                        console.log('setDoc error in EditChat --->', error)
                    })
                    return {data: {updatedChat, chatData}}
                }
                catch(error) {
                    return {error}
                }
            
            }
        })
    })
})

export const { useFetchChatsQuery, useCreateChatMutation, useAddUserMutation, useDeleteUserFromChatMutation, useUpdateChatMutation} = chatsApi