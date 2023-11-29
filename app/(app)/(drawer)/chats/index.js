import React, { useContext, useEffect, useState } from 'react'
import { View, Text, RefreshControl, ScrollView, Platform, TouchableOpacity, Image } from 'react-native'
import styled from 'styled-components'
import ChatListItem from '../../../components/ChatList/ChatListItem'
import {  useRouter } from 'expo-router'
import { collection, getCountFromServer, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { AuthUserContext, SelectedChatContext, clearChatData } from '../../../_layout'
import { database, rDatabase } from '../../../../config/firebase'
import { getUserData } from '../../_layout'
import { onValue, ref } from 'firebase/database'
import UnreadMessagesIndicator from '../../../components/UnreadMessagesIndicator'
const Chats = () => {
    const { user } = useContext(AuthUserContext);
    const [chats, setChats] = useState([]);
    const [usersOnlineStatus, setUsersOnlineStatus] = useState(null);
    const [chatsLastMessages, setChatsLastMessages] = useState(null);
    const [unreadedMessages, setUnreadedMessages] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const {setMessages, setChatUsers, setChatData} = useContext(SelectedChatContext)
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
        setChats(sortedChats)
        setRefresh(false);
        } 

    useEffect(() => {
        fetchData();
    }, [user])

    useEffect(() => {
        const checkMessages = async () => {
            console.log('checking messages')
            let i = 0
            const unreadedMessages = await Promise.all(chats.map(async chat => {
                console.log(i++)
                const totalMessagesCount = (await getCountFromServer(collection(database, 'messages', chat.id, 'message'))).data().count
                const readedMessages = (await getCountFromServer(query(collection(database, 'messages', chat.id, 'message'), where("isRead", "array-contains", user.uid)))).data().count
                return {id: chat.id, unreadedMessages: totalMessagesCount - readedMessages}
            }))
            setUnreadedMessages(unreadedMessages)
        }
        checkMessages()
    }, [chats])

    // observing users status
    useEffect(() => {
        let unsubs = [];
        if(!refresh){
            unsubs = chats.map(chat => {
                const unsub = onValue(ref(rDatabase, '/status/' + chat.userData.id), (snapShot) => {
                    const value = snapShot.val();
                    setUsersOnlineStatus(usersOnlineStatus =>{
                        if(usersOnlineStatus === null){
                            return {
                                [chat.userData.id]: value.isOnline 
                            }
                        }
                        return {
                            ...usersOnlineStatus,
                            [chat.userData.id]: value.isOnline
                        }
                    })
                })
                return unsub;
            })
        }
        return () => unsubs.forEach(unsub => {
            unsub();    
        });
    }, [chats])

    // observing users messages
    useEffect(() => {
        let unsubs = [];
        unsubs = chats.map(chat => {
            const qMessages = query(collection(database, "messages", String(chat.id), "message"), orderBy('createdAt', 'desc'), limit(1));
            const unsubscribe = onSnapshot(qMessages, async (snapShot) => {
                snapShot.docs.forEach(async e => { 
                    const data = e.data(); 
                    setUnreadedMessages(unreadedChats =>{
                        return(unreadedChats.map(unreadedChat => {
                            if(unreadedChat.id === chat.id){
                                return {...unreadedChat, unreadedMessages: unreadedChat.unreadedMessages + 1}
                            }
                            return unreadedChat;
                        }))
                    })
                    setChatsLastMessages(lastMessages => {
                    const message = {
                        images: data.media === null ? null : data.media,
                        text: data.text ? data.text : data.media !== null ? 'Фото' : 'Повідомлень немає',
                        createdAt: data.createdAt?.seconds
                    }
                    if(lastMessages == null){
                        return {
                            [chat.id]: message
                        }
                    }
                    return {
                        ...lastMessages,
                        [chat.id]: message
                    }
                })
            });
            })
            return unsubscribe;  
        })
        return () => unsubs.forEach(unsub => {
            unsub();    
        });
    }, [chats])

    const router = useRouter();

    const hadnleChatClick = (chat) => {
        clearChatData(setChatUsers, setMessages, setChatData)
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
        const message = chatsLastMessages?.[itemData.id] ? chatsLastMessages[itemData.id] : {
            images: null,
            text: 'Повідомлень немає',
            createdAt: null
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
            onlineStatus: usersOnlineStatus ? usersOnlineStatus[itemData.userData.id] : false
        }
        return(
            <ChatListItem item={item} />
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
                        {chats.length > 0 && chats.map(chat => (
                        <ChatLink key={chat.id} onPress={() => hadnleChatClick(chat)}>
                            {
                                <ChatItem itemData={chat}/>
                            }
                            { unreadedMessages.length > 0 &&
                                <UnreadMessagesCountCountainer>
                                    <UnreadMessagesIndicator count={unreadedMessages.find(unrd => unrd.id === chat.id).unreadedMessages}/>
                                </UnreadMessagesCountCountainer>
                            }
                        </ChatLink>
                        ))}
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