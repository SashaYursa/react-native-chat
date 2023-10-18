import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import { Link, Redirect, useNavigation } from 'expo-router'
import { Stack} from 'expo-router/stack';

const Root = (props) => {
  // console.log('index rerender')
  // const navigation = useNavigation();
  // console.log(props.isAuth)
  // return props.isAuth ? (
  //   // <View><Text>isAuth</Text></View>
  //   <Redirect href={'chats'}/>
  //   //<Stack.Screen name='(drawer)/chats'/>
  // )
  // : (
  //   <Redirect href={'/auth'}/>
  //   //<View><Text>isNoAuth</Text></View>
  //   //navigation.push('/auth')
  // )
  return (
    <SafeAreaView style={{paddingTop: Platform.OS === 'android' ? 25 : 0}}>
      {props.isAuth ? 
    <View>
      <Text>
        Main page
      </Text>
    </View>
    : <Redirect href='(auth)/Login'/>
    }
    </SafeAreaView>
    )
}

export default Root