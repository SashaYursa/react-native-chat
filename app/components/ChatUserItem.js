import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, IconButton } from 'react-native-paper'
import { useSelector } from 'react-redux'
import TimeAgo from './TimeAgo'
import CachedImage from './CachedImage'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, } from 'react-native-reanimated'
const ChatUserItem = ({chatUser, deleteUser, chatData}) => {
    const user = useSelector(state => state.auth.user)
    console.log(chatData.type)
    const [actionModalIsOpen, setActionModalIsOpen] = useState(false)
    const offsetData = useSharedValue(0);
    const offsetActions = useSharedValue(1);
    const animatedDataContainerStyle = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: offsetData.value * 100}],
          opacity: offsetActions.value
        };
    });
    const animatedActionsContainerStyle = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: offsetActions.value * 100}],
          opacity: offsetData.value
        };
    });
    useLayoutEffect(() => {
        if(actionModalIsOpen){
            offsetData.value = withSpring(1, {damping: 20})
            offsetActions.value = withSpring(0, {damping: 20})
        }else{
            offsetData.value = withSpring(0, {damping: 20})
            offsetActions.value = withSpring(1,{damping: 20})

        }
    }, [actionModalIsOpen])
    return (
        <UserItem>
            <UserImageContainer>
                <UserItemImage>
                    {chatUser.image 
                    ? <CachedImage url={chatUser.image} style={{width: '100%', height: '100%'}}/>
                    : <UserImage source={require('../../assets/default-user.png')}/>
                    }      
                </UserItemImage>
                <UserOnlineStatus style={!chatUser.onlineStatus && {backgroundColor: "#828181"}}/>  
            </UserImageContainer>
                <Animated.View style={[style.userDataContainer, animatedDataContainerStyle]}>
                    <UserDataText style={{fontWeight: 700}}>
                        {
                            chatUser.displayName
                        }
                    </UserDataText>
                    {chatUser.onlineStatus
                        ? <UserDataText>online</UserDataText>
                        : <TimeAgo date={chatUser.timeStamp} styleProps={{fontSize: 14, color: '#fff'}} textAfter={'тому'}/>
                    }
                </Animated.View> 
                <Animated.View style={[style.userActionButtons, animatedActionsContainerStyle]}>
                    {(chatData.type === 'public' && chatData.admin.includes(user.uid)) &&
                    <Button icon="delete" contentStyle={{color: 'red'}} buttonColor="#22092C" mode="contained" onPress={() => deleteUser(chatUser)}>
                        Remove
                    </Button>
                    }
                </Animated.View>
                {(chatData.type === 'public' && chatData.admin.includes(user.uid)) &&
                <UserActionContaier>
                    <IconButton
                        icon="dots-horizontal-circle"
                        iconColor="#22092C"
                        size={20}
                        onPress={() => setActionModalIsOpen(isOpen => !isOpen)}
                    />
                </UserActionContaier>
                }
        </UserItem>  
    )

}

const style = StyleSheet.create({
    userDataContainer: {
        flexGrow: 1,
        padding: 5,
    },
    userActionButtons: {
        flexDirection: 'row',
        padding: 5,
        flexGrow: 1,
        justifyContent: 'flex-end'
    }
})
const UserItem = styled.View`
flex-direction: row;
align-items: center;
justify-content: space-between;
background-color: #4F6F52;
border-radius: 12px;
padding: 5px 0 5px 5px;
`

const UserImageContainer = styled.View`
height: 40px;
width: 40px;
position: relative;
`
const UserItemImage = styled.View`
overflow: hidden;
border-radius: 20px;
width: 100%;
height: 100%;
`

const UserOnlineStatus = styled.View`
width: 15px;
height: 15px;
position: absolute;
bottom: -1px;
right: 0;
background-color: #23b044;
border-radius: 10px;
`

const UserImage = styled.Image`
width: 100%;
height: 100%;
border-radius: 20px;
background-color: #fff;
`

const UserDataContainer = styled.View`

`
const UserActionContaier = styled.View`
align-items: flex-end;
justify-content: center;
`
const UserActionButtons = styled.View`
flex-direction: row;
padding: 5px;
flex-grow: 1;
`
const UserDataText = styled.Text`
font-size: 14px;
color: #fff;
`

export default ChatUserItem