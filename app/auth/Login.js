import AuthContainer from '../components/Auth/AuthContainer'
import LoginForm from '../components/Auth/LoginForm';
import { auth, database, rDatabase } from '../../config/firebase'
import { useContext, useEffect } from 'react';
import { router } from 'expo-router';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useLoginMutation } from '../store/features/auth/authApi';

const Login = () => {
  const [login, {error: loginError}] = useLoginMutation()
  
  return (
    <AuthContainer>
      <LoginForm handleLogin={login} loginError={loginError}/>
    </AuthContainer>
  )
}



export default Login