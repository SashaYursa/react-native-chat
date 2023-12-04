import { DrawerToggleButton } from '@react-navigation/drawer';
import {Drawer} from 'expo-router/drawer';
import { Group } from 'expo-router/src/primitives';
import styled from 'styled-components';
import { Image, TouchableOpacity, View, Text } from 'react-native';
import { useContext } from 'react';
import { AuthUserContext } from '../../_layout';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

const Layout = () => {
  const user = useSelector(state => state.auth.user);
  const router = useRouter();
  return (
    <Drawer initialRouteName='chats' screenOptions={{headerShown: true}}>
        <Drawer.Screen name={`profile/index`} options={{
            unmountOnBlur: true,
            headerShown: false,
            drawerActiveBackgroundColor: "white",
            drawerItemStyle: {
              gap: 0,
            },
            drawerLabel: () => {
              return(
                  <View style={{gap: 10, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                    <Image style={{width: 70, height: 70, borderRadius: 70}} source={user.photoURL ? {uri: user.photoURL} :require('../../../assets/default-user.png')} size={30}/>
                    <Text style={{fontWeight: 700}}>
                      {user.displayName ? user.displayName : user.email}
                    </Text>
                  </View>
                )
            }
        }}
        />
        <Drawer.Screen name='chats' options={{
            title: "Чати",
            headerLeft: () => <DrawerToggleButton tintColor='#000'/>,
            headerRight: () => <UsersButton activeOpacity={.5} onPress={() => router.push('Users')}><UserImage source={require('../../../assets/users.png')}/></UsersButton>
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