import { View, Text, Image, TouchableOpacity} from 'react-native'
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AuthUserContext, FirebaseContext } from '../_layout'
import { addDoc, collection, connectFirestoreEmulator, endAt, getDoc, getDocs, orderBy, query, startAt, where } from 'firebase/firestore'
import styled from 'styled-components'
import { ActivityIndicator, TextInput } from 'react-native-paper';
import useDebounce from '../../hooks/useDebounce'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import BackButton from '../components/Buttons/BackButton'
const Users = () => {
  const {database} = useContext(FirebaseContext)
  const {user} = useContext(AuthUserContext)
  const [searchText, setSearchText] = useState('')
  const [searchUsers, setSearchUsers] = useState(null)
  const debouncedSearchValue = useDebounce(searchText, 1000);
  const [usersLoading, setUsersLoading] = useState(false);
  const ipnutRef = useRef();
  const router = useRouter();
  const fetchUsers = async (userName) => {
    const qUsers = query(collection(database, "users"), 
    orderBy('displayName'),
    startAt(userName),
    endAt(userName + "\uf8ff"));
    const users = await getDocs(qUsers);
    const newUsers = users.docs.map(res => res.data()).filter(item => item.id !== user.uid)
    setSearchUsers(newUsers);
    setUsersLoading(false);
  }
  useEffect(() => {
    ipnutRef.current.focus();
  }, [])
  useEffect(() => {
    const value = debouncedSearchValue.trim();
    if(value.length > 0){
      setUsersLoading(true);
      fetchUsers(value);
    }
  }, [debouncedSearchValue])

  const createChat = async (userId) => {
    const qChats = query(collection(database, "chats"), 
    where("users", "array-contains", user.uid),
    where("type", "==", "private")
    )
    const result = await getDocs(qChats);
    const chats = result.docs.map(chat => ({...chat.data(), id: chat.id})).filter(chat => {
      return chat.users.includes(userId);
    })
    if(chats.length){
      router.push(`chat/${chats[0].id}`)
    }
    else{
      await addDoc(collection(database, 'chats'),{
        name: null,
        users: [user.uid, userId],
        type: 'private'
      })
    }
  }
  return (
    <Container>
      <HeaderContainer>
       <BackButton/>
        <SearchContainer>
          <TextInput ref={ipnutRef} mode='outlined' label='Search' style={{flexGrow: 1}} value={searchText} onChangeText={setSearchText}/>
        </SearchContainer>
      </HeaderContainer>
      <UsersContainer>
        { usersLoading 
          ? <ActivityIndicator size={'large'}/>
          : searchUsers !== null
          && searchUsers.length > 0
            ? searchUsers.map(user => (
              <UserItem key={user.id} activeOpacity={.6} onPress={() => createChat(user.id)}>
                <UserImage source={user.image ? {uri: user.image} : require('../../assets/default-user.png')}/>
                <UserName>{user.displayName}</UserName>
              </UserItem>
            ))
            : <View><Text>Users not found</Text></View>
        }
      </UsersContainer>
    </Container>
  )
}
const Container = styled.View`
flex-grow: 1;
background-color: #fff;
padding-top: 15px;
`
const HeaderContainer = styled.View`
flex-direction: row;
gap: 5px;
`
const SearchContainer = styled.View`
flex-direction: row;
padding: 10px 5px;
flex-grow: 1;
`
const UsersContainer = styled.View`
flex-grow: 1;
padding: 2px 5px;
gap: 5px;
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