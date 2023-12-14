import { View, Text, Image,TouchableOpacity, Platform, StyleSheet } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { useLocalSearchParams } from 'expo-router/src/hooks'
import CachedImage from '../../components/CachedImage'
import { router } from 'expo-router'
import { useSelector } from 'react-redux'
import ChatUserItem from '../../components/ChatUserItem'
import { useDeleteUserFromChatMutation } from '../../store/features/chats/chatsApi'

const Info = () => {
    const { id } = useLocalSearchParams()
    const user = useSelector(state => state.auth.user);
    const chatData = useSelector(state => state.chats.chats.find(chat => chat.id === id))
    const [deleteUserFromChat, {data: resDelete, error: resError}] = useDeleteUserFromChatMutation()
    useEffect(() => {
        if(resError){
            console.log(resError)
        }
    }, [resError])
    const chatUsers = (useSelector(state => state.users.users)).filter(u => {
        if(user.uid === u.id) return false
        if(chatData?.users?.includes(u.id)) return true
        return false
    })
    const createdAtDate = new Date(chatData.createdAt.seconds * 1000)
    const createdAt = `${createdAtDate.getFullYear()}-${createdAtDate.getMonth() + 1}-${createdAtDate.getDate()} ${createdAtDate.getHours()}:${createdAtDate.getMinutes()}`
    const defaultChatImage = chatData.type === "public" ? require('../../../assets/group-chat.png') : require('../../../assets/default-user.png')
    const headImage = chatData.type === "private" ? chatUsers[0].image : chatData.image
    const userIsAdmin = chatData.type === "public" && chatData?.admin?.includes(user.uid) 
    const deleteUser = useCallback((user) => {
        const newUsers = chatData.users.filter(u => u !== user.id)
        deleteUserFromChat({newUsers, chatId: chatData.id})
    }, [id, chatData])
    return (
      <Container>
        <ChatInfoContainer>
            <InfoData>
                <ChatImageContainer>
                    { headImage 
                        ? <CachedImage url={headImage} style={{width: '100%', height: '100%'}} />
                        : <ChatImage source={chatData.image ? {uri: chatData.image} : defaultChatImage}/>
                    }
                </ChatImageContainer>
                <ChatDataContainer>
                    <ChatDataItem>
                        <PreText>Chat name</PreText>
                        <ChatDataText style={!chatData.name && {color: '#FF6C22'}}>{chatData.name ? chatData.name : "Empty"}</ChatDataText>
                    </ChatDataItem>
                    <ChatDataItem>
                        <PreText>Created at</PreText>
                        <ChatDataText>{createdAt}</ChatDataText>
                        </ChatDataItem>
                </ChatDataContainer>
            </InfoData>
        </ChatInfoContainer>
        <UsersInfoContainer style={{flex: 1, flexGrow: 1}}>
            <ContainerHeader>
                Users
            </ContainerHeader>
            <UserItems contentContainerStyle={{gap: 5}}>
                <View style={{height: 2}}></View>
                <UserItem>
                <UserImageContainer>
                        <UserItemImage>
                            {user.image 
                                ? <CachedImage url={user.image} style={{width: '100%', height: '100%'}}/>
                                : <UserImage source={require('../../../assets/default-user.png')}/>
                            }  
                        </UserItemImage>
                        <UserOnlineStatus/>  
                    </UserImageContainer>
                    <UserDataContainer>
                        <UserDataText style={{fontWeight: 700, color: "#39A7FF"}}>
                            You
                        </UserDataText>
                        <UserDataText>
                            online
                        </UserDataText>
                    </UserDataContainer>

                </UserItem>
                
                {chatUsers.map(chatUser => (
                    <ChatUserItem key={chatUser.id} chatUser={chatUser} chatData={chatData} deleteUser={deleteUser}/>
                )
                )}
                <View style={{height: 10}}></View>
            </UserItems>
        </UsersInfoContainer>  
        <ChatActions>
            <ContainerHeader>
                Actions
            </ContainerHeader>
            <ActionsContainer contentContainerStyle={{paddingBottom: 10}}>
                {(chatData.type === 'public' && userIsAdmin) &&
                <ActionButton onPress={() => router.push({pathname: 'chat/addUsers', params: {id: chatData.id}})} style={{backgroundColor: '#22092C'}}>
                    <ActionButtonText>
                        Add users
                    </ActionButtonText>
                </ActionButton>
                }
                { userIsAdmin &&
                <ActionButton onPress={() => router.push({pathname: 'chat/settings', params: {id: chatData.id}})} style={{backgroundColor: '#22092C'}}>
                    <ActionButtonText>
                        Settings
                    </ActionButtonText>
                </ActionButton>
                }
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
height: 18%;
`

const UsersInfoContainer = styled.View`
border-radius: 0 32px 0 32px;
background-color: #fff;
background-color: #3A4D39;
`

const ChatActions = styled.View`
border-radius: 32px 0 0 0;
background-color: #fff;
border-top-width: 0;
position: relative;
background-color: #3A4D39;
height: 180px;
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
justify-content: center;
flex-grow: 1;
`

const ChatDataItem = styled.View`
flex-direction: row;
background-color: #4F6F52;
padding: 10px 5px;
border-radius: 6px;
margin: 0 5px;
position: relative;
`
const PreText = styled.Text`
position: absolute;
top: -8px;
left: 10px;
font-size: 12px;
font-weight: 700;
color: #fff;
`

const ChatDataText = styled.Text`
font-weight: 700;
font-size: 18px;
font-weight: 700;
color: #fff;
padding: 0 5px;
`

const UserItems = styled.ScrollView`
margin: 5px 0 15px 0;
padding: 5px;
gap: 5px;
flex-grow: 1;
overflow: hidden;
border-radius: 24px;
`
const UserItem = styled.View`
flex-direction: row;
align-items: center;
justify-content: space-between;
background-color: #4F6F52;
border-radius: 12px;
padding: 5px 0 5px 5px;
`

const UserImageContainer = styled.View`
height: 40px;
width: 40px;
position: relative;
`
const UserItemImage = styled.View`
overflow: hidden;
border-radius: 20px;
width: 100%;
height: 100%;
`

const UserOnlineStatus = styled.View`
width: 15px;
height: 15px;
position: absolute;
bottom: -1px;
right: 0;
background-color: #23b044;
border-radius: 10px;
`

const UserImage = styled.Image`
width: 100%;
height: 100%;
border-radius: 20px;
background-color: #fff;
`

const UserDataContainer = styled.View`
flex-grow: 1;
padding: 5px;
`
const UserDataText = styled.Text`
font-size: 14px;
color: #fff;
`
const ActionsContainer = styled.ScrollView`
height: 90%;
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