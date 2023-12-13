import { View, Text, Platform, Alert, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import TopSearch from '../../components/TopSearch'
import { SafeAreaView } from 'react-native-safe-area-context'
import styled from 'styled-components'
import useDebounce from '../../../hooks/useDebounce'
import UsersList from '../../components/UsersList'
import { SelectedChatContext } from '../../_layout'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { database } from '../../../config/firebase'
import { useLocalSearchParams } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { useAddUserMutation } from '../../store/features/chats/chatsApi'
import { loadUser } from '../../store/features/users/usersSlice'

const AddUsers = () => {
	const [searchText, setSearchText] = useState('')
	const { id } = useLocalSearchParams()
	const dispatch = useDispatch()
	const [addUserAction, {data: addUserResult, error: addUserError, isLoading: addUserIsLoading}] = useAddUserMutation()
	// useEffect(() => {
	// 	console.log('adduser error ----->', addUserError)
	// }, [addUserError])
	const chatData = useSelector(state => state.chats.chats.find(chat => chat.id === id))

	useEffect(() => {
		console.log('chat data update is here')
		console.log(chatData)
	}, [chatData])
	// const chatUsers = useSelector(state => state.users.users)
	// console.log({chatUsers})
	const debouncedSearchValue = useDebounce(searchText, 1000);
	const inputRef = useRef()
	useEffect(() => {
		if(inputRef.current){
		inputRef.current.focus();
		}
  	}, [inputRef])

	const updateChatData = (params) => {
		console.log('upd cht data', params)
	}
	const updateChatsUsers = (params) => {
		console.log('upd cht usrs', params)
	}

	const addUser = useCallback(async (user) => {
		// console.log(chatData)
		if(chatData.type === 'private'){
			Alert.alert('Chat type is private', 'For add more users create public chat', [
				{
					text: "Ok"
				}
			])
		}
		else{
			// const chatDoc = doc(database, 'chats', chatData.id)
			// const chatDocData = (await getDoc(chatDoc)).data()
			const findUser = chatData.users.find(id => id === user.id)
			// console.log(findUser)
			if(findUser){
				return Alert.alert('Error', 'User already in chat', [
					{
						text: "Ok"
					}
				])
			}
			else{
				addUserAction({chatId: chatData.id, users: [...chatData.users, user.id]})
				dispatch(loadUser(user))
				// 
			}
			// setDoc(chatDoc, {
			// 	...chatDocData, 
			// 	users: [...chatDocData.users, user.id]
			// })	
		}
	})
	// if(addUserIsLoading){
	// 	return <ActivityIndicator/>
	// }
	return (
		<View style={{paddingTop:Platform.OS === 'android' ? 25 : 5, flex: 1}}>
			<TopSearch inputRef={inputRef} searchText={searchText} setSearchText={setSearchText} hasBack={Platform.OS === 'ios' ? false : true}/>
			<UsersContainer style={{flex: 1}}>
				<UsersList searchValue={debouncedSearchValue} userAction={addUser} hideUsers={chatData.users}/>
			</UsersContainer>
			{addUserIsLoading && <BlockWindow>
					<ActivityIndicator size="large"/>
				</BlockWindow>}
		</View>
  	)
}
const UsersContainer = styled.View`
padding: 2px 5px;
flex-grow: 1;
`

const BlockWindow = styled.View`
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
align-items: center;
justify-content: center;
background-color: #fff;
`
export default AddUsers