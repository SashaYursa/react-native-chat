import { doc, getDoc } from "firebase/firestore";
import { auth, database, rDatabase } from "../../../../config/firebase";
import { rootApi } from "../rootApi/rootApi";
import { signInWithEmailAndPassword } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { onDisconnect, ref, serverTimestamp, set } from "firebase/database";
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
                      const rUserRef = ref(rDatabase, '/status/' + data.user.uid);
                      onDisconnect(rUserRef)
                        .set({ timeStamp: serverTimestamp(), isOnline: false })
                        .then(() => {
                            set(rUserRef, { timeStamp: serverTimestamp(), isOnline: true})
                        });
                    return {data}
                }
                catch(error){
                    console.log('error', error)
                    return {error}
                }
            }
        })
    })
})
export const { useLoginMutation } = authApi