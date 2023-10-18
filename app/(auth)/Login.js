import AuthContainer from '../components/Auth/AuthContainer'
import LoginForm from '../components/Auth/LoginForm';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase'
const Login = () => {
  const loginUser = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
    .then(data => {
      console.log(data)
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