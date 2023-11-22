import { View, Text, Platform, Alert } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import TopSearch from '../../components/TopSearch'
import { SafeAreaView } from 'react-native-safe-area-context'
import styled from 'styled-components'
import useDebounce from '../../../hooks/useDebounce'
import UsersList from '../../components/UsersList'
import { SelectedChatContext } from '../../_layout'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { database } from '../../../config/firebase'

const AddUsers = () => {
	const [searchText, setSearchText] = useState('')
	const {chatData, setChatData, setChatUsers, chatUsers} = useContext(SelectedChatContext)
	const debouncedSearchValue = useDebounce(searchText, 1000);
	const inputRef = useRef()
	useEffect(() => {
		if(inputRef.current){
		inputRef.current.focus();
		}
  	}, [inputRef])

	const addUser = useCallback(async (user) => {
		// console.log(chatData)
		if(chatData.type === 'private'){
			Alert.alert('Chat type is private', 'For add more users create public chat', [
				{
					text: "Ok"
				}
			])
		}else{
			const chatDoc = doc(database, 'chats', chatData.id)
			const chatDocData = (await getDoc(chatDoc)).data()
			// console.log(chatDocData)
			const findUser = chatDocData.users.find(id => id === user.id)
			console.log(findUser)
			if(findUser){
				return Alert.alert('Error', 'User already in chat', [
					{
						text: "Ok"
					}
				])
			}
			setChatData(chatData => {
				console.log('chatData, setted ------->')
				return {
					...chatData,
					users: [
						...chatData.users,
						user.id
					]
				}
			})
			setChatUsers(chatUsers => {
				return [
					...chatUsers,
					{
						...user,
						onlineStatus: false,
						timeStamp: null
					}
				]
			})
			setDoc(chatDoc, {
				...chatDocData, 
				users: [...chatDocData.users, user.id]
			})
		}
	})
  return (
    <View style={{paddingTop:Platform.OS === 'android' ? 25 : 5, flex: 1}}>
        <TopSearch inputRef={inputRef} searchText={searchText} setSearchText={setSearchText} hasBack={Platform.OS === 'ios' ? false : true}/>
				<UsersContainer style={{flex: 1}}>
        	<UsersList searchValue={debouncedSearchValue} userAction={addUser} hideUsers={chatData.users}/>
      	</UsersContainer>
    </View>
  )
}
const UsersContainer = styled.View`
padding: 2px 5px;
flex-grow: 1;
`
export default AddUsers