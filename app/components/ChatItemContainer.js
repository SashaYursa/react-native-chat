import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthUserContext } from '../_layout';
import styled from 'styled-components';
import ChatItem from './ChatItem';


const ChatItemContainer = React.memo(({messagesCount, messages, chatData, chatUsers, selectedMessages, updateSelectedMessages, loadPreviousMessages}) => {
    console.log('rerender')
    const [endReached, setEndReached] = useState(false);
    const [allowSetEndReached, setAllowSetEndReached] = useState(false);
    const {user} = useContext(AuthUserContext);
    const scrollRef = useRef();
    useEffect(() => {
      if(endReached){
        if(messagesCount > messages.length){
          loadPreviousMessages()
          setEndReached(false)
        }
      }
    }, [scrollRef, endReached, messagesCount])
    const rerenderItem = ({ item, index }) => { 
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
            messageCreatedAt={item.createdAt}
            isAuthor={item.uid === user.uid}
            chatType={chatData.type}
            selectMessage={updateSelectedMessages} />
        </MessagesContainer>
      )
    }
    console.log(chatData.type)
    
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
                  data={messages} 
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

export default ChatItemContainer