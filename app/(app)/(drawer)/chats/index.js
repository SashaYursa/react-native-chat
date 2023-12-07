import React, { useContext, useEffect, useState } from 'react'
import { View, Text, RefreshControl, ScrollView, Platform, TouchableOpacity, Image } from 'react-native'
import styled from 'styled-components'
import ChatListItem from '../../../components/ChatList/ChatListItem'
import {  useNavigation, useRouter } from 'expo-router'
import { collection, getCountFromServer, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { AuthUserContext, SelectedChatContext, clearChatData } from '../../../_layout'
import { database, rDatabase } from '../../../../config/firebase'
import { getUserData } from '../../_layout'
import { onValue, ref } from 'firebase/database'
import UnreadMessagesIndicator from '../../../components/UnreadMessagesIndicator'
import { ActivityIndicator } from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'
import { setChats, setCurrentChat } from '../../../store/features/chats/chatsSlice'
import { useFetchChatsQuery } from '../../../store/features/chats/chatsApi'
import { addLastMessage, addBlankMessage } from '../../../store/features/messages/messagesSlice'
import useDebounce from '../../../../hooks/useDebounce'
import { useFetchAllChatsUsersQuery } from '../../../store/features/users/usersApi'
import { setUsers, updateOnlineStatus } from '../../../store/features/users/usersSlice'
import { legacy_createStore } from '@reduxjs/toolkit'
import { useLazyStartReciveMessagesQuery } from '../../../store/features/messages/messagesApi'

const Chats = ({user}) => {
    const [refresh, setRefresh] = useState(false);
    const [reciveMessage, {error: reciveMessageError, data}] = useLazyStartReciveMessagesQuery()
    console.log(data, 'recive message data')
    const dispatch = useDispatch();
    const currentChat = useSelector(state => state.chats.currentChat)
    const chatsData = useFetchChatsQuery(user.uid)
    const usersForChats = chatsData.isLoading === false
    ? (chatsData.data.map(chat => chat.users)).flat(2).filter((value, index, array) => {
        if(value === user.uid) return false
        return array.indexOf(value) === index;
    }) 
    : []

    const lastMessages = (useDebounce(useSelector(state => state.messagesData.chatsMessages), 100))?.map(({messages, ...rest}) => {
        const messageDays = messages[0]
        let message = null 
        if(messageDays){
            message = messageDays.data[0]
            return {
                ...rest,
                message: {
                    ...message,
                    text: message?.text ? message.text : message.media !== null ? 'Фото' : 'Повідомлень немає',
                    createdAt: message?.createdAt.seconds
                } 
            }
        }
        else{
            return {
                ...rest,
                message: null
            }
        }
    })
    // console.log(JSON.stringify(lastMessages), 'last messages =>>>>>>>>')
    
    useFetchAllChatsUsersQuery(usersForChats)
    const {users: chatUsers, loading: usersLoading, error: usersError} = useDebounce(useSelector(state => state.users), 100)
    const router = useRouter();

    useEffect(() => {
        if(currentChat !== null){
            router.push(`chat/${currentChat}`);
        }
    }, [currentChat])

    // observing users status
    useEffect(() => {
        let unsubs = [];
        if(!usersLoading){
            unsubs = usersForChats.map(userId => {
                const unsub = onValue(ref(rDatabase, '/status/' + userId), (snapShot) => {
                    const value = snapShot.val();
                    dispatch(updateOnlineStatus({id: userId, isOnline: value?.isOnline, timeStamp: value.timeStamp}))
                })
                return unsub;
            })
        }
        return () => unsubs.forEach(unsub => {
            console.log(unsub, '-----> unsub')
            if(unsub){
                unsub();    
            }
        });
    }, [usersLoading])

    const checkMessages = async (chatId) => {
            const totalMessagesCount = (await getCountFromServer(collection(database, 'messages', chatId, 'message'))).data().count
            const readedMessages = (await getCountFromServer(query(collection(database, 'messages', chatId, 'message'), where("isRead", "array-contains", user.uid)))).data().count
            return {unreadedMessagesCount: (totalMessagesCount - readedMessages), totalMessagesCount, readedMessages}
    }

    const userIsInChat = (chatId) => {
        // console.log(currentChat, '   current Chat')
        // console.log(chatId, '   chat.id Chat')
        return currentChat === chatId
    }
    // observing users messages
    useEffect(() => {
        let unsubs = [];
        if(!chatsData.isLoading){
            chatsData.data.map(chat => {
                reciveMessage({chatId: chat.id, userId: user.uid})
                const qMessages = query(collection(database, "messages", String(chat.id), "message"), orderBy('createdAt', 'desc'), limit(1));
                const unsubscribe = onSnapshot(qMessages, async (snapShot) => {
                    if(!snapShot.docs.length){
                        dispatch(addBlankMessage({
                            chatId: chat.id
                        }))
                    }
                    snapShot.docs.forEach(async e => { 
                        const data = e.data();
                        
                        if(!data.isRead.includes(user.uid) && userIsInChat(chat.id)){
                            console.log(Platform.OS, 'user in chat and read this message')
                        }
                        if(data?.createdAt?.seconds){
                            const messageCreatedAt = new Date(data?.createdAt?.seconds * 1000)
                            const messageSlug = messageCreatedAt.getFullYear() + "_" + messageCreatedAt.getMonth() + "_" + messageCreatedAt.getDate();  
                            let unreadedMessagesCount = await checkMessages(chat.id)
                            dispatch(addLastMessage({
                                message: {
                                    date: messageSlug, 
                                    data: [{
                                        ...data,
                                        id: e.id, 
                                    }]
                                }, 
                                chatId: chat.id,
                                ...unreadedMessagesCount
                            }))
                        }
                        });
                })
                return unsubscribe;  
            })
        }
        return () => unsubs.forEach(unsub => {
            unsub();    
        });
    }, [chatsData.isLoading, currentChat])

      // add to state currentChat i.e. open chat and open it
    const hadnleChatClick = ({id}) => {
        dispatch(setCurrentChat({currentChat: id}))
    }
    const onRefresh = () => {
        setRefresh(true);
        fetchData()
    }
    const ChatItem = ({itemData}) => {
        const selectedChatMessage = lastMessages.find(lm => lm.chatId === itemData.id)
        const message = selectedChatMessage?.message ? selectedChatMessage?.message : {
            media: null,
            text: 'Повідомлень немає',
            createdAt: null,
        } 
        const selectedUser = chatUsers.find(chatUser => chatUser.id === itemData.users.find(id => id !== user.uid))
        const image =  itemData.type === "public" ? itemData.image : selectedUser.image
        const item = {
            image,
            userData: selectedUser,
            name: itemData.name ? itemData.name : selectedUser.displayName,
            data: message.text,
            time: message.createdAt,
            media: message.media,
            type: itemData.type,
            onlineStatus: selectedUser.isOnline
        }
        return(
            <ChatLink onPress={() => hadnleChatClick(itemData)}>
                <ChatListItem item={item} />
                {selectedChatMessage?.unreadedMessagesCount > 0 &&
                <UnreadMessagesCountCountainer>
                    <UnreadMessagesIndicator count={selectedChatMessage.unreadedMessagesCount}/>
                </UnreadMessagesCountCountainer>
                }
            </ChatLink>
        )
    } 
    // return <View><Text>1231231</Text></View>
    if(!lastMessages?.length){
        return <ActivityIndicator/>
    }

    if(usersError || chatsData.error){
        return <View>
                <Text>
                    error in chat users or chats data
                </Text>
            </View>
    }
    if(usersLoading || chatsData.isLoading){
        return <ActivityIndicator />
    }

    return (
        <View style={{flex: 1}}>
            <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    }>
                <Container>
                    <ChatsList>
                        {chatsData.data.length > 0 && chatsData.data.map(chat => {
                            return (
                                <ChatItem key={chat.id} itemData={chat}/>
                            )
                        })}
                    </ChatsList>
                </Container>
            </ScrollView>
            <CreateChatButton onPress={() => {router.push('createChat')}}>
                <CreateChatIcon source={require('../../../../assets/create-chat.png')} />
            </CreateChatButton>
        </View>
    )
}

const Container  = styled.View`
background-color: #fff;
flex-grow: 1;
align-items: center;
`
const ChatsList = styled.View`
display: flex;
flex-direction: column;
width: 100%;
`
const ChatLink = styled.TouchableOpacity`
flex-grow: 1;
position: relative;
`
const CreateChatButton = styled.TouchableOpacity`
width: 60px;
height: 60px;
position: absolute;
bottom: 30px;
right: 20px;
border-radius: 40px;
align-items: center;
justify-content: center;
background-color: #bfbfbf;
`

const CreateChatIcon = styled.Image`
width: 50%;
height: 50%;
`

const UnreadMessagesCountCountainer = styled.View`
position: absolute;
right: 10px;
top: 45%;
`


export default Chats