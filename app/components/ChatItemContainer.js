import { View, Text, TouchableOpacity, Platform, FlatList } from 'react-native'
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components';
import ChatItem from './ChatItem';
import { useSelector } from 'react-redux';
import { useSetMessageAsReadMutation } from '../store/features/messages/messagesApi';

const ChatItemContainer = ({messagesCount, messages, chatData, chatUsers, selectedMessages, updateSelectedMessages, loadPreviousMessages}) => {  
  const user = useSelector(state => state.auth.user);
  
  const flatArray = messages.reduce((result, obj) => result.concat([...obj.data, obj.date]), []);
  const [setMessageIsRead, {data: resultSetMessageIsRead, error: errorSetMessageIsRead}] = useSetMessageAsReadMutation()
  const firstUnread = flatArray.findLastIndex(el => {
    if (typeof el === 'string') return false
    if(!el.isRead.includes(user.uid)) return true
  })

  if(firstUnread !== -1){
    flatArray.splice((firstUnread + 1), 0, "Unreaded messages")
  }
  useEffect(() => {
    if(flatArray[0]?.isRead){
      if(!flatArray[0]?.isRead.includes(user.uid) && resultSetMessageIsRead){
        setMessageIsRead({chatId: chatData.id, message: flatArray[0], userId: user.uid, date: flatArray.find(item => typeof item === 'string')})
      }
    }  
  }, [messages])

  const users = useSelector(state => state.users.users)
  const scrollRef = useRef();

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
      if(typeof item === 'string'){
        if (item === "Unreaded messages"){
          return <View style={{width: '90%',marginEnd: 'auto', marginLeft: 'auto', marginBottom: 5, marginTop: 5, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 10}}>
            <Text style={{fontSize: 14, fontWeight: 400, }}>{item}</Text>
          </View>
        }
        const splitDate =  item.split('_');
        const dateObj = new Date(splitDate[0], splitDate[1], splitDate[2])
        const dateString = checkDate(dateObj);
        return (
          <DateSplitter>
            <DateSplitterText>{dateString}</DateSplitterText>
          </DateSplitter>
        )
      }
      if(item?.deleted){
        return (
          <View style={{marginLeft: 'auto', marginRight: 'auto', marginBottom: 5, padding: 10, backgroundColor: '#bfbfbf', borderRadius: 12}}>
            <Text style={{fontSize: 14, fontWeight: 400, fontStyle: 'italic'}}>Повідомлення видалено...</Text>
          </View>
        )
      }
      let messageUser;
      if(item.uid !== user.uid){
        messageUser = users.find(u => u.id === item.uid);
      }
      else{
        messageUser = user
      }
      const is =  selectedMessages.some(el => item.id === el.id);
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
            userImage={messageUser?.image}
            messageMedia={item.media}
            messageText={item.text}
            messageId={item.id}
            pending={item?.isPending}
            messageCreatedAt={item?.createdAt?.seconds}
            isAuthor={item.uid === user.uid}
            chatType={chatData.type}
            />
        </MessagesContainer>
      )
    }

    return (
      <ChatSectionList contentContainerStyle={{paddingVertical: 10}}
                  ref={scrollRef}
                  inverted
                  data={flatArray} 
                  showsVerticalScrollIndicator={false} 
                  keyExtractor={item => {
                    if(typeof item === 'string') return item
                    return item.id
                  }} 
                  renderItem={rerenderItem} 
                  />
    )
  }

const MessagesContainer = styled.TouchableOpacity`
flex-direction: row;
align-items: flex-end;
width: 100%;
gap: 10px;
padding: 2.5px 0;
position: relative;
`

const ChatSectionList = styled.FlatList`
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