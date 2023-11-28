import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import styled from 'styled-components'
import UserImage from './UserImage'
import TimeAgo from './TimeAgo'
import { router } from 'expo-router'

const ChatNavigationHeaderTitle = ({contentPressHandle, chatType, chatImage, name, online, selectedMessagesCount, handleSelectedMessages}) => {
  console.log(chatType, '----type')
  const defaultChatImage = chatType === 'public' ? require('../../assets/group-chat.png') : require('../../assets/default-user.png')
  const OnlineStatusIndication = () => {
    if(chatType === 'private'){
      return (
        <>
          <StatusIndicator style={!online.onlineStatus && {backgroundColor: 'gray'}}/>
          { online.onlineStatus
            ? <Text>Зараз онлайн</Text>
            : <TimeAgo date={online.timeStamp} textAfter="тому"/>
          }
        </>
      )
    }
    if(chatType === 'public'){
      const isOnlineLenght = online.filter(onlineStatus => onlineStatus === true).length
      const offlineLenght = online.length - isOnlineLenght
      return (
        <Text>{`${isOnlineLenght} online ${offlineLenght} offline`}</Text>
      )
    }
    }
  return (
    <HeaderContainer>
      <HeaderContentButton onPress={contentPressHandle}>
        { chatImage 
          ? <UserImage style={{width: 35, height: 35, borderRadius: 50, overflow: 'hidden', backgroundColor: "#eaeaea"}} imageUrl={chatImage} />
          : <Image style={{width: 35, height: 35, borderRadius: 50, overflow: 'hidden', backgroundColor: "#eaeaea"}} source={defaultChatImage}/>
        }
        <View>
          <ChatName>{name}</ChatName>
          <OnlineStatusDisplay>
            <OnlineStatusIndication/>
          </OnlineStatusDisplay>
        </View>
      </HeaderContentButton>
      {selectedMessagesCount > 0 
        ? <TouchableOpacity onPress={handleSelectedMessages} style={{alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <Image style={{width: 30, height: 30}} source={require('../../assets/delete.png')} />
          <View style={{position: 'absolute', top: -3, right: -3, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8, backgroundColor: 'blue'}}>
            <Text style={{fontWeight: 700, color: '#fff', fontSize: 12}}>
              {selectedMessagesCount}
            </Text>
          </View>
        </TouchableOpacity>
        : chatType === 'private' && <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center'}} onPress={() => router.push('chat/info')}>
          <View style={{width: 30, height: 30}}>
            <Image source={require('../../assets/chat-info.png')} style={{height: '100%', width: '100%'}}/>
          </View>
        </TouchableOpacity>
      }
    </HeaderContainer>
  )
}

const HeaderContainer = styled.View`
flex-direction: row;
width: 90%;
justify-content: space-between;
`

const HeaderContentButton = styled.TouchableOpacity`
flex-direction: row;
align-items: center;
gap: 10px;
`

const ChatName = styled.Text`
font-size: 18px;
font-weight: 700;
`

const OnlineStatusDisplay = styled.View`
flex-direction: row;
gap: 5px;
align-items: center;
`

const StatusIndicator = styled.View`
width: 15px;
height: 15px;
border-radius: 15px;
background-color: green;
`

export default ChatNavigationHeaderTitle