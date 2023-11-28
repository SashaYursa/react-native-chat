import { View, Text, Image, Platform } from 'react-native'
import React from 'react'
import styled from 'styled-components'
import CachedImage from '../CachedImage'
import TimeAgo from '../TimeAgo'

const ChatListItem = ({item}) => {
    const defaultImage = item.type === 'private' ? require('../../../assets/default-user.png') : require('../../../assets/group-chat.png')
  return (
    <Container>
        <ImageContainer>
            {
            item.onlineStatus && <OnlineIndicator/>
            }
            { !item.image
                ? <ChatImage style={{borderColor: "#eaeaea"}} source={defaultImage}/>
                : <CachedImage url={item.image} style={{width: 50, height: 50, objectFit: 'cover', borderRadius: 50}}/>
            }
        </ImageContainer>
        <ChatData>
            <UserName numberOfLines={2}>
                {item.name ? item.name : 'No data'}
            </UserName>
            <MessageContainer>
                {item.media &&
                item.media.map(image => (
                <MessageImageContainer key={image}>
                     <CachedImage style={{width: '100%', height: '100%'}} url={image}/> 
                </MessageImageContainer>
                ))
                }
                <MessageData numberOfLines={1}>
                    {item.data ? item.data : 'No message'}
                </MessageData>
            </MessageContainer>
        </ChatData>
        <ChatInfo>
            {item.time &&
                <TimeAgo styleProps={{color: '#000', fontWeight: 400, fontSize: 12}} date={item.time} textAfter="тому"/>
            }   
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
position: relative;
` 
const ChatImage = styled.Image`
width: 50px;
height: 50px;
object-fit: cover;
border-radius: 50px;
border-width: 1px;
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
const MessageContainer = styled.View`
flex-direction: row;
gap: 5px;
justify-content: flex-start;
align-items: center;
`

const MessageImageContainer = styled.View`
width: 20px;
height: 20px;
border-radius: 6px;
overflow: hidden;
background-color: #eaeaea;
`

const MessageData = styled.Text`
font-size: 16px;
font-weight: 400;
color: #000;
flex-grow: 1;
flex-shrink: 1;
`
const OnlineIndicator = styled.View`
border-radius: 30px;
position: absolute;
width: 15px;
height: 15px;
bottom: 10px;
right: 0;
background-color: green;
z-index: 2;
`

export default ChatListItem