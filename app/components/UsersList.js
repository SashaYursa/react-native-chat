import { View, Text, ActivityIndicator, ScrollView, Keyboard, FlatList } from 'react-native'
import React, { memo, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import UserImage from './UserImage'
import CachedImage from './CachedImage'
import { database } from '../../config/firebase'
import { collection, endAt, getDocs, limit, orderBy, query, startAt } from 'firebase/firestore'
import { AuthUserContext, FirebaseContext } from '../_layout'
import { useSelector } from 'react-redux'
const UsersList = memo(({searchValue, userAction, hideUsers = null}) => {
    const user = useSelector(state => state.auth.user);
    const [usersLoading, setUsersLoading] = useState(true);
    const [searchUsers, setSearchUsers] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState(null)

    const closeKeyboard = () => {
        if(Keyboard.isVisible()){
            Keyboard.dismiss()
        }
    }    

    useEffect(() => {
        getLastUsers();
    }, [])

    useEffect(() => {
        const value = searchValue.trim();
        if(value.length > 0){
            setUsersLoading(true);
            const qUsers = query(collection(database, "users"), 
            orderBy('displayName'),
            startAt(value),
            endAt(value + "\uf8ff"));
            fetchUsers(qUsers);
        }
        else{
            setUsersLoading(true);
            getLastUsers();
        }
    }, [searchValue])

    useEffect(() => {
        if(hideUsers?.length && searchUsers){
            setFilteredUsers(searchUsers.filter(s => s.id !== hideUsers.find(hide => hide === s.id)))
        }else if(hideUsers === null && searchUsers){
            setFilteredUsers(searchUsers)
        }
    }, [hideUsers])

    const getLastUsers = () => {
        const qUsers = query(collection(database, "users"), orderBy("lastCheckedStatus", "desc"), limit(50));
        fetchUsers(qUsers)
    }
    const fetchUsers = async (query) => {
        const users = await getDocs(query);
        let newUsers = [];
        if(hideUsers){
            newUsers = users.docs.map(res => res.data()).filter(item => item.id !== hideUsers.find(id => id === item.id))
        }
        else{
            newUsers = users.docs.map(res => res.data()).filter(item => item.id !== user.uid)
        }
        setSearchUsers(newUsers);
        setFilteredUsers(newUsers);
        setUsersLoading(false);
    }

    const renderItem = ({item}) => {
        return (
            <UserItem activeOpacity={.6} onPress={() => userAction(item)}>
                <UserImage imageUrl={item.image} style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff'}}/>
                <UserName>{item.displayName}</UserName>
            </UserItem>
        )
    }
    
    return usersLoading
    ?  (<ActivityIndicator size={'large'}/>)
    : filteredUsers.length > 0 
        ? (<FlatList contentContainerStyle={{gap: 5, paddingBottom: 10}}
                        onScrollBeginDrag={closeKeyboard}
                        renderItem={renderItem}
                        data={filteredUsers} />)
        : (<View><Text>Users not found</Text></View>)
})

const UserItem = styled.TouchableOpacity`
display: flex;
flex-direction: row;
gap: 10px;
padding: 8px 10px;
border-radius: 12px;
background-color: #eaeaea;
align-items: center;
`
const UserName = styled.Text`
font-size: 16px;
font-weight: 700;
flex-grow: 1;
`

export default UsersList