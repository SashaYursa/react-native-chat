import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Animated, Button, FadeInUp, FadeOutDown } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { ActivityIndicator } from 'react-native-paper'
import { database } from '../../config/firebase'
import CachedImage from './CachedImage'
const User = ({ user, children }) => {
    const [displayFullInfo, setDisplayFullInfo] = useState(true)
    return (
        <Container>
          <View style={{position: "absolute", top: 10, right: 10, left: 10, zIndex: 10}}>
          { !displayFullInfo && <SmallUserWindow displayName={user.displayName} email={user.email} image={user.image} />}
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{height: "100%"}} onScroll={(e)=>{
          if(e.nativeEvent.contentOffset.y > 440 && displayFullInfo !== false){
            setDisplayFullInfo(false)
          }
          if(e.nativeEvent.contentOffset.y < 440 && displayFullInfo !== true){
            setDisplayFullInfo(true)
          }
          }}
          >
            <UserInfoContainer>
              <UserImageContainer>
                {user.image 
                  ? <CachedImage url={user.image} style={styles.userImage}/>
                  : <Image style={styles.userImage} source={require('../../assets/default-user-big.png')}/>
                }
              </UserImageContainer>
              <UserDataContainer>
                <UserDataItem>
                  <PreText>Name</PreText>
                  <UserDataText>{user.displayName}</UserDataText>
                </UserDataItem>
                <BreakLine/>
                <UserDataItem>
                  <PreText>Email</PreText>
                  <UserDataText>{user.email}</UserDataText>
                </UserDataItem>
              </UserDataContainer>
            </UserInfoContainer>
            <View style={{ flex: 1, padding: 10}}>
              {/* Here chrildren */}
              {children}
            </View>
          </ScrollView>
        </Container>  
    )
}

const styles= StyleSheet.create({
  userImage: {
    position: 'absolute',
    top: 0,
    zIndex: -2,
    right: 0,
    left: 0,
    bottom: 0,
    objectFit: 'cover',
    height: '100%',
    width: '100%',
  }
})
    
    const SmallUserWindow = ({displayName, email, image}) => {
      return (
      <Animated.View
        entering={FadeInUp}
        exiting={FadeOutDown}
      >
        <SmallUserInfoContainer>
        <SmallUserImageContainer>
          <SmallUserImage source={image ? {uri: image} : require('../../assets/default-user-big.png')}/>
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
    
    const EditUserButton = styled.TouchableOpacity`
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

export default User