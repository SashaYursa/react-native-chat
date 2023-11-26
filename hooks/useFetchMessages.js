import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { SelectedChatContext } from '../app/_layout';

const useFetchMessages = () => {
    const {messages, setMessages} = useContext(SelectedChatContext)
    useEffect()
    return messages;
}

export default useFetchMessages