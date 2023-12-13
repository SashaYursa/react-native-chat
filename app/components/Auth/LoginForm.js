import { View, Text, KeyboardAvoidingView } from 'react-native'
import { TextInput, Button, Text as PaperText } from 'react-native-paper';
import { useState } from 'react'
import styled from 'styled-components'
const LoginForm = ({handleLogin, loginError}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePass, setHidePass] = useState(true);
  const handleShowPass = () => {
    setHidePass(!hidePass)
  }
  return (
    <>
      {loginError &&
      <PaperText style={{color: 'red'}} variant='labelLarge'>Invalid password or email</PaperText>
      }
      <TextInput label='Email' mode='outlined'
      value={email}
      onChangeText={text => setEmail(text)}
      />
      <TextInput label='Password' mode='outlined'
      value={password}
      secureTextEntry={hidePass}
      onChangeText={text => setPassword(text)}
      right={<TextInput.Icon onPress={handleShowPass} icon="eye" />}
      />
      <Button style={{alignSelf: 'center', marginTop: 20}} icon="login" mode="elevated" textColor='#000' onPress={() => handleLogin({email, password})}>
        Login
      </Button>
      </>
  )
}


export default LoginForm
