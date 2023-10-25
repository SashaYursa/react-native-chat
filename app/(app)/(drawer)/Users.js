import { View, Text, Image, TouchableOpacity} from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { AuthUserContext, FirebaseContext } from '../../_layout'
import { and, collection, endAt, getDocs, orderBy, query, startAt, where } from 'firebase/firestore'
import styled from 'styled-components'
import { TextInput } from 'react-native-paper';
const Users = () => {
  const {database} = useContext(FirebaseContext)
  const {user} = useContext(AuthUserContext)
  const [searchText, setSearchText] = useState('')
  console.log(searchText)
  const fetchUsers = async (userName) => {
    const qUsers = query(collection(database, "users"), 
    //where("id", "!=", String(user.uid)), 
    orderBy('displayName'),
    startAt(userName),
    endAt(userName + "\uf8ff"));
    //where("displayName", ">=", userName + "\uf8ff"))
    //where("displayName", "<=", userName + "\uf8ff"));
    const users = await getDocs(qUsers);
    console.log(users.docs.length)
    users.docs.map(user => {
      console.log(123)
      console.log(user.data())
    })
    

  }
  useEffect(() => {
    // const fetchData = async () => {
    //   const qUsers = query(collection(database, "chats"), where("users", "array-contains", String(user.uid)));
    //   const chats = await getDocs(qChats);
    //   const newChats = await Promise.all(chats.docs.map(async (doc) => {
    //       const chat = doc.data();
    //       chat.id =  doc.id
    //       const users = chat.users;
    //       const selectedUserID = users[0] === user.uid 
    //       ? users[1]
    //       : users[0]
    //       const messages = await getLastMessage(doc.id);
    //       const userData = await getUserData(selectedUserID, doc.id)
    //       return {
    //           ...chat,
    //           message: messages,
    //           userData: userData
    //       }  
    //   }))
    //   setChats(newChats);
    //   } 
    //   fetchData();
    fetchUsers('mid')
  }, [user])
  return (
    <Container>
      <SearchContainer>
        <TextInput mode='outlined' label='Search' style={{flexGrow: 1}} value={searchText} onChangeText={setSearchText}/>
      </SearchContainer>
      <UsersContainer>
        <UserItem activeOpacity={.6}>
          <UserImage source={require('../../../assets/default-user.png')}/>
          <UserName>Alex@gmail.com</UserName>
        </UserItem>
        <UserItem>
          <UserImage source={require('../../../assets/default-user.png')}/>
        </UserItem>
        <UserItem>
          <UserImage source={require('../../../assets/default-user.png')}/>
        </UserItem>
      </UsersContainer>
    </Container>
  )
}
const Container = styled.View`
flex-grow: 1;
background-color: #eaeaea;
`
const SearchContainer = styled.View`
flex-direction: row;
padding: 10px 5px;
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
background-color: #fff;
align-items: center;
`
const UserImage = styled.Image`
width: 40px;
height: 40px;
border-radius: 20px;
`
const UserName = styled.Text`
font-size: 16px;
font-weight: 700;
flex-grow: 1;
`

export default Users