import React from 'react'
import styled from 'styled-components'
import ChatItem from '../../../components/ChatList/ChatItem'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Link, useRouter } from 'expo-router'

const Chats = () => {
    const router = useRouter();
    const moveToChat = (id) => {
        router.push(`chat/${id}`);
    }
  return (
    <Container>
        <Link href={'chat/123'}>Move to chat</Link>
        <ChatsList>
            <ChatLink onPress={()=>moveToChat(1)}>
            <ChatItem item={{image: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png', name: 'VM', data: 'Ok', time: '10хв'}}/>
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