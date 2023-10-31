import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router/src/hooks'
import User from '../../components/User';
import { addDoc, collection, connectFirestoreEmulator, endAt, getDoc, getDocs, orderBy, query, startAt, where } from 'firebase/firestore'
import { database } from '../../../config/firebase';
import { ActivityIndicator } from 'react-native-paper';

const UserProfile = () => {
  const {userId} = useLocalSearchParams();
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  useEffect(() => {
    setLoading(true)
    const getUser = async () =>{
    const qUser = query(collection(database, "users"), where("id", "==", userId))
    let res = await getDocs(qUser);
    res = await Promise.all(res.docs.map(item => item.data()))
    setUser(await res[0]);
    setLoading(false)
    } 
    if(userId){
        getUser()
    }
  }, [userId])
  return loading
  ? (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size='large'/>
    </View>
  )
  : (
  <User user={user}/>
  )
}

export default UserProfile