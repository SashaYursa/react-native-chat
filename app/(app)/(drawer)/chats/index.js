import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import ChatItem from '../../../components/ChatList/ChatItem'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Link, useRouter } from 'expo-router'
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { AuthUserContext } from '../../../_layout'
import { database } from '../../../../config/firebase'

const Chats = () => {
    const { user } = useContext(AuthUserContext);
    const [chats, setChats] = useState(null);
    const getUserData = async (uid) => {
         const qUser = doc(database, "users", String(uid))
         const selectedUser = await getDoc(qUser).then(data=> data.data());
         return selectedUser
    }
    const getLastMessage = async (chatId) => {
        const qMessages = query(database, "messages", String(chatId), "message");
        const messages = getDocs(qMessages).then(data=> data.forEach(element => {
          console.log(element, 'el')  
        }))
    }
    useEffect(()=> {
        const fetchData = async () => {
        const qChats = query(collection(database, "chats"), where("users", "array-contains", String(user.uid)));
        const chatsData = await getDocs(qChats).then((data) => {
        data.forEach(element => {
          const chat = {}
          const users = element.data().users;
            let previewUser = null;
            if(users[0] === user.uid){
                previewUser = getUserData(users[1])
                
            }
            else{
               previewUser = getUserData(users[0])
            }
            getLastMessage(element.id)
            // chat.name = previewUser?.displayName ? previewUser.displayName : "no data";
            // chat.image = previewUser?.image ? previewUser.image : null;
            // setChats([...chats, chat])
        });
        });
        } 
        fetchData();
    }, [user])
    const router = useRouter();
    const moveToChat = (id) => {
        router.push(`chat/${id}`);
    }
  return (
    <Container>
        <Link href={'chat/123'}>Move to chat</Link>
        <ChatsList>
            <ChatLink onPress={()=>moveToChat(1)}>
            <ChatItem item={{image: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png', name: 'VMale', data: 'Ok', time: '10хв'}}/>
            </ChatLink>
            <ChatLink onPress={()=>moveToChat(2)}>
                <ChatItem item={{image: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png', name: 'VM', data: 'Ok', time: '10хв'}}/>
            </ChatLink>
            <ChatLink onPress={()=>moveToChat(3)}>
                <ChatItem item={{image: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png', name: 'VM', data: 'Ok', time: '10хв'}}/>
            </ChatLink>
            <ChatLink onPress={()=>moveToChat(4)}>
                <ChatItem item={{image: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png', name: 'VM', data: 'Ok', time: '10хв'}}/>
            </ChatLink>
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