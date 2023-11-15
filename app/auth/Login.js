import AuthContainer from '../components/Auth/AuthContainer'
import LoginForm from '../components/Auth/LoginForm';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, rDatabase } from '../../config/firebase'
import { useContext, useEffect } from 'react';
import { AuthUserContext } from '../_layout';
import { router } from 'expo-router';
import { getDatabase, ref, onValue, set, onDisconnect, off, serverTimestamp } from "firebase/database";
import * as FileSystem from 'expo-file-system'
const Login = () => {
  const { user, setUser }  = useContext(AuthUserContext)
  useEffect(() => {
    loginUser('middle@gmail.com', '123456')
  }, [])
  const loginUser = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
    .then(data => { 
      setUser(data)
      const rUserRef = ref(rDatabase, '/status/' + data.user.uid);
            onDisconnect(rUserRef)
                .set({ timeStamp: serverTimestamp(), isOnline: false })
                .then(async () => {
                    set(rUserRef, { timeStamp: serverTimestamp(), isOnline: true });
      });
      router.push('/');
    })
    .catch(error => console.log(error))
  }
  return (
    <AuthContainer>
      <LoginForm handleLogin={loginUser}/>
    </AuthContainer>
  )
}



export default Login