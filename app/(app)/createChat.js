import { View, Text, SafeAreaView, Button, ScrollView, StyleSheet } from 'react-native'
import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { TextInput } from 'react-native-paper'
import TopSearch from '../components/TopSearch'
import UsersList from '../components/UsersList'
import useDebounce from '../../hooks/useDebounce'
import { AuthUserContext, SelectedChatContext, clearChatData } from '../_layout'
import { database } from '../../config/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { router } from 'expo-router'
    
const createChat = () => {
    const [chatName, setChatName] = useState('');
    const [searchUserText, setSearchUserText] = useState('');
    const debouncedSearchValue = useDebounce(searchUserText);
    const usersInputRef = useRef()
    const {user} = useContext(AuthUserContext);
    const [usersForChat, setUsersForChat] = useState([]);
    const {setMessages, setChatUsers, setChatData} = useContext(SelectedChatContext)
    const usersId = useMemo(() => {
        if(!usersForChat.length) return null
        return usersForChat.map(u => u.id)
    }, [usersForChat])

    const addUserToChat = useCallback((user) => {
        setUsersForChat(users => [...users, user])
    }, [])

    const removeSelectedUser = (user) => {
        setUsersForChat(users => users.filter(u => u.id !== user.id))
    }

    const createChat = async () => {
        clearChatData(setChatUsers, setMessages, setChatData)
        await addDoc(collection(database, 'chats'),{
            name: chatName,
            users: [user.uid , ...usersId],
            type: 'public',
            image: null,
            createdAt: serverTimestamp()
        }).then(doc => {
            router.back();
            router.push(`chat/${doc.id}`)
        })
    }
    
    return (
        <SafeAreaView style={{flex: 1}}>
            <Header>
                <Button  title='Back' onPress={() => {
                    console.log('go back')
                }}/>
                <HeaderTitle>
                    Create chat
                </HeaderTitle>
                <Button title='Create' disabled={!usersId || !chatName.trim().length} onPress={createChat}/>
            </Header>
            <ChatInputFieldsContainer>
                <TextInput label='Chat name' mode='outlined'
                            onChangeText={text => setChatName(text)}
                            value={chatName}
                            theme={{colors: {primary: '#007bff'}}}
                />
            </ChatInputFieldsContainer>
            { usersForChat.length > 0 &&
                <SelectedUsersContainer>
                <ScrollView horizontal contentContainerStyle={style.selectedUsers}>
                    {usersForChat.map(user => {
                        return (
                            <SelectedUser key={user.id}>
                                <SelectedUserName>
                                    {user.displayName}
                                </SelectedUserName>
                                <RemoveUserButton onPress={() => removeSelectedUser(user)} style={{borderColor: '#000'}}>
                                    <RemoveUserIcon source={require('../../assets/remove-item.png')}/>
                                </RemoveUserButton>
                            </SelectedUser>
                        )
                    })}
                </ScrollView>
                </SelectedUsersContainer>
            }
            <UsersAddContainer>
                <TopSearch inputRef={usersInputRef} searchText={searchUserText} setSearchText={setSearchUserText} hasBack={false}/>
                <UsersContainer style={{flex: 1}}>
                    <UsersList searchValue={debouncedSearchValue} userAction={addUserToChat} hideUsers={usersId} />
                </UsersContainer>
            </UsersAddContainer>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    selectedUsers: {
        gap: 5,
        flexDirection: 'row',
        minWidth: '100%',
        alignItems: 'center',
        marginBottom: 10
    }
})

const Header = styled.View`
flex-direction: row;
justify-content: space-between;
border-bottom-width: 1px;
border-color: #e6e6e6;
padding: 5px;
align-items: center;
`
const HeaderTitle = styled.Text`
font-size: 18px;
font-weight: 700;
color: #000;
`

const ChatInputFieldsContainer = styled.View`
margin: 20px 10px 0;
gap: 10px;
`

const SelectedUsersContainer = styled.View` 
margin-top: 10px;
padding: 5px 10px;
align-items: center;
justify-content: center;
`
const SelectedUser = styled.View`
padding: 5px;
border-radius: 24px;
background-color: #fff;
flex-direction: row;
gap: 5px;
align-items: center;
`
const SelectedUserName = styled.Text`
font-size: 18px;
color: #000;
font-weight: 400;
`
const RemoveUserButton = styled.TouchableOpacity`
height: 20px;
width: 20px;
border-radius: 10px;
border-color: #000;
border-width: 1px;
`
const RemoveUserIcon = styled.Image`
width: 100%;
height: 100%;
`

const UsersAddContainer = styled.View`
flex-grow: 1;
background-color: #fff;
border-radius: 12px 12px 0 0;
padding: 0 5px;
margin-top: 20px;
`
const UsersContainer = styled.View`
padding: 2px 5px;
flex-grow: 1;
`

export default createChat