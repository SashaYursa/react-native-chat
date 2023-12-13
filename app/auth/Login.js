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
  // ReactNativeAsyncStorage.getItem("email").then(email => {
  //     if(email){
  //       ReactNativeAsyncStorage.getItem("password").then(password => {
  //         if(password){
  //           loginUser(email, password)
  //         }
  //       })
  //     }
  // })
  const loginUser = (email, password) => {
    // console.log('12312321')
    // login({email, password})
    // signInWithEmailAndPassword(auth, email, password)
    // .then(data => {
    //   ReactNativeAsyncStorage.setItem("email", email)
    //   ReactNativeAsyncStorage.setItem("password", password)
    //   setUser(data)
    //   getDoc(doc(database, 'users', data.user.uid)).then(data => {
    //     const u = data.data();
    //     updateUserLastSeen(u)
    //   })
    //   const rUserRef = ref(rDatabase, '/status/' + data.user.uid);
    //         onDisconnect(rUserRef)
    //             .set({ timeStamp: serverTimestamp(), isOnline: false })
    //             .then(async () => {
    //               set(rUserRef, { timeStamp: serverTimestamp(), isOnline: true});
    //   });
    //   router.push('/');
    // })
    // .catch(error => console.log('failed login ---->',error))
  }

  const updateUserLastSeen = (user) => {
    const userDocRef = doc(database, 'users', user.id)
        const updatedUser = {
            ...user,
            lastCheckedStatus: new Date(),
            status: 'online'
          }

          setDoc(userDocRef, updatedUser).catch(error => {
            console.log('setDoc error in EditUser --->', error)
        })
  }
  return (
    <AuthContainer>
      <LoginForm handleLogin={login} loginError={loginError}/>
    </AuthContainer>
  )
}



export default Login