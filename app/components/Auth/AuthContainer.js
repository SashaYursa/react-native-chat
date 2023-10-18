import { View, Text, ImageBackground } from 'react-native'
import React from 'react'
import styled from 'styled-components'
import { ScrollView } from 'react-native-gesture-handler'

const AuthContainer = ({children}) => {
  return (
    
    <Container>
        <ImageBackground imageStyle={{opacity: .3}} style={{flex: 1}} resizeMode='cover' source={require('../../../assets/background-image-auth.png')}>
        <Wrapper>
        <LogoContainer>
          <Logo source={require('../../../assets/chat-logo.png')}/>
        </LogoContainer>
        <FormContainer>
        {children}
        </FormContainer>
        </Wrapper>
        </ImageBackground>
    </Container>
    

  )
}

const Container = styled.View`
flex-direction: column;
flex-grow: 1;
`
const Wrapper = styled.ScrollView`
`
const LogoContainer = styled.View`
background-color: #fff;
padding: 10px;
border-radius: 12px;
align-self: center;
margin-top: 70px;
`
const Logo = styled.Image`
width: 70px;
height: 70px;
align-self: center;
`
const FormContainer = styled.View`
padding: 20px 10px;
gap: 10px;
background-color: #fff;
border-radius: 12px;
margin: 40px 10px 20px;
`

export default AuthContainer