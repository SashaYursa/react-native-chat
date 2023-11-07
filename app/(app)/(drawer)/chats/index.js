import React, { useContext, useEffect, useState } from 'react'
import { View, Text, RefreshControl, ScrollView } from 'react-native'
import styled from 'styled-components'
import ChatListItem from '../../../components/ChatList/ChatListItem'
import { DrawerLayoutAndroid, TouchableOpacity } from 'react-native-gesture-handler'
import { Link, useRouter } from 'expo-router'
import { collection, doc, getDoc, getDocs, limit, limitToLast, orderBy, query, where } from 'firebase/firestore'
import { AuthUserContext } from '../../../_layout'
import { database, rDatabase } from '../../../../config/firebase'
import { setParams } from 'expo-router/src/global-state/routing'
import { checkUserStatus, getUserData } from '../../_layout'
import { onValue, ref } from 'firebase/database'
const Chats = () => {
    const { user } = useContext(AuthUserContext);
    const [chats, setChats] = useState([]);
    const [refresh, setRefresh] = useState(false);
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
        setChats(newChats.sort((a, b) => {
            if(!b.message){
                return -1;  
            }
            return b.message?.createdAt?.seconds - a.message?.createdAt?.seconds
        }));
        setRefresh(false);
        } 

    useEffect(() => {
        fetchData();
    }, [user])

    useEffect(() => {
        let unsubs = [];
        if(!refresh){
            unsubs = chats.map(chat => {
                const unsub = onValue(ref(rDatabase, '/status/' + chat.userData.id), (snapShot) => {
                    const value = snapShot.val();
                    setChats(chats => {
                        return chats.map(chatItem => {
                            if(chat.userData.id === chatItem.userData.id){
                                return {
                                    ...chatItem,
                                    onlineStatus: value.isOnline
                                }
                            }
                            return chatItem;
                        })
                    })
                })
                return unsub;
            })
        }
        return () => unsubs.forEach(unsub => {
            unsub();    
            });
    }, [refresh])
    const router = useRouter();

    const hadnleChatClick = (chat) => {
        moveToChat(chat.id)
    }

    const updateLastSeenChat = (chatId) => {
    }

    const moveToChat = (id) => {
        router.push(`chat/${id}`);
    }

    const onRefresh = () => {
        setRefresh(true);
        fetchData()
    }
    const ChatItem = (itemData) => {
        const item = {
            image: itemData.image ? itemData.image : itemData.userData.image,
            userData: itemData.userData,
            name: itemData.name ? itemData.name : itemData.userData.displayName,
            data: itemData?.message?.text !== undefined ? itemData.message.text : 'Повідомлень немає',
            time: itemData?.message?.createdAt?.seconds ? itemData.message.createdAt.seconds : null,
            onlineStatus: itemData.onlineStatus
        }
        return(
            <ChatListItem item={item} />
        )
    } 

    return (
         <ScrollView
                refreshControl={
                <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                }>
            <Container>
                <ChatsList>
                    {chats.length > 0 && chats.map(chat => (
                    <ChatLink key={chat.id} onPress={() => hadnleChatClick(chat)}>
                       {
                        ChatItem(chat)
                       }
                    </ChatLink>
                    ))}
                </ChatsList>
            </Container>
        </ScrollView>
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
`

export default Chats