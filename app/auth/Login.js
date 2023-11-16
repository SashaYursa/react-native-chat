import AuthContainer from '../components/Auth/AuthContainer'
import LoginForm from '../components/Auth/LoginForm';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, rDatabase } from '../../config/firebase'
import { useContext, useEffect } from 'react';
import { AuthUserContext } from '../_layout';
import { router } from 'expo-router';
import { getDatabase, ref, onValue, set, onDisconnect, off, serverTimestamp } from "firebase/database";
import * as FileSystem from 'expo-file-system'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const { user, setUser }  = useContext(AuthUserContext)
  ReactNativeAsyncStorage.getItem("email").then(email => {
      if(email){
        ReactNativeAsyncStorage.getItem("password").then(password => {
          if(password){
            loginUser(email, password)
          }
        })
      }
  })
  const loginUser = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
    .then(data => {
      ReactNativeAsyncStorage.setItem("email", email)
      ReactNativeAsyncStorage.setItem("password", password)
      setUser(data)
      const rUserRef = ref(rDatabase, '/status/' + data.user.uid);
            onDisconnect(rUserRef)
                .set({ timeStamp: serverTimestamp(), isOnline: false })
                .then(async () => {
                    set(rUserRef, { timeStamp: serverTimestamp(), isOnline: true });
      });
      router.push('/');
    })
    .catch(error => console.log('failed login ---->',error))
  }
  return (
    <AuthContainer>
      <LoginForm handleLogin={loginUser}/>
    </AuthContainer>
  )
}



export default Login