import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  where,
  getDocs
} from 'firebase/firestore'
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { AuthUserContext, FirebaseContext } from '../../_layout'
import { getUserData } from '../_layout'
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [newMessageText, setNewMessageText] = useState('');
  const {auth, database} = useContext(FirebaseContext);
  const { user } = useContext(AuthUserContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  useEffect(() => {
    const q = query(collection(database, 'messages', String(id), 'message'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newMessages = await Promise.all(snapshot.docs.map(element => {
        return {
          ...element.data(),
          id: element.id
        }
      }))
      setLoading(false)
      setMessages(newMessages)
    })
    return () => unsubscribe();
  }, [])

  const getChat = async () => {
    const qChat = doc(database, "chats", id);
    const chat = await getDoc(qChat);
    setChat(chat.data());
  } 
  const getUser = async (id) => {
    console.log(id, 'id')
    const qUser = query(collection(database, "users"), where("id", "==", id))
    let res = await getDocs(qUser);
    res = await Promise.all(res.docs.map(item => item.data()))
    setSelectedUser(await res[0]);
  }

  useLayoutEffect(() => {
    if(!chat){
      getChat();
    }
    else{
      if(chat.type === "private"){
        if(selectedUser === null){
          getUser(chat.users.find(id => id !== user.uid))
        }
        else{
          navigation.setOptions({
            headerTitle: () => (
              <TouchableOpacity onPress={() => {router.push(`(drawer)/user/${selectedUser.id}`)}} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Image style={{width: 35, height: 35, borderRadius: 50, overflow: 'hidden', backgroundColor: "#eaeaea"}} source={selectedUser.image === null ? require('../../../assets/default-chat-image.png') : {uri: selectedUser.image}} />
                <Text style={{fontSize: 18, fontWeight: 700}}>{selectedUser.displayName}</Text>
              </TouchableOpacity>
            )
          })
        }
      }
    }
  }, [chat, selectedUser])
  
  useEffect(() => {
    if(newMessageText.length > 0){
      setButtonDisable(false)
    }
    else{
      setButtonDisable(true)
    }
  }, [newMessageText])

  const sendMessage = async () => {
    setButtonDisable(true);
    setNewMessageText('');
    await addDoc(collection(database, 'messages', String(id), 'message'),{
      uid: user.uid,
      text: newMessageText,
      createdAt: serverTimestamp()
    })
  }

  return (
    <>
    <ChatCanvas>
      { loading 
      ? <ActivityIndicator style={{alignSelf: 'center'}} color={'blue'} size={'large'}/>
      : messages.length === 0
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
      <NewMessageButton disabled={buttonDisable} style={buttonDisable ? {backgroundColor: 'gray'} : {}} onPress={sendMessage}><NewMessageText>Надіслати</NewMessageText></NewMessageButton>
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