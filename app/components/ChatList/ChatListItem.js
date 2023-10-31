import { View, Text, Image } from 'react-native'
import React from 'react'
import styled from 'styled-components'
const ChatListItem = ({item}) => {
    const getTime = (time) => {
        const dayjs = require("dayjs");
        const relativeTime = require("dayjs/plugin/relativeTime");
        dayjs.extend(relativeTime);
        
        let dateNow = dayjs();
        let blogDate = new Date(time * 1000);
        return dateNow.from(blogDate, true);
    }
  return (
    <Container>
        <ImageContainer>
            <ChatImage source={item.image === null ? require('../../../assets/default-chat-image.png') : {uri:item.image}}/>
        </ImageContainer>
        <ChatData>
            <UserName numberOfLines={1}>
                {item.name ? item.name : 'No data'}
            </UserName>
            <MessageData numberOfLines={2}>
                {item.data ? item.data : 'No message'}
            </MessageData>
        </ChatData>
        <ChatInfo>
            <InfoTime>
                {item.time ? getTime(item.time) : 'No time'}
            </InfoTime>
        </ChatInfo>
    </Container>
  )
}


const Container = styled.View`
flex-direction: column;
align-items: center;
padding: 5px;
border-bottom-width: 1px;
border-bottom-color: #eaeaea;
flex-direction: row;
gap: 5px;
overflow: hidden;
`
const ImageContainer = styled.View`
padding: 10px 0;
overflow: hidden;
` 
const ChatImage = styled.Image`
width: 50px;
height: 50px;
object-fit: cover;
border-radius: 50px;
`
const ChatData = styled.View`
flex-grow: 1;
justify-content: space-between;
align-self: flex-start;
flex-shrink: 1;
`
const ChatInfo = styled.View`
padding-right: 5px;
align-self: flex-start;
`
const UserName = styled.Text`
font-size: 18px;
font-weight: 700;
color: #000;
`
const MessageData = styled.Text`
font-size: 16px;
font-weight: 400;
color: #000;
flex-grow: 1;
flex-shrink: 1;
`
const InfoTime = styled.Text`
color: #000;
font-weight: 400;
font-size: 12px;
`

export default ChatListItem