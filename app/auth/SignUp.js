import { View, Text } from 'react-native'
import React from 'react'
import AuthContainer from '../components/Auth/AuthContainer'
import SignUpForm from '../components/Auth/SignUpForm'
import { auth, database } from '../../config/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
const SignUp = () => {
  const addUser = (email,password, passwordConfirm) => {
    if(password === passwordConfirm){
      createUserWithEmailAndPassword(auth, email, password)
      .then(data => {
        const user = data.user
        return setDoc(doc(database, 'users', user.uid),{
          id: user.uid,
          email: user.email,
          displayName: user.email,
          image: null,
          createdAt: serverTimestamp()
        })
      })
      .then(data => console.log(data))
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