import { TextInput, Button } from 'react-native-paper';
import { useState } from 'react'

const SignUpForm = ({handleRegistration}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [hidePass, setHidePass] = useState(true);
    const handleShowPass = () => {
      setHidePass(!hidePass)
    }
  return (
    <>
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
      <TextInput label='Password Confirm' mode='outlined'
      value={passwordConfirm}
      secureTextEntry={hidePass}
      onChangeText={text => setPasswordConfirm(text)}
      />
      <Button style={{alignSelf: 'center', marginTop: 20}} icon="account-plus-outline" mode="elevated" uppee textColor='#000' onPress={() => handleRegistration(email, password, passwordConfirm)}>
        Registration
      </Button>
    </>
  )
}

export default SignUpForm