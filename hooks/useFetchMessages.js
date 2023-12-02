import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { AuthUserContext, SelectedChatContext } from '../app/_layout';
import { collection, getCountFromServer, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { database } from '../config/firebase';
import useDebounce from './useDebounce';

const useFetchMessages = () => {
    // const {getChatData, setLastMessages} = useContext(SelectedChatContext)
    // const chatsData = getChatData()
    // useEffect(() => {
    //     console.log(chatsData, '------------------------------------------------chatsdata------')
    // }, [chatsData])
    // const [lastMessages, setMessages] = useState([]);
    // const {user} = useContext(AuthUserContext)

    // const debouncedMessages = useDebounce(lastMessages, 100)
    // useEffect(() => {
    //     console.log(debouncedMessages)
    //     if(debouncedMessages.lenght){
    //         setLastMessages(lastMessages)
    //     }
    // }, [debouncedMessages])
    // const checkMessages = async (chatId) => {
    //     console.log('checking messages in hook')
    //     const totalMessagesCount = (await getCountFromServer(collection(database, 'messages', chatId, 'message'))).data().count
    //     const readedMessages = (await getCountFromServer(query(collection(database, 'messages', chatId, 'message'), where("isRead", "array-contains", user.uid)))).data().count
    //     return (totalMessagesCount - readedMessages)
    // }

    // useEffect(() => {
    //     let unsubs = [];
    //     unsubs = chatsData.map(chat => {
    //         const qMessages = query(collection(database, "messages", String(chat.id), "message"), orderBy('createdAt', 'desc'), limit(1));
    //         const unsubscribe = onSnapshot(qMessages, async (snapShot) => {
    //             snapShot.docs.forEach(async e => { 
    //                 console.log('new message')
    //                 const data = e.data();
    //                 let unreadedMessagesCount = await checkMessages(chat.id)
    //                 setMessages(last => ([
    //                     ...last,
    //                     {
    //                     messageData: {
    //                         ...data, 
    //                         text: data.text ? data.text : data.media !== null ? 'Фото' : 'Повідомлень немає',
    //                         id: e.id, 
    //                         createdAt: data.createdAt?.seconds,
    //                         unreadedMessagesCount
    //                     },
    //                     chatId: chat.id
    //                     }
    //                 ])
    //                 )
    //             //     setChatsLastMessages(lastMessages => {
    //             //     const message = {
    //             //         images: data.media === null ? null : data.media,
    //             //         text: data.text ? data.text : data.media !== null ? 'Фото' : 'Повідомлень немає',
    //             //         createdAt: data.createdAt?.seconds,
    //             //         unreadedMessagesCount
    //             //     }
    //             //     if(lastMessages == null){
    //             //         return {
    //             //             [chat.id]: message
    //             //         }
    //             //     }
    //             //     return {
    //             //         ...lastMessages,
    //             //         [chat.id]: message
    //             //     }
    //             // })
    //             });
    //         })
    //         return unsubscribe;  
    //     })
    //     return () => unsubs.forEach(unsub => {
    //         unsub();    
    //     });
    // }, [chatsData])
    return {debouncedMessages: 1};
}

export default useFetchMessages