import { View, Text, Image, Platform } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUserContext } from '../_layout'
import { Redirect, Stack } from 'expo-router';
import { onAuthStateChanged, onUserChanged } from 'firebase/auth';
import { auth, database } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
export const getUserData = async (database, uid) => {
    const qUser = doc(database, "users", String(uid))
    return await getDoc(qUser)
    .then(data => data.data())
    .catch(error => console.log(error))
}


export const compareObjects = (first, second) => {
        /* Checking if the types and values of the two arguments are the same. */
        if(first === second) return true
        /* Checking if any arguments are null */
        if(first === null || second === null) return false
        /* Checking if any argument is none object */
        if(typeof first !== 'object'  || typeof second !== 'object') return false
        /* Using Object.getOwnPropertyNames() method to return the list of the objects’ properties */
        let first_keys = Object.getOwnPropertyNames(first)
        let second_keys = Object.getOwnPropertyNames(second)
        /* Checking if the objects' length are same*/
        if(first_keys.length !== second_keys.length) return false
        /* Iterating through all the properties of the first object with the for of method*/
        for(let key of first_keys) {
            /* Making sure that every property in the first object also exists in second object. */ 
            if(!Object.hasOwn(second, key)) return false
            /* Using the deepComparison function recursively (calling itself) and passing the values of each property into it to check if they are equal. */
            if (compareObjects(first[key], second[key]) === false) return false
        }
        /* if no case matches, returning true */ 
        return true
}

export const checkUserStatus = async (database, uid, callback) => {
    setInterval( async () => {
        const user = await getUserData(database, uid);
        if(user.status === "online"){
            const currentDate = new Date();
            currentDate.setSeconds(currentDate.getSeconds() - 20);
            const date = new Date();
            if(new Date(user.lastCheckedStatus).getTime() < currentDate.getTime()){
                setDoc(doc(database, 'users', uid), {
                    ...user,
                    lastCheckedStatus: date,
                    status: 'offline'
                })
                callback({status: 'offline', lastCheckedStatus: date})
                //console.log(user.displayName, 'leave from programm')
            }
            else{
                callback({status: 'online', lastCheckedStatus: date})
              //  console.log('more')
            }
        }
        else{
            console.log('user is not online')
        }
    }, 5000);
}

const AppLayout = () => {
    const {user, setUser} = useContext(AuthUserContext);
    useEffect(()=> {
        const unsub = onAuthStateChanged(auth, 
            authUser => {
                authUser ? setUser(authUser) : setUser(null)
            })
        return () => unsub();
    }, [user])
    
    if (!user) {
        return (
           <Redirect href='auth' />
        )
    }
    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen options={({route}) => {
            return ({
                headerShown: true,
                headerTitle: "Chat"
            })}
            } name='chat/[id]'/>
            <Stack.Screen name="chat/info" options={Platform.OS === 'android' 
            ? {
                title: 'Info',
                presentation: 'modal',
                headerShown: true    
            }
            : {
                presentation: 'modal',
                headerShown: false
            }
            }/>
            <Stack.Screen name="chat/settings" options={Platform.OS === 'android' 
            ? {
                title: 'Settings',
                presentation: 'modal',
                headerShown: true    
            }
            : {
                presentation: 'modal',
                headerShown: false
            }
            }/>
            <Stack.Screen name="chat/addUsers" options={Platform.OS === 'android' 
            ? {
                headerShown: false    
            }
            : {
                presentation: 'modal',
                headerShown: false
            }
            }/>
            <Stack.Screen name='(drawer)'/>
            <Stack.Screen name='Users' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='user/[userId]' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='createChat' options={{
                headerShown: false,
                presentation: "modal"
            }}/>
        </Stack>
    )
}

export default AppLayout