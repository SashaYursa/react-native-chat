import { View, Text, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useContext, useLayoutEffect } from 'react'
import styled from 'styled-components'
import { Stack, useLocalSearchParams } from 'expo-router'
import {
  collection,
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setMessage,
  FieldValue
} from 'firebase/firestore'
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { AuthUserContext, FirebaseContext } from '../../_layout'
const Chat = (props) => {
  const {auth, database} = useContext(FirebaseContext);
  const { user } = useContext(AuthUserContext);
  const { id } = useLocalSearchParams();
  const docRef = doc(database, "messages", 'SQ844ndsHdXklqWRJo9k');
  const docSnap = getDoc(docRef).then(data=> console.log(data.data()));
  const sendMessage = async () => {
    await addDoc(collection(database, 'messages'),{
      uid: user.uid,
      displayName: 'alex',
      text: 'first message',
      createdAt: 'now'
    })
    .then(data=> {
      console.log(data, 'data')
    })
  }
  return (
    <>
    <ChatCanvas>
      <CompanionMessagesContainer>
          <CompanionImageContainer>
            <CompanionImage source={{uri: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png'}}/>
          </CompanionImageContainer>
        <CompanionMessages>
          <MessageText>
            Прив
          </MessageText>
        </CompanionMessages>
      </CompanionMessagesContainer>
        <MyMessage>
          <MessageText>
            ку
          </MessageText>
        </MyMessage>
        <MyMessage>
          <MessageText>
            ку
          </MessageText>
        </MyMessage>
    </ChatCanvas>
    <NewMessageContainer>
      <NewMessageInput placeholder='Ввеідть повідомлення...'/>
      <NewMessageButton onPress={sendMessage}><NewMessageText>Надіслати</NewMessageText></NewMessageButton>
    </NewMessageContainer>
    </>
  )
}

const MyMessage = styled.View`
background-color: #183373;
padding: 8px 10px;
margin-top: 5px;
align-self: flex-end;
border-radius: 12px 0 12px 12px;
flex-shrink: 1;
`
const CompanionMessagesContainer = styled.View`
flex-direction: row;
align-items: center;
gap: 10px;
`
const CompanionMessages = styled.View`
padding: 5px;
margin-top: 5px;
background-color: #296314;
align-self: flex-start;
padding: 8px 10px;
border-radius: 0 12px 12px 12px;
flex-shrink: 1;
`
const CompanionImageContainer = styled.View`

`
const CompanionImage = styled.Image`
width: 30px;
height: 30px;
border-radius: 15px;
background-color: gray;
`

const MessageText = styled.Text`
font-size: 14px;
font-weight: 400;
color: #fff;
`
const ChatCanvas = styled.ScrollView`
flex-grow: 1;
background-color: #eaeaea;
margin: 10px 0;
padding: 0 5px;
flex-direction: column;

`
const NewMessageContainer = styled.View`
flex-direction: row;
gap: 10px;
background-color: #fff;
padding: 10px 5px;
border-radius: 12px 12px 0 0;
flex-shrink: 1;
`
const NewMessageInput = styled.TextInput`
border-radius: 12px;
padding: 5px 10px;
background-color: #fff;
border-color: #eaeaea;
border-width: 1px;
color: #000;
font-size: 14px;
font-weight: 400;
flex-grow: 1;
flex-shrink: 1;
`
const NewMessageButton = styled.TouchableOpacity`
padding: 5px 10px;
background-color: #1657f2;
border-radius: 12px;
align-items: center;
justify-content: center;
`
const NewMessageText = styled.Text`
font-size: 14px;
font-weight: 700;
color: #fff;
`

export default Chat