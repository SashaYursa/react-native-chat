import { collection, doc, getDoc, query, setDoc, updateDoc, where } from "firebase/firestore";
import { auth, database, fileStorage, rDatabase } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { onDisconnect, ref, serverTimestamp, set } from "firebase/database";
import {deleteObject, getDownloadURL, ref as sRef} from "firebase/storage"
import { uploadBytesResumable } from "firebase/storage";
export const authApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            async queryFn({email, password}){
                try{
                    if(!email || !password){
                        return {error: 'no credentials'}
                    }
                    const data = await signInWithEmailAndPassword(auth, email, password)
                    ReactNativeAsyncStorage.setItem("email", email)
                    ReactNativeAsyncStorage.setItem("password", password)
                    const rUserRef = ref(rDatabase, '/status/' + data.user.uid)
                    let response = await getDoc(doc(database, "users", data.user.uid))
                    response = response.data()
                    data.user = {
                        ...data.user,
                        ...response
                    }
                    onDisconnect(rUserRef)
                    .set({ timeStamp: serverTimestamp(), isOnline: false })
                    .then(() => {
                        set(rUserRef, { timeStamp: serverTimestamp(), isOnline: true})
                    });
                    return {data}
                }
                catch(error){
                    return {error}
                }
            }
        }),
        registration: builder.mutation({
            async queryFn({password, email}) {
                try{
                    const data = await createUserWithEmailAndPassword(auth, email, password)
                    const user = data.user
                    await setDoc(doc(database, 'users', user.uid),{
                    id: user.uid,
                    email: user.email,
                    displayName: user.email,
                    image: null,
                    createdAt: serverTimestamp()
                    })
                    await ReactNativeAsyncStorage.setItem("email", email)
                    await ReactNativeAsyncStorage.setItem("password", password)
                    let response = await getDoc(doc(database, "users", user.uid))
                    response = response.data()
                    return {
                        data:{
                            ...user,
                            ...response
                        }
                    }
                }
                catch(error){
                    console.log('registration error, ->', error)
                    return {error}
                }
            }
        }),
        updateUser: builder.mutation({
            async queryFn({user, updateData, setUploadUserImageStatus}, {dispatch}) {
                try{
                    const uploadUserImage = async (path) => {
                        const fileName = path.split('/').pop();
                        
                        const response = await fetch(path).catch(err => console.log(err))
                        const blobImage = await response.blob();
                        
                        const storageRef = sRef(fileStorage, `usersImages/${fileName}`);
                        const uploadTask = uploadBytesResumable(storageRef, blobImage)
                        uploadTask.on("state_changed", (snapshot => {
                          const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100) / 100
                          dispatch(setUploadUserImageStatus(progress))
                        }),
                        (error => console.log('uploadTask.on error --------->', error))
                        )
                        return uploadTask.then(async () => {
                          return await getDownloadURL(uploadTask.snapshot.ref).then(url => url)
                        })
                        .catch(error => console.log('uploadTask error -----> ', error))
                    }
                    const removePrevImage = (prevImage) => {
                        const mediaParam = prevImage.split("/usersImages%2F")[1];
                        const name = mediaParam.split("?")[0];
                        const desertRef = sRef(fileStorage, `usersImages/${name}`);
                        deleteObject(desertRef)
                        .catch((error) => {
                            console.log('delet chat image error -----> ', error)
                        });
                      }
                    let image = updateData.image;
                    if(updateData.uploadedImage !== null){
                        if(user.image){
                            removePrevImage(user.image)
                        }    
                        image = await uploadUserImage(updateData.uploadedImage);
                    }
                    else if(updateData.imageIsRemoved){
                        if(user.image){
                            removePrevImage(user.image)
                        }
                    }
                    const updatedUser = {
                        image,
                        displayName: updateData.displayName
                    }
                    await updateDoc(doc(database, 'users', user.uid), updatedUser).catch(error => {
                        console.log('setDoc error in EditUser --->', error)
                    })
                    const selectedAuth = getAuth()
                    updateProfile(selectedAuth.currentUser, {displayName: updatedUser.displayName, photoURL: image}).catch(error => {})
                    return {data: updatedUser}
                }
                catch(error){
                    console.log('update user error', error)
                    return {error}
                }
            }
        }),
        loguot: builder.mutation({
            async queryFn(){
                try {
                    await ReactNativeAsyncStorage.removeItem("email")
                    await ReactNativeAsyncStorage.removeItem("password")
                    await signOut(auth)
                    return {data: 'ok'}
                }catch(error){
                    console.log('logout error, ---->', error)
                    return {error}
                }
            }
        })
    })
})
export const { useLoginMutation, useUpdateUserMutation, useLoguotMutation, useRegistrationMutation } = authApi