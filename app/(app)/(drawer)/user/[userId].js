import { View, Text, Image, ScrollView, FlatList } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { DrawerToggleButton } from '@react-navigation/drawer';
import styled from 'styled-components'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import Animated, {FadeInUp, FadeOutDown, FadeOutUp}from 'react-native-reanimated'
import { ActivityIndicator, Button } from 'react-native-paper'
import { AuthUserContext } from '../../../_layout';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { database } from '../../../../config/firebase';
const Home = () => {
  const {user} = useContext(AuthUserContext)
  const [displayFullInfo, setDisplayFullInfo] = useState(true);
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation();
  const [selectedUser, setSelectedUser] = useState(null);
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  useEffect(() => {
    const getUser = async () =>{
    const qUser = query(collection(database, "users"), where("id", "==", userId))
    let res = await getDocs(qUser);
    res = await Promise.all(res.docs.map(item => item.data()))
    setSelectedUser(await res[0]);
    setLoading(false)
    } 
    getUser()
  }, [userId])

  return selectedUser ? (
    <Container>
      <View style={{position: "absolute", top: 10, right: 10, left: 10, zIndex: 10}}>
      { !displayFullInfo && <SmallUserWindow displayName={selectedUser.displayName} email={selectedUser.email} image={selectedUser.image} />}
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
                <View style={{backgroundColor: "#000", width: 53, backroundOpacity: 0, position: 'absolute', top: 10, left: 10, zIndex: 2, borderRadius: 12}}>
                <DrawerToggleButton tintColor='#fff' backgroundColor="#000"/>
                </View>
                  <UserImageContainer>
                    <UserImage source={selectedUser.image ? {uri: selectedUser.image} : require('../../../../assets/default-user-big.png')}/>
                  </UserImageContainer>
                  <UserDataContainer>
                    <UserDataItem>
                      <PreText>Name</PreText>
                      <UserDataText>{selectedUser.displayName}</UserDataText>
                    </UserDataItem>
                    <BreakLine/>
                    <UserDataItem>
                      <PreText>Email</PreText>
                      <UserDataText>{selectedUser.email}</UserDataText>
                    </UserDataItem>
                  </UserDataContainer>
               </UserInfoContainer>
      <View style={{backgroundColor: '#eaeaea', height: 4000}}>
        <Buttons/>
      </View>
      </ScrollView>
    </Container>  
  )
  : loading 
  ? (
    <ActivityIndicator/>
  )
  : (
    <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 200}}>
      <Text>
        User not found
      </Text>
    </View>
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

const SmallUserWindow = ({displayName, email, image}) => {
  return (
  <Animated.View
    entering={FadeInUp}
    exiting={FadeOutDown}
  >
    <SmallUserInfoContainer>
    <SmallUserImageContainer>
      <SmallUserImage source={image ? {uri: image} : require('../../../../assets/default-user-big.png')}/>
    </SmallUserImageContainer>
    <SmallUserDataContainer>
    <UserDataItem>
                  <PreText>Username</PreText>
                  <UserDataText>{displayName}</UserDataText>
                </UserDataItem>
                <UserDataItem>
                  <PreText>Email</PreText>
                  <UserDataText>{email}</UserDataText>
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
z-index: -2;
right: 0;
left: 0;
bottom: 0;
object-fit: cover;
height: 115%;
width: 100%;
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
align-self: center;
object-fit: scale-down;
`
const SmallUserDataContainer = styled.View`
flex-grow: 1;
flex-shrink: 1;
gap: 10px;
`

export default Home