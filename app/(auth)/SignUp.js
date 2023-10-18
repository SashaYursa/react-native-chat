import { View, Text } from 'react-native'
import React from 'react'
import AuthContainer from '../components/Auth/AuthContainer'
import SignUpForm from '../components/Auth/SignUpForm'
import { auth } from '../../config/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
const SignUp = () => {
  const addUser = (email,password, passwordConfirm) => {
    if(password === passwordConfirm){
      createUserWithEmailAndPassword(auth, email, password)
      .then(data => console.log(data, ' created'))
      .catch(error => console.log(error, 'error'))
    }
  }
  return (
    <AuthContainer>
      <SignUpForm handleRegistration={addUser}/>
    </AuthContainer>
  )
}

export default SignUp