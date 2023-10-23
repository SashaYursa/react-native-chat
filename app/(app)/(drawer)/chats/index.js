import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import ChatItem from '../../../components/ChatList/ChatItem'
import { DrawerLayoutAndroid, TouchableOpacity } from 'react-native-gesture-handler'
import { Link, useRouter } from 'expo-router'
import { collection, doc, getDoc, getDocs, limit, limitToLast, orderBy, query, where } from 'firebase/firestore'
import { AuthUserContext } from '../../../_layout'
import { database } from '../../../../config/firebase'
const Chats = () => {
    const { user } = useContext(AuthUserContext);
    const [chats, setChats] = useState([]);
    const getUserData = async (uid) => {
            const qUser = doc(database, "users", String(uid))
            return await getDoc(qUser)
            .then(data => data.data())
            .catch(error => console.log(error))
    }
    const getLastMessage = async (chatId) => {
            const qMessages = query(collection(database, "messages", String(chatId), "message"), orderBy('createdAt', 'desc'), limit(1));
            const data = await getDocs(qMessages)
            .catch(error => console.log(error))
            const res = null
            //data.forEach(async data =>  res = data.data())
            console.log(data, 'res 0')
            return data;
    }
    useEffect(()=> {
        const fetchData = async () => {
        const qChats = query(collection(database, "chats"), where("users", "array-contains", String(user.uid)));
        //console.log(user.uid)
        await getDocs(qChats).then(async (data) => {
            let newChats = [];
            const promises = [];
            data.forEach(async element => {
                const data = element.data();
                const users = data.users;
                const selectedUserID = users[0] === user.uid 
                ? users[1]
                : users[0]
                const chat = await getUserData(selectedUserID, element.id).then(async userData => {
                    console.log('twice')
                    return await getLastMessage(element.id).then(lastMessageData=> {
                        //console.log(lastMessageData, userData, 'data')
                        return {
                            id: element.id,
                            ...data, 

                            userName: userData.displayName, 
                            userImage: userData.image,
                            lastMessage: lastMessageData.text,
                            lastMessageTime: lastMessageData.createdAt.seconds
                        }; 
                        //setChats([...chats, newChat]) 
                    })
                })
                console.log(chat, 'chattt')
                // console.log('before')
                // promises.push(new Promise(async (resolve, reject) => { 
                //     const res = await Promise.all([getUserData(selectedUserID, element.id),  getLastMessage(element.id)])
                //     console.log(res, 'rr')
                //     resolve(res)
                // }) )
                // console.log('eeee')
                // const newChat = {
                //     id: element.id,
                //     ...data, 
                //     userName: promiseRes[0].displayName, 
                //     userImage: promiseRes[0].image,
                //     lastMessage: promiseRes[1].text,
                //     lastMessageTime: promiseRes[1].createdAt.seconds
                // };              
                // //console.log(newChat, 'newwwwwww')
                // newChats.push(newChat)
                // console.log(newChat)
            });
            // await Promise.all(promises)
            // .then(data => {
            //     console.log(data, 'data 2')
            // })
            // console.log(newChats, 'new Chats')           
        });
        //setChats([...chats, ...newChats])
        } 
        fetchData();
        //return () => { setChats([]); console.log('clear')}
    }, [user])
    const router = useRouter();
    const moveToChat = (id) => {
        router.push(`chat/${id}`);
    }
  return (
    <Container>
        <ChatsList>
            {chats.length > 0 && chats.map(chat=> {
            console.log(chat, 'chta is render only one', chats.length)
            return(   
            <ChatLink key={chat.id} onPress={()=>moveToChat(chat.id)}>
                <ChatItem item={{image: chat.image ? chat.image : chat.userImage, name: chat.name ? chat.name : chat.userName, data: chat.lastMessage, time: chat.lastMessageTime}}/>
            </ChatLink>
            )})}
            {/* <ChatLink onPress={()=>moveToChat(2)}>
                <ChatItem item={{image: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png', name: 'VM', data: 'Ok', time: '10хв'}}/>
            </ChatLink>
            <ChatLink onPress={()=>moveToChat(3)}>
                <ChatItem item={{image: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png', name: 'VM', data: 'Ok', time: '10хв'}}/>
            </ChatLink>
            <ChatLink onPress={()=>moveToChat(4)}>
                <ChatItem item={{image: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png', name: 'VM', data: 'Ok', time: '10хв'}}/>
            </ChatLink> */}
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