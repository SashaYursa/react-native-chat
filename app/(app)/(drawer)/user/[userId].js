import { View, Text, Image, ScrollView, FlatList } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { DrawerToggleButton } from '@react-navigation/drawer';
import styled from 'styled-components'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import Animated, {FadeInUp, FadeOutDown, FadeOutUp}from 'react-native-reanimated'
import { ActivityIndicator, Button } from 'react-native-paper'
import { AuthUserContext } from '../../../_layout';
const Home = () => {
  const {user} = useContext(AuthUserContext)
  const [displayFullInfo, setDisplayFullInfo] = useState(true);
  const navigation = useNavigation();
  const [selectedUser, setSelectedUser] = useState(null);
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  console.log(userId, user.uid, 'usididi')
  useEffect(() => {
    
    if(userId == user.uid){
      //console.log('there')
      setSelectedUser(user);
    }
    // TODO: get user, if selected userId !== user.uid and set it to selected user and out data then
  }, [userId])
  //console.log(selectedUser, 'selelelel')
  return (
    <Container>
      <View style={{position: "absolute", top: 10, right: 10, left: 10, zIndex: 10}}>
      { !displayFullInfo && <SmallUserWindow />}
      </View>
      <ScrollView onScroll={(e)=>{
          if(e.nativeEvent.contentOffset.y > 440 && displayFullInfo !== false){
            setDisplayFullInfo(false)
          }
          if(e.nativeEvent.contentOffset.y < 440 && displayFullInfo !== true){
            setDisplayFullInfo(true)
          }
          }}
          
          >
            
              <UserInfoContainer>
                <View style={{backgroundColor: "#000", width: 55, backroundOpacity: 0}}>
                <DrawerToggleButton tintColor='#fff' backgroundColor="#000"/>
                </View>
                  <UserImageContainer>
                    <UserImage source={{uri: 'https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg'}}/>
                  </UserImageContainer>
                  <UserDataContainer>
                    <UserDataItem>
                      <PreText>Username</PreText>
                      <UserDataText>Text</UserDataText>
                    </UserDataItem>
                    <BreakLine/>
                    <UserDataItem>
                      <PreText>Email</PreText>
                      <UserDataText>Text</UserDataText>
                    </UserDataItem>
                  </UserDataContainer>
               </UserInfoContainer>
      <View style={{backgroundColor: '#eaeaea', height: 4000}}>
        <Buttons/>
      </View>
      </ScrollView>
    </Container>  
  )
}
const Buttons = () => {
  return (
    <>
    <Button><Text>Button 1</Text></Button>
      <Button><Text>Button 2</Text></Button>
      <Button><Text>Button 3</Text></Button>
      <Button><Text>Button 4</Text></Button>
      <Button><Text>Button 5</Text></Button>
      <Button><Text>Button 6</Text></Button>
      <Button><Text>Button 7</Text></Button>
      <Button><Text>Button 8</Text></Button>
      <Button><Text>Button 9</Text></Button>
      <Button><Text>Button 10</Text></Button>
      <Button><Text>Button 11</Text></Button>
      <Button><Text>Button 12</Text></Button>
      <Button><Text>Button 13</Text></Button>
      <Button><Text>Button 1</Text></Button>
      <Button><Text>Button 2</Text></Button>
      <Button><Text>Button 3</Text></Button>
      <Button><Text>Button 4</Text></Button>
      <Button><Text>Button 5</Text></Button>
      <Button><Text>Button 6</Text></Button>
      <Button><Text>Button 7</Text></Button>
      <Button><Text>Button 8</Text></Button>
      <Button><Text>Button 9</Text></Button>
      <Button><Text>Button 10</Text></Button>
      <Button><Text>Button 11</Text></Button>
      <Button><Text>Button 12</Text></Button>
      <Button><Text>Button 13</Text></Button>
      <Button><Text>Button 1</Text></Button>
      <Button><Text>Button 2</Text></Button>
      <Button><Text>Button 3</Text></Button>
      <Button><Text>Button 4</Text></Button>
      <Button><Text>Button 5</Text></Button>
      <Button><Text>Button 6</Text></Button>
      <Button><Text>Button 7</Text></Button>
      <Button><Text>Button 8</Text></Button>
      <Button><Text>Button 9</Text></Button>
      <Button><Text>Button 10</Text></Button>
      <Button><Text>Button 11</Text></Button>
      <Button><Text>Button 12</Text></Button>
      <Button><Text>Button 13</Text></Button>
    </>
  )
}

const SmallUserWindow = () => {
  return (
  <Animated.View
    entering={FadeInUp}
    exiting={FadeOutDown}
  >
    <SmallUserInfoContainer>
    <SmallUserImageContainer>
      <SmallUserImage source={{uri: 'https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg'}}/>
    </SmallUserImageContainer>
    <SmallUserDataContainer>
    <UserDataItem>
                  <PreText>Username</PreText>
                  <UserDataText>Text</UserDataText>
                </UserDataItem>
                <UserDataItem>
                  <PreText>Email</PreText>
                  <UserDataText>Text</UserDataText>
                </UserDataItem>
    </SmallUserDataContainer>
  </SmallUserInfoContainer>
  </Animated.View>
  )
}

const Container = styled.View`
background-color: #fff;
flex-grow: 1;
position: relative;
margin-top: 30px;
`
const UserInfoContainer = styled.View`
align-items: start;
gap: 10px;
background-color: #3b3b3b;
width: 100%;
align-self: center;
flex-shrink: 1;
border-radius: 0 0 8px 8px;
padding-bottom: 5px;
position: relative;
`
const UserImageContainer = styled.View`
width: 100%;
height: 300px;
position: relative;
`
const UserImage = styled.Image`
position: absolute;
top: -40px;
z-index: -1;
right: 0;
left: 0;
bottom: 0;
object-fit: fill;
`
const UserDataContainer = styled.View`
gap: 10px;
width: 100%;
padding: 5px 0 10px;
`
const UserDataItem = styled.View`
flex-direction: row;
background-color: #6e6e6e;
padding: 10px 5px;
border-radius: 6px;
margin: 0 5px;
position: relative;
`
const UserDataText = styled.Text`
font-size: 18px;
font-weight: 700;
color: #fff;
padding: 0 5px;
`
const PreText = styled.Text`
position: absolute;
top: -8px;
left: 10px;
font-size: 12px;
font-weight: 700;
color: #FEFEDF;
`

const BreakLine = styled.View`
width: 100%;
border-bottom-width: 1px;
border-color: #000;
`
const SmallUserInfoContainer = styled.View`
flex-direction: row;
gap: 10px;
align-items: center;
width: 98%;
align-self: center;
z-index: 212;
background-color: #3b3b3b;
border-radius: 12px;
padding: 10px 10px;
`
const SmallUserImageContainer = styled.View`
align-items: center;
justify-content: center;
`
const SmallUserImage = styled.Image`
width: 80px;
height: 80px;
border-radius: 40px;
`
const SmallUserDataContainer = styled.View`
flex-grow: 1;
flex-shrink: 1;
gap: 10px;
`

export default Home