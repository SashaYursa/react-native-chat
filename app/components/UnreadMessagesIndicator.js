import { View, Text } from 'react-native'
import React from 'react'
import styled from 'styled-components'

const UnreadMessagesIndicator = ({count}) => {
    if(count === 0){
        return <></>
    }
    return (
    <Container>
        <UnreadedMessagesCount>
            {count}
        </UnreadedMessagesCount>
    </Container>
  )
}

const Container = styled.View`
width: 30px;
height: 30px;
background-color: #007bff;
border-radius: 20px;
align-items: center;
justify-content: center;
`
const UnreadedMessagesCount = styled.Text`
font-size: 14px;
font-weight: 700;
color: #fff;
`

export default UnreadMessagesIndicator