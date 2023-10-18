import { View, Text, ImageBackground } from 'react-native'
import React from 'react'
import styled from 'styled-components'

const AuthContainer = ({children}) => {
  return (
    <Container>
        <ImageBackground style={{flex: 1}} resizeMode='cover' source={require('../../../assets/background-image-auth.png')}>
        {children}
        </ImageBackground>
    </Container>

  )
}
const Container = styled.View`
flex-direction: column;
flex-grow: 1;
`

export default AuthContainer