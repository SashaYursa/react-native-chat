import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { AuthUserContext } from '../_layout'
import ImageView from "react-native-image-viewing";
import CachedImage from './CachedImage';
import { ActivityIndicator } from 'react-native-paper';
const ChatItem = React.memo(({userName, isAuthor, userImage, pending, chatType, messageMedia, messageText, messageId, messageCreatedAt, selectMessage}) => {
    // console.log('rereder inside')
    const [isOpenedImages, setIsOpenedImages] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const openImage = (index) => {
        setSelectedImage(index);
        setIsOpenedImages(true);
    }
    const date = new Date(messageCreatedAt)
    const dateText = String(date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()) + ":" + String(date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()); 
    return (
    <MessageOutsideContaier style={isAuthor ? {justifyContent: 'flex-end'} : {justifyContent: 'flex-start'} }>
        { !isAuthor &&
            <CompanionImageContainer>
                <CachedImage url={userImage} style={{width: 30, height: 30, borderRadius: 15,backgroundColor: 'gray'}} />
            </CompanionImageContainer>       
        }
        <MessageDataContainer style={!isAuthor && {backgroundColor: '#4c7873', borderTopLeftRadius: 0, borderTopRightRadius: 12}}>
            { (chatType === 'public' && !isAuthor) && <UserName>{userName}</UserName> }
            {messageMedia &&
                <MessageImagesContainer>
                    {messageMedia.map((image, idx) => (
                        <MessageImageButton style={messageMedia.length > 2 && {width: '49%'}} key={image} onPress={()=>{openImage(idx)}} onLongPress={() => {console.log('1231231')}} delayLongPress={300} activeOpacity={1}>
                            <CachedImage style={{width: '100%', height: '100%', objectFit: 'cover'}} url={image}/>
                        </MessageImageButton>
                    ))}
                </MessageImagesContainer>
            }
            {messageText !== null &&
                <MessageText>
                    {messageText}
                </MessageText>
            }
            <MessageInfo>
                {pending 
                ? <ActivityIndicator size='small'/>
                :<MessageCreatedAt>{dateText}</MessageCreatedAt>
                }
            </MessageInfo>
        </MessageDataContainer>    
        {messageMedia && 
        <ImageView 
        images={messageMedia.map(image => ({uri: image}))}
        visible={isOpenedImages}
        imageIndex={selectedImage}
        onRequestClose={() => setIsOpenedImages(false)}
        />}
  </MessageOutsideContaier>
  )
}, (prev, next) => {
    return prev.messageId === next.messageId
})

const MessageOutsideContaier = styled.View`
flex-direction: row;
gap: 10px;
flex-grow: 1;
flex-shrink: 1;
align-items: flex-start;
`

const CompanionImageContainer = styled.View`

`
const CompanionImage = styled.Image`
width: 30px;
height: 30px;
border-radius: 15px;
background-color: gray;
`

const MessageDataContainer = styled.View`
background-color: #183373;
padding: 5px;
border-radius: 12px 0 12px 12px;
flex-shrink: 1;
max-width: 80%;
position: relative;
align-items: end;
justify-self: flex-end;
`

const UserName = styled.Text`
font-size: 14px;
font-weight: 700;
color: #EBE3D5;
`

const MessageImagesContainer = styled.View`
flex-direction: row;
flex-wrap: wrap;
gap: 5px;
z-index: 2;
flex-grow: 1;
`

const MessageImageButton = styled.TouchableOpacity`
width: 100%;
height: 200px;
border-radius: 12px;
overflow: hidden;
flex-grow: 1;
z-index: 3;
`

const MessageImage = styled.Image`

`

const MessageText = styled.Text`
font-size: 14px;
font-weight: 400;
color: #fff;
padding: 2px 5px;
`

const MessageCreatedAt = styled.Text`
font-size: 10px;
font-weight: 400;
color: #fff;

`

const MessageInfo = styled.View`
flex-direction: row;
align-self: flex-end;
margin: 2px 2px 0 2px;
`

export default ChatItem