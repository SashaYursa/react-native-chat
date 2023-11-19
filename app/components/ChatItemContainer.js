import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthUserContext } from '../_layout';
import styled from 'styled-components';
import ChatItem from './ChatItem';


const ChatItemContainer = React.memo(({loadMessagesStatus, messages, selectedMessages, updateSelectedMessages, loadPreviousMessages}) => {
    const [endReached, setEndReached] = useState(false);
    const [allowSetEndReached, setAllowSetEndReached] = useState(false);
    const scrollRef = useRef();
    console.log(loadMessagesStatus, 'ssss')
    useEffect(() => {
      if(endReached){
        if(loadMessagesStatus?.canLoadedMessages && loadMessagesStatus?.loadedMessagesCount < loadMessagesStatus?.messagesCount){
          loadPreviousMessages()
          setEndReached(false)
        }
      }
    }, [scrollRef, endReached, loadMessagesStatus])
    const {user} = useContext(AuthUserContext);
    useEffect(() => {
  
    }, [user])
    const openImage = (imageId) => {
    }
    
    const rerenderItem = ({ item, index }) => { 
   //   console.log('rerender')
        const is =  selectedMessages.includes(item.id);
      const selected = is && {
        backgroundColor: '#85aded'
      }
      return(
        <MessagesContainer 
        delayLongPress={300} 
        onLongPress={() => {
          console.log('long')
          updateSelectedMessages(item)
        }} 
        activeOpacity={1} 
        style={item.uid == user.uid 
        ? {justifyContent: 'flex-end', ...selected} 
        : {justifyContent: 'flex-start', ...selected} }>
          <ChatItem item={item} index={index} openImage={openImage} selectMessage={updateSelectedMessages} />
        </MessagesContainer>
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
                  data={messages} 
                  renderItem={rerenderItem} />
    )
  }, (prev, next) => {
    return prev.messages === next.messages 
    && prev.selectedMessages === next.selectedMessages 
    && prev.loadMessagesStatus === next.loadMessagesStatus
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