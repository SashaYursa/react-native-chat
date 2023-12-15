import { View, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import AuthContainer from '../components/Auth/AuthContainer'
import SignUpForm from '../components/Auth/SignUpForm'
import { useRegistrationMutation } from '../store/features/auth/authApi'
import styled from 'styled-components'
const SignUp = () => {
  const [registrationAction, {error: registrationError, data: registrationData, isLoading: registrationLoading}] = useRegistrationMutation()
  useEffect(() => {
    if(registrationError){
      console.log('register error', registrationError)
    }
  }, [registrationError])
  useEffect(() => {
    if(registrationData){
      console.log('registrationData', registrationData)
    }
  }, [registrationData])
  const registration = (email, password, passwordConfirm) => {
    
    if(password === passwordConfirm){
      registrationAction({password, email})
    }
  }
  return (
    <>
      {registrationLoading &&
        <LoadingContainer>
          <ActivityIndicator size="large"/>
        </LoadingContainer>
      }
      <AuthContainer>
        <SignUpForm handleRegistration={registration}/>
      </AuthContainer>
    </>
  )
}

const LoadingContainer = styled.View`
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
align-items: center;
justify-content: center;
`

export default SignUp