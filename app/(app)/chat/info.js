import { View, Text, Image,TouchableOpacity } from 'react-native'
import React from 'react'
import styled from 'styled-components'

const Info = () => {
  return (
    <Container>
        <ChatInfoContainer>
            <InfoData>
                <ChatImageContainer>
                    <ChatImage source={require('../../../assets/default-chat-image.png')}/>
                </ChatImageContainer>
                <ChatDataContainer>
                    <ChatDataItem>
                        <PreText>Chat name</PreText>
                        <ChatDataText>
                            Empty
                        </ChatDataText>
                    </ChatDataItem>
                    <ChatDataItem>
                        <PreText>Created at</PreText>
                        <ChatDataText>
                            Empty
                        </ChatDataText>
                    </ChatDataItem>
                </ChatDataContainer>
            </InfoData>
        </ChatInfoContainer>
        <UsersInfoContainer>
            <ContainerHeader>
                Users
            </ContainerHeader>
            <UserItems contentContainerStyle={{gap: 5}}>
                <View style={{height: 2}}></View>
                <UserItem>
                    <UserItemImage>
                        <UserImage source={require('../../../assets/default-user.png')}/>
                    </UserItemImage>
                    <UserDataContainer>
                        <UserDataText style={{fontWeight: 700}}>
                            Mi4
                        </UserDataText>
                        <UserDataText>
                            Онлайн: 10 хв.
                        </UserDataText>
                    </UserDataContainer>
                </UserItem>  
                <UserItem>
                    <UserItemImage>
                        <UserImage source={require('../../../assets/default-user.png')}/>
                    </UserItemImage>
                    <UserDataContainer>
                        <UserDataText style={{fontWeight: 700}}>
                            Mi4
                        </UserDataText>
                        <UserDataText>
                            Онлайн: 10 хв.
                        </UserDataText>
                    </UserDataContainer>
                </UserItem>
                <View style={{height: 10}}></View>
            </UserItems>
        </UsersInfoContainer>  
        <ChatActions>
            <ContainerHeader>
                Actions
            </ContainerHeader>
            <ActionsContainer>
                <ActionButton style={{backgroundColor: '#22092C'}}>
                    <ActionButtonText>
                        Add users
                    </ActionButtonText>
                </ActionButton>
                <ActionButton style={{backgroundColor: '#22092C'}}>
                    <ActionButtonText>
                        Settings
                    </ActionButtonText>
                </ActionButton>
                <ActionButton style={{backgroundColor: '#BE3144'}}>
                    <ActionButtonText>
                        Leave
                    </ActionButtonText>
                </ActionButton>
            </ActionsContainer>
        </ChatActions>      
    </Container>
  )
}

const Container = styled.View`
flex-grow: 1;
background-color: #739072;
gap: 10px;
`
const ChatInfoContainer = styled.View`
border-radius: 0 0 32px 0;
background-color: #fff;
padding: 10px 5px;
border-top-width: 0;
position: relative;
background-color: #3A4D39;
`

const UsersInfoContainer = styled.View`
border-radius: 0 32px 0 32px;
background-color: #fff;
height: 55%;
background-color: #3A4D39;
`

const ChatActions = styled.View`
border-radius: 32px 0 0 0;
background-color: #fff;
border-top-width: 0;
position: relative;
background-color: #3A4D39;
min-height: 100px;
flex-grow: 1;
`

const InfoData = styled.View`
flex-direction: row;
gap: 5px;
flex-grow: 1;
align-items: center;
`
const ContainerHeader = styled.Text`
font-weight: 700;
font-size: 24px;
color: #fff;
margin: 5px 0 0 10px;
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
gap: 10px;
padding: 5px;
flex-grow: 1;
height: 100%;
border-radius: 6px;
`

const ChatDataItem = styled.View`
flex-direction: row;
background-color: #4F6F52;
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
const PreText = styled.Text`
position: absolute;
top: -8px;
left: 10px;
font-size: 12px;
font-weight: 700;
color: #fff;
`

const UserItems = styled.ScrollView`
margin: 5px 0 15px 0;
padding: 5px;
gap: 5px;
height: 100%;
overflow: hidden;
border-radius: 24px;
`
const UserItem = styled.View`
flex-direction: row;
align-items: center;
justify-content: space-between;
background-color: #4F6F52;
border-radius: 12px;
padding: 5px;
`

const UserItemImage = styled.View`
height: 40px;
width: 40px;
border-radius: 20px;
overflow: hidden;
`

const UserImage = styled.Image`
width: 100%;
height: 100%;
`

const UserDataContainer = styled.View`
flex-grow: 1;
padding: 5px;
`
const UserDataText = styled.Text`
font-size: 14px;
color: #fff;
`
const ActionsContainer = styled.View`
flex-grow: 1;
justify-content: center;
margin-bottom: 15px;
`

const ActionButton = styled.TouchableOpacity`
width: 90%;
align-self: center;
padding: 8px 10px;
align-items: center;
justify-content: center;
border-radius: 6px;
overflow: hidden;
margin-top: 5px;
`
const ActionButtonText = styled.Text`
font-size: 18px;
font-weight: 700;
color: #fff;

`

export default Info