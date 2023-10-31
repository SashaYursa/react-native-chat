import React, { useContext, useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import styled from 'styled-components'
import ChatListItem from '../../../components/ChatList/ChatListItem'
import { DrawerLayoutAndroid, TouchableOpacity } from 'react-native-gesture-handler'
import { Link, useRouter } from 'expo-router'
import { collection, doc, getDoc, getDocs, limit, limitToLast, orderBy, query, where } from 'firebase/firestore'
import { AuthUserContext } from '../../../_layout'
import { database } from '../../../../config/firebase'
import { setParams } from 'expo-router/src/global-state/routing'
import { getUserData } from '../../_layout'
const Chats = () => {
    const { user } = useContext(AuthUserContext);
    const [chats, setChats] = useState([]);
    
    const getLastMessage = async (chatId) => {
        const qMessages = query(collection(database, "messages", String(chatId), "message"), orderBy('createdAt', 'desc'), limit(1));
        const data = await getDocs(qMessages)
        .catch(error => console.log(error))
        const res = await Promise.all(data.docs.map(async e => { 
            return e.data();
        }));
        return await res[0];
    }

    useEffect(() => {
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
                userData: userData
            }  
        }))
        setChats(newChats);
        } 
        fetchData();
    }, [user])
    const router = useRouter();
    const moveToChat = (id, name, image) => {
        router.push({pathname: `chat/${id}`, params: name, image});
    }

    return (
        <Container>
            <ChatsList>
                {chats.length > 0 && chats.map(chat=> (
                <ChatLink key={chat.id} onPress={()=>moveToChat(chat.id, chat.name ? chat.name : chat.userData.displayName, chat.image ? chat.image : chat.userData.image)}>
                    <ChatListItem item={{image: chat.image ? chat.image : chat.userData.image, name: chat.name ? chat.name : chat.userData.displayName, data: chat?.message?.text !== undefined ? chat.message.text : 'Повідомлень немає' , time: chat?.message?.createdAt?.seconds ? chat.message.createdAt.seconds : null}}/>
                </ChatLink>
                ))}
            </ChatsList>
        </Container>
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