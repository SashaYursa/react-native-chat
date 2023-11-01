import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { AuthUserContext } from '../_layout'
import ImageView from "react-native-image-viewing";

const ChatItem = React.memo(({item, selectMessage, index}) => {
    console.log('---',item?.media)
    const [isOpenedImages, setIsOpenedImages] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const openImage = (index) => {
        setSelectedImage(index);
        setIsOpenedImages(true);
    }
    const {user} = useContext(AuthUserContext);
    const isAuthor = item.uid === user.uid;
    console.log(item,'item')
    return (
    <MessageOutsideContaier style={isAuthor ? {justifyContent: 'flex-end'} : {justifyContent: 'flex-start'} }>
        { !isAuthor &&
            <CompanionImageContainer>
                <CompanionImage source={{uri: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png'}}/>
            </CompanionImageContainer>       
        }
        <MessageDataContainer style={!isAuthor && {backgroundColor: '#4c7873', borderTopLeftRadius: 0, borderTopRightRadius: 12}}>
            {item?.media?.length &&
                <MessageImagesContainer>
                    {item.media.map((image, index) => (
                        <MessageImageButton style={item.media.length > 1 && {width: '49%'}} key={image} onPress={()=>{openImage(index)}} onLongPress={() => {selectMessage(index)}} delayLongPress={300 } activeOpacity={1}>
                            <MessageImage source={{uri: image}}/>
                        </MessageImageButton>
                    ))}
                </MessageImagesContainer>
            }
            {item.text !== null &&
                <MessageText>
                    {item.text}
                </MessageText>
            }
        </MessageDataContainer>    
        {item?.media?.length && 
        <ImageView 
        images={item.media.map(image => ({uri: image}))}
        visible={isOpenedImages}
        imageIndex={selectedImage}
        onRequestClose={() => setIsOpenedImages(false)}
        />}
  </MessageOutsideContaier>
  )
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
width: 100%;
height: 100%;
object-fit: cover;
`

const MessageText = styled.Text`
font-size: 14px;
font-weight: 400;
color: #fff;
padding: 2px 5px;
`

export default ChatItem