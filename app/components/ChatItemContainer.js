import { View, Text, TouchableOpacity, SectionList } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthUserContext } from '../_layout';
import styled from 'styled-components';
import ChatItem from './ChatItem';

const ChatItemContainer = React.memo(({messagesCount, messages, chatData, chatUsers, selectedMessages, updateSelectedMessages, loadPreviousMessages}) => {  
  const [endReached, setEndReached] = useState(false);
    const [allowSetEndReached, setAllowSetEndReached] = useState(false);
    const {user} = useContext(AuthUserContext);
    const scrollRef = useRef();
    useEffect(() => {
      if(endReached){  
          loadPreviousMessages()
          setEndReached(false)
      }
    }, [scrollRef, endReached, messagesCount])

    const checkDate = (date) => {
      function isYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (yesterday.toDateString() === date.toDateString()) {
          return true;
        }
        return false;
      }
      function isToday(date) {
        const today = new Date();
        if (today.toDateString() === date.toDateString()) {
          return true;
        }
        return false;
      }

      if(isToday(date)){
        return "today"
      }else if(isYesterday(date)){
        return "yesterday"
      }
      else{
        return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear(); 
      }
    }

    const rerenderItem = ({ item }) => {
      let messageUser;
      if(item.uid !== user.uid){
        messageUser = chatUsers.find(u => u.id === item.uid);
      }
      else{
        messageUser = user
      }
      const is =  selectedMessages.includes(item.id);
      const selected = is && {
        backgroundColor: '#85aded'
      }
      return(      
        <MessagesContainer 
        delayLongPress={300} 
        onLongPress={() => {
          updateSelectedMessages(item)
        }} 
        key={item.id}
        activeOpacity={1} 
        style={item.uid === user.uid 
        ? {justifyContent: 'flex-end', ...selected} 
        : {justifyContent: 'flex-start', ...selected} }>  

          <ChatItem userName={messageUser?.displayName}
            userImage={messageUser.image}
            messageMedia={item.media}
            messageText={item.text}
            messageId={item.id}
            messageCreatedAt={item?.createdAt?.seconds}
            isAuthor={item.uid === user.uid}
            chatType={chatData.type}
            // selectMessage={updateSelectedMessages} 
            />
        </MessagesContainer>
      )
    }

    return (
      <ChatSectionList contentContainerStyle={{paddingVertical: 10}}
                  ref={scrollRef}
                  onEndReached={(props) => {
                    if(allowSetEndReached){
                      setEndReached(true)
                    }
                  }}
                  onMomentumScrollBegin={() => {
                    setAllowSetEndReached(true)
                  }}
                  inverted showsVerticalScrollIndicator={false} 
                  sections={messages}
                  keyExtractor={item => {return item.id}} 
                  renderItem={rerenderItem} 
                  renderSectionFooter={({section: { date }}) => {
                    const splitDate =  date.split('_');
                    const dateObj = new Date(splitDate[0], splitDate[1], splitDate[2])
                    const dateString = checkDate(dateObj);
                    return(
                      <DateSplitter>
                        <DateSplitterText>{dateString}</DateSplitterText>
                      </DateSplitter>
                    )
                  }}
                  // initialNumToRender={19}
                  />
    )
  }, (prev, next) => {
    return prev.chatUsers === next.chatUsers 
    && prev.loadPreviousMessages === next.loadPreviousMessages
    && prev.updateSelectedMessages === next.updateSelectedMessages
    && prev.selectedMessages === next.selectedMessages
    && prev.messages === next.messages
    && prev.messagesCount === next.messagesCount
  })

const MessagesContainer = styled.TouchableOpacity`
flex-direction: row;
align-items: flex-end;
width: 100%;
gap: 10px;
padding: 2.5px 0;
position: relative;
`

const ChatSectionList = styled.SectionList`
padding: 0 5px;
flex-direction: column;
`

const DateSplitter = styled.View`
padding: 5px 10px;
border-radius: 24px;
background-color: #0F0F0F;
align-self: center;
`
const DateSplitterText = styled.Text`
font-size: 12px;
color: #fff;
`

export default ChatItemContainer