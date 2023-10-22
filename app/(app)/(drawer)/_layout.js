import { DrawerToggleButton } from '@react-navigation/drawer';
import {Drawer} from 'expo-router/drawer';
import { Group } from 'expo-router/src/primitives';
import styled from 'styled-components';
import { Image } from 'react-native';
import { useContext } from 'react';
import { AuthUserContext } from '../../_layout';

const Layout = () => {
  const { user } = useContext(AuthUserContext);
  return (
    <Drawer initialRouteName='chats' screenOptions={{headerShown: true}}>
        <Drawer.Screen name='chats' options={{
            title: "Чати",
            headerLeft: () => <DrawerToggleButton/>,
            headerRight: () => <UserImage source={{uri: user.photoURL}}/>
        }}>
        </Drawer.Screen>
        <Drawer.Screen name='Home' options={{
            title: "Профіль",
            headerLeft: () => <DrawerToggleButton />
        }}>
        </Drawer.Screen>
    </Drawer>
  )
}
const UserImage = styled.Image`
width: 40px;
height: 40px;
border-radius: 50px;
margin-right: 10px;
`

export default Layout