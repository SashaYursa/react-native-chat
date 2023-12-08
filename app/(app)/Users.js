import { View, Text, Image, TouchableOpacity} from 'react-native'
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SelectedChatContext, clearChatData } from '../_layout'
import styled from 'styled-components'
import { ActivityIndicator, TextInput } from 'react-native-paper';
import useDebounce from '../../hooks/useDebounce'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { database } from '../../config/firebase';
import { addDoc, collection, endAt, getDocs, orderBy, query, serverTimestamp, startAt, where } from 'firebase/firestore';
import TopSearch from '../components/TopSearch';
import UsersList from '../components/UsersList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
const Users = () => {
  const user = useSelector(state => state.auth.user)
  const [searchText, setSearchText] = useState('')
  const {setMessages, setChatUsers, setChatData} = useContext(SelectedChatContext)
  const debouncedSearchValue = useDebounce(searchText, 1000);
  const inputRef = useRef();
  const router = useRouter();
  
  useEffect(() => {
    if(inputRef.current){
      inputRef.current.focus();
    }
  }, [inputRef])

  const createChat = useCallback(async (selectedUser) => {
    clearChatData(setChatUsers, setMessages, setChatData)
    const qChats = query(collection(database, "chats"), 
    where("users", "array-contains", user.uid),
    where("type", "==", "private")
    )
    const result = await getDocs(qChats);
    const chats = result.docs.map(chat => ({...chat.data(), id: chat.id})).filter(chat => {
      return chat.users.includes(selectedUser.id);
    })
    if(chats.length){
      router.push(`chat/${chats[0].id}`)
    }
    else{
      await addDoc(collection(database, 'chats'),{
        name: null,
        users: [user.uid, selectedUser.id],
        type: 'private',
        image: null,
        createdAt: serverTimestamp()
      })
    }
  }, [])
  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <TopSearch inputRef={inputRef} searchText={searchText} setSearchText={setSearchText}/>
      <UsersContainer style={{flex: 1}}>
        <UsersList searchValue={debouncedSearchValue} userAction={createChat}/>
      </UsersContainer>
    </SafeAreaView>
  )
}

const UsersContainer = styled.View`
padding: 2px 5px;
flex-grow: 1;
`
const UserItem = styled.TouchableOpacity`
display: flex;
flex-direction: row;
gap: 10px;
padding: 8px 10px;
border-radius: 12px;
background-color: #eaeaea;
align-items: center;
`
const UserImage = styled.Image`
width: 40px;
height: 40px;
border-radius: 20px;
background-color: #fff;
`
const UserName = styled.Text`
font-size: 16px;
font-weight: 700;
flex-grow: 1;
`

export default Users