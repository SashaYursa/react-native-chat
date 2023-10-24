import { View, Text, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
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
  FieldValue,
  getDocs,
  where,
  or,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { AuthUserContext, FirebaseContext } from '../../_layout'
let i = 0;
const Chat = (props) => {
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const {auth, database} = useContext(FirebaseContext);
  const { user } = useContext(AuthUserContext);
  const { id } = useLocalSearchParams();
  console.log(id, 'id')
  //const docRef = doc(database, "chats", 'SF');
  //const q = query(collection(database, "chats"), where("users", "array-contains", "ouO7fry4IUPpj4LyT9BeuGCAXll2"));
  // const snapshots = getDocs(q).then(data=> {
  //   data.forEach(element => {
  //   });
  // })
  useEffect(() => {
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'asc'))
    // getDocs(q).then(async data => data.forEach(element => {
    // //  console.log('eee')
    // }))
    console.log('123')
    const unsubscribe = onSnapshot(q,async (snapshot) => {
      console.log(i++, 'add message');
      const newMessages = await Promise.all(snapshot.docs.map(element => {
        return {...element.data(), id: element.id};
      }))
      console.log(newMessages)
      setMessages(newMessages)
    })
    return () => unsubscribe();
  }, [])
  //const docSnap = getDoc(docRef).then(data=> console.log(data.data()));
  const sendMessage = async () => {
    await addDoc(collection(database, 'messages', String(id), 'message'),{
      uid: user.uid,
      text: newMessageText,
      createdAt: serverTimestamp()
    })
    .then(data=> {
      setNewMessageText('');
    })
  }
  return (
    <>
    <ChatCanvas>
      {
        messages.length === 0
        ? <View>
        <Text>No data</Text>
      </View>
        : messages.map(message => {
          if(message.uid == user.uid) {
            return (
              <MyMessage key={message.id}>
                <MessageText>
                  {message.text}
                </MessageText>
              </MyMessage>
            )
          } 
          else{
            return (
              <CompanionMessagesContainer key={message.id}>
                <CompanionImageContainer>
                  <CompanionImage source={{uri: 'https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png'}}/>
                </CompanionImageContainer>
                <CompanionMessages>
                  <MessageText>
                    {message.text}
                  </MessageText>
                </CompanionMessages>
              </CompanionMessagesContainer>
            )
          }
        })
      }
    </ChatCanvas>
    <NewMessageContainer>
      <NewMessageInput value={newMessageText} onChangeText={setNewMessageText} placeholder='Ввеідть повідомлення...'/>
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