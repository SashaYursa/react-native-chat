import { View, Text, TouchableOpacity, FlatList } from 'react-native'
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
        let messagesLenght = 0;
        for (const key in messages) {
          messagesLenght += messages[key].length
        }
        console.log(messagesCount, '---', messagesLenght)
        if(messagesCount > messagesLenght){
          console.log(messagesLenght, 'len')
          loadPreviousMessages(messagesLenght)
          setEndReached(false)
        }
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
      const splitDate =  item.split('_');
      const date = new Date(splitDate[0], splitDate[1], splitDate[2])
      const dateString = checkDate(date);
      return(
         <>
        {messages[item].map(itemData => {
                let messageUser;
                if(itemData.uid !== user.uid){
                  messageUser = chatUsers.find(u => u.id === itemData.uid);
                }
                else{
                  messageUser = user
                }
                const is =  selectedMessages.includes(itemData.id);
                const selected = is && {
                  backgroundColor: '#85aded'
                }
          return(
            <MessagesContainer 
        delayLongPress={300} 
        onLongPress={() => {
          updateSelectedMessages(itemData)
        }} 
        key={itemData.id}
        activeOpacity={1} 
        style={itemData.uid === user.uid 
        ? {justifyContent: 'flex-end', ...selected} 
        : {justifyContent: 'flex-start', ...selected} }>  

          <ChatItem userName={messageUser?.displayName}
            userImage={messageUser.image}
            messageMedia={itemData.media}
            messageText={itemData.text}
            messageId={itemData.id}
            messageCreatedAt={itemData.createdAt.seconds}
            isAuthor={itemData.uid === user.uid}
            chatType={chatData.type}
            selectMessage={updateSelectedMessages} />
        </MessagesContainer>
          )
        })}
        <DateSplitter>
          <DateSplitterText>{dateString}</DateSplitterText>
        </DateSplitter>
        </>
      )
    }

    return (
      <ChatScroll contentContainerStyle={{paddingVertical: 10}}
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
                  data={Object.keys(messages)} 
                  renderItem={rerenderItem} 
                  initialNumToRender={19}/>
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

const ChatScroll = styled.FlatList`
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