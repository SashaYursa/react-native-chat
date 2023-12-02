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
const Chats = () => {
    console.log('rerender chats')
    const { user } = useContext(AuthUserContext);
    // const [chats, setChats] = useState([]);
    const [usersOnlineStatus, setUsersOnlineStatus] = useState(null);
    const [chatsLastMessages, setChatsLastMessages] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const {setMessages, getChatData, setChatUsers, setChatsData, addLastMessage, getChatLastMessage} = useContext(SelectedChatContext)
    const chats = getChatData();
    const router = useRouter();
    
    const getLastMessage = async (chatId) => {
        const qMessages = query(collection(database, "messages", String(chatId), "message"), orderBy('createdAt', 'desc'), limit(1));
        const data = await getDocs(qMessages)
        .catch(error => console.log(error))
        const res = await Promise.all(data.docs.map(async e => { 
            return e.data();
        }));
        return await res[0];
    }
    const fetchData = async () => {
        const qChats = query(collection(database, "chats"), where("users", "array-contains", String(user.uid)));
        const chats = await getDocs(qChats);
        const newChats = await Promise.all(chats.docs.map(async (doc) => {
            const chat = doc.data();
            chat.id =  doc.id
            const users = chat.users;
            const selectedUserID = users[0] === user.uid 
                ? users[1]
                : users[0]
            const messages = await getLastMessage(doc.id);
            const userData = await getUserData(database, selectedUserID)
            
            return {
                ...chat,
                message: messages,
                userData: userData,
                onlineStatus: false
            }  
        }))
        const sortedChats = newChats.sort((a, b) => {
            if(!b.message){
                return -1;  
            }
            return b.message?.createdAt?.seconds - a.message?.createdAt?.seconds
        })
        setChatsData(sortedChats)
        setRefresh(false);
        } 

    useEffect(() => {
        fetchData();
    }, [user])

    const checkMessages = async (chatId) => {
            console.log('checking messages')
            const totalMessagesCount = (await getCountFromServer(collection(database, 'messages', chatId, 'message'))).data().count
            const readedMessages = (await getCountFromServer(query(collection(database, 'messages', chatId, 'message'), where("isRead", "array-contains", user.uid)))).data().count
            return (totalMessagesCount - readedMessages)
    }

    // observing users status
    useEffect(() => {
        let unsubs = [];
        if(!refresh){
            unsubs = chats.map(chat => {
                if(chat.type === "private"){
                    const unsub = onValue(ref(rDatabase, '/status/' + chat.userData.id), (snapShot) => {
                        const value = snapShot.val();
                        setUsersOnlineStatus(usersOnlineStatus =>{
                            if(usersOnlineStatus === null){
                                return {
                                    [chat.userData.id]: value?.isOnline 
                                }
                            }
                            return {
                                ...usersOnlineStatus,
                                [chat.userData.id]: value?.isOnline
                            }
                        })
                    })
                    return unsub;
                }
            })
        }
        return () => unsubs.forEach(unsub => {
            console.log(unsub, '-----> unsub')
            if(unsub){
                unsub();    
            }
        });
    }, [chats])

    // observing users messages
    useEffect(() => {
        let unsubs = [];
        unsubs = chats.map(chat => {
            const qMessages = query(collection(database, "messages", String(chat.id), "message"), orderBy('createdAt', 'desc'), limit(1));
            const unsubscribe = onSnapshot(qMessages, async (snapShot) => {
                snapShot.docs.forEach(async e => { 
                    console.log('new message')
                    const data = e.data();
                    let unreadedMessagesCount = await checkMessages(chat.id)
                    addLastMessage({
                        ...data, 
                        text: data.text ? data.text : data.media !== null ? 'Фото' : 'Повідомлень немає',
                        id: e.id, 
                        createdAt: data.createdAt?.seconds,
                        unreadedMessagesCount
                    }, chat.id)
                //     setChatsLastMessages(lastMessages => {
                //     const message = {
                //         images: data.media === null ? null : data.media,
                //         text: data.text ? data.text : data.media !== null ? 'Фото' : 'Повідомлень немає',
                //         createdAt: data.createdAt?.seconds,
                //         unreadedMessagesCount
                //     }
                //     if(lastMessages == null){
                //         return {
                //             [chat.id]: message
                //         }
                //     }
                //     return {
                //         ...lastMessages,
                //         [chat.id]: message
                //     }
                // })
                });
            })
            return unsubscribe;  
        })
        return () => unsubs.forEach(unsub => {
            unsub();    
        });
    }, [chats])


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
        const selectedChatMessage = getChatLastMessage(itemData.id)
        const message = selectedChatMessage ? selectedChatMessage.messageData : {
            images: null,
            text: 'Повідомлень немає',
            createdAt: null,
            unreadedMessagesCount: 0
        } 
        const image =  itemData.type === "public" ? itemData.image : itemData.userData.image
        const item = {
            image,
            userData: itemData.userData,
            name: itemData.name ? itemData.name : itemData.userData.displayName,
            data: message.text,
            time: message.createdAt,
            media: message.images,
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

    return (
        <View style={{flex: 1}}>
            <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    }>
                <Container>
                    <ChatsList>
                        {chats.length > 0 && chats.map(chat => {
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