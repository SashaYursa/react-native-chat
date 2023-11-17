import { View, Text, Image } from 'react-native'
import React from 'react'
import styled from 'styled-components'

const info = () => {
  return (
    <Container>
        <ChatInfoContainer>
            <InfoData>
                <ChatImageContainer>
                    <ChatImage source={require('../../../assets/default-chat-image.png')}/>
                </ChatImageContainer>
                <ChatDataContainer>
                    <ChatDataItem>
                        <ChatDataText>
                            Empty
                        </ChatDataText>
                    </ChatDataItem>
                    <ChatDataItem>
                        <ChatDataText>
                            Empty
                        </ChatDataText>
                    </ChatDataItem>
                </ChatDataContainer>
            </InfoData>
        </ChatInfoContainer>
        <UsersInfoContainer>
        </UsersInfoContainer>        
    </Container>
  )
}

const Container = styled.View`
flex-grow: 1;
background-color: #fff;
gap: 10px;
`
const ChatInfoContainer = styled.View`
border-width: 1px;
border-bottom-color: #000;
border-radius: 12px;
padding: 10px 5px;
border-top-width: 0;
`
const UsersInfoContainer = styled.View`
border-width: 1px;
border-top-color: #000;
border-bottom-width: 0;
border-radius: 12px;
min-height: 200px;
`
const InfoData = styled.View`
flex-direction: row;
gap: 5px;
flex-grow: 1;
align-items: center;
`

const ChatImageContainer = styled.View`
width: 100px;
height: 100px;
border-radius: 50px;
overflow: hidden;
background-color: #eaeaea;
`

const ChatImage = styled.Image`
width: 100%;
height: 100%;
`

const ChatDataContainer = styled.View`
gap: 5px;
padding: 5px;
flex-grow: 1;
height: 100%;
background-color: #154c79;
border-radius: 6px;
`

const ChatDataItem = styled.View`
flex-direction: row;
background-color: #6e6e6e;
padding: 10px 5px;
border-radius: 6px;
margin: 0 5px;
position: relative;
`

const ChatDataText = styled.Text`
font-size: 18px;
font-weight: 700;
color: #fff;
padding: 0 5px;
`

export default info