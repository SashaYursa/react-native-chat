import AuthContainer from '../components/Auth/AuthContainer'
import LoginForm from '../components/Auth/LoginForm';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase'
import { useContext } from 'react';
import { AuthUserContext } from '../_layout';
import { router } from 'expo-router';

const Login = () => {
  const { user, setUser }  = useContext(AuthUserContext)
  const loginUser = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
    .then(data => { 
      setUser(data)
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