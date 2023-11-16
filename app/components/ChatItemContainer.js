import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthUserContext } from '../_layout';
import styled from 'styled-components';
import ChatItem from './ChatItem';


const ChatItemContainer = React.memo(({messages, selectedMessages, setSelectedMessages, loadPreviousMessages}) => {
    const [endReached, setEndReached] = useState(false);
    const [allowSetEndReached, setAllowSetEndReached] = useState(false);
    const scrollRef = useRef();
    useEffect(() => {
      if(endReached){
        loadPreviousMessages()
        console.log('me work')
        setEndReached(false)
      }
    }, [scrollRef, endReached])
    const {user} = useContext(AuthUserContext);
    useEffect(() => {
  
    }, [user])
    const openImage = (imageId) => {
    }
    const selectMessage = (selectedMessage) => {
        const messageId = selectedMessage.id;
            if(selectedMessage.uid === user.uid) {
                setSelectedMessages(selectedMessages => {
                const findMessage = selectedMessages.find(id => id === messageId)
                if(findMessage){
                    return [
                        ...selectedMessages.filter(id => id !== messageId)
                    ]
                }
                return [
                    ...selectedMessages,
                    messageId
                ]
            })
        }
    }
    
    const rerenderItem = useCallback(({ item, index }) => { 
        const is =  selectedMessages.includes(item.id);
      const selected = is ? {
        backgroundColor: '#85aded'
      }
      : {
  
      }
      return(
        <MessagesContainer 
        delayLongPress={300} 
        onLongPress={() => {selectMessage(item)}} 
        activeOpacity={1} 
        style={item.uid == user.uid 
        ? {justifyContent: 'flex-end', ...selected} 
        : {justifyContent: 'flex-start', ...selected} }>
          <ChatItem item={item} index={index} openImage={openImage} selectMessage={selectMessage} />
        </MessagesContainer>
        )
    }, [selectedMessages])
    
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