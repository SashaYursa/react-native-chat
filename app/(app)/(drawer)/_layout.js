import { DrawerToggleButton } from '@react-navigation/drawer';
import {Drawer} from 'expo-router/drawer';
import { Group } from 'expo-router/src/primitives';
import styled from 'styled-components';
import { Image, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { AuthUserContext } from '../../_layout';
import { useRouter } from 'expo-router';

const Layout = () => {
  const { user } = useContext(AuthUserContext);
  const router = useRouter();
  return (
    <Drawer initialRouteName='chats' screenOptions={{headerShown: true}}>
        <Drawer.Screen name='user/index' options={{
            headerShown: false,
            title: user.displayName ? user.displayName : user.email,
        }} />
        <Drawer.Screen name='chats' options={{
            title: "Чати",
            headerLeft: () => <DrawerToggleButton/>,
            headerRight: () => <UsersButton activeOpacity={.5} onPress={() => router.push('Users')}><UserImage source={require('../../../assets/users.png')}/></UsersButton>
        }} />
        <Drawer.Screen name='user/[userId]' options={{
          drawerLabel: () => null,
          title: () => null,
          drawerIcon: () => null,
          headerShown: false,
          drawerItemStyle: {display: 'none'}
        }} />

    </Drawer>
  )
}
const UsersButton = styled.TouchableOpacity`

`
const UserImage = styled.Image`
width: 40px;
height: 40px;
margin-right: 10px;
`

export default Layout