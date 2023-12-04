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
import { setChats } from '../../../store/features/chats/chatsSlice'
import { useFetchChatsQuery } from '../../../store/features/chats/chatsApi'
import { addLastMessage } from '../../../store/reducers/lastMessages'
import useDebounce from '../../../../hooks/useDebounce'
import { useFetchAllChatsUsersQuery } from '../../../store/features/users/usersApi'
import { setUsers } from '../../../store/features/users/usersSlice'
const Chats = ({user: {user}}) => {
    console.log('uid', user.uid)
    const [refresh, setRefresh] = useState(false);

    const dispatch = useDispatch();

    const chatsData = useFetchChatsQuery(user.uid)

    const lastMessages = useDebounce(useSelector(state => state.lastMessages.messages), 100)

    const usersForChats = chatsData.isLoading === false
    ? (chatsData.data.map(chat => chat.users)).flat(2).filter((value, index, array) => {
        return array.indexOf(value) === index;
    }) 
    : []
    const chatUsers = useFetchAllChatsUsersQuery(usersForChats)

    useEffect(() => {
        if(chatUsers.isLoading === false){
            dispatch(setUsers(chatUsers))
        }    
    }, [chatUsers.isLoading])

    const router = useRouter();
    
    // const getLastMessage = async (chatId) => {
    //     const qMessages = query(collection(database, "messages", String(chatId), "message"), orderBy('createdAt', 'desc'), limit(1));
    //     const data = await getDocs(qMessages)
    //     .catch(error => console.log(error))
    //     const res = await Promise.all(data.docs.map(async e => { 
    //         return e.data();
    //     }));
    //     return await res[0];
    // }
    // const fetchData = async () => {
    //     const qChats = query(collection(database, "chats"), where("users", "array-contains", String(user.uid)));
    //     const chats = await getDocs(qChats);
    //     const newChats = await Promise.all(chats.docs.map(async (doc) => {
    //         const chat = doc.data();
    //         chat.id =  doc.id
    //         const users = chat.users;
    //         const selectedUserID = users[0] === user.uid 
    //             ? users[1]
    //             : users[0]
    //         const messages = await getLastMessage(doc.id);
    //         const userData = await getUserData(database, selectedUserID)
    //         console.log()
    //         return {
    //             ...chat,
    //             message: messages,
    //             userData: userData,
    //             onlineStatus: false
    //         }  
    //     }))
    //     const sortedChats = newChats.sort((a, b) => {
    //         if(!b.message){
    //             return -1;  
    //         }
    //         return b.message?.createdAt?.seconds - a.message?.createdAt?.seconds
    //     })
    //     // dispatch(setChats(sortedChats))
    //     setChatsData(sortedChats)
    //     setRefresh(false);
    //     } 

    // useEffect(() => {
    //     fetchData();
    // }, [user])

    

    // observing users status
    // useEffect(() => {
    //     let unsubs = [];
    //     if(!chatsData.isLoading){
    //         unsubs = chatsData.data.map(chat => {
    //             // if(chat.type === "private"){
    //             //     const unsub = onValue(ref(rDatabase, '/status/' + chat.userData.id), (snapShot) => {
    //             //         const value = snapShot.val();
    //             //         setUsersOnlineStatus(usersOnlineStatus =>{
    //             //             if(usersOnlineStatus === null){
    //             //                 return {
    //             //                     [chat.userData.id]: value?.isOnline 
    //             //                 }
    //             //             }
    //             //             return {
    //             //                 ...usersOnlineStatus,
    //             //                 [chat.userData.id]: value?.isOnline
    //             //             }
    //             //         })
    //             //     })
    //             //     return unsub;
    //             // }
    //         })
    //     }
    //     return () => unsubs.forEach(unsub => {
    //         console.log(unsub, '-----> unsub')
    //         if(unsub){
    //             unsub();    
    //         }
    //     });
    // }, [chatsData.isLoading])

    const checkMessages = async (chatId) => {
            const totalMessagesCount = (await getCountFromServer(collection(database, 'messages', chatId, 'message'))).data().count
            const readedMessages = (await getCountFromServer(query(collection(database, 'messages', chatId, 'message'), where("isRead", "array-contains", user.uid)))).data().count
            return (totalMessagesCount - readedMessages)
    }
    // observing users messages
    useEffect(() => {
        let unsubs = [];
        if(!chatsData.isLoading){
            unsubs = chatsData.data.map(chat => {
                const qMessages = query(collection(database, "messages", String(chat.id), "message"), orderBy('createdAt', 'desc'), limit(1));
                const unsubscribe = onSnapshot(qMessages, async (snapShot) => {
                    snapShot.docs.forEach(async e => { 
                        const data = e.data();
                        let unreadedMessagesCount = await checkMessages(chat.id)
                        dispatch(addLastMessage({
                            ...data, 
                            chatId: chat.id,
                            text: data.text ? data.text : data.media !== null ? 'Фото' : 'Повідомлень немає',
                            id: e.id, 
                            createdAt: data.createdAt?.seconds,
                            unreadedMessagesCount
                        }))
                    });
                })
                return unsubscribe;  
            })
        }
        return () => unsubs.forEach(unsub => {
            unsub();    
        });
    }, [chatsData.isLoading])


    const hadnleChatClick = (chat) => {
        // clearChatData(setChatUsers, setMessages, setChatData)
        moveToChat(chat.id)
    }

    const moveToChat = (id) => {
        router.push(`chat/${id}`);
    }

    const onRefresh = () => {
        setRefresh(true);
        fetchData()
    }
    const ChatItem = ({itemData}) => {
        const selectedChatMessage = lastMessages.find(lm => lm.chatId === itemData.id)
        const message = selectedChatMessage ? selectedChatMessage : {
            media: null,
            text: 'Повідомлень немає',
            createdAt: null,
            unreadedMessagesCount: 0
        } 
        const selectedUser = chatUsers.data.find(chatUser => chatUser.id === itemData.users.find(id => id !== user.uid))
        const image =  itemData.type === "public" ? itemData.image : selectedUser.image
        const item = {
            image,
            userData: selectedUser,
            name: itemData.name ? itemData.name : selectedUser.displayName,
            data: message.text,
            time: message.createdAt,
            media: message.media,
            type: itemData.type,
            onlineStatus: false
        }
        return(
            <ChatLink onPress={() => hadnleChatClick(itemData)}>
                <ChatListItem item={item} />
                {message.unreadedMessagesCount > 0 &&
                <UnreadMessagesCountCountainer>
                    <UnreadMessagesIndicator count={message.unreadedMessagesCount}/>
                </UnreadMessagesCountCountainer>
                }
            </ChatLink>
        )
    } 
    // console.log('len', lastMessages.length)
    if(!lastMessages.length){
        return <ActivityIndicator/>
    }

    if(chatUsers.error || chatsData.error){
        return <View>
                <Text>
                    error in chat users or chats data
                </Text>
            </View>
    }
    if(chatUsers.isLoading || chatsData.isLoading){
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