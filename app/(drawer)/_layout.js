import { DrawerToggleButton } from '@react-navigation/drawer';
import {Drawer} from 'expo-router/drawer';
import { Group } from 'expo-router/src/primitives';

const Layout = () => {
  return (
    <Drawer initialRouteName='chats' screenOptions={{headerShown: true}}>
        <Drawer.Screen name='chats' options={{
            title: "Чати",
            headerLeft: () => <DrawerToggleButton />
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

export default Layout