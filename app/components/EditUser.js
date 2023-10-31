import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import styled from 'styled-components'
import EditUserForm from './Forms/EditUserForm'

const EditUser = ({user, updateUser}) => {
    const imageSource = user.image ? {uri: user.image} : require('../../assets/default-user-big.png')
    const userImageHandleImage = require('../../assets/remove-item.png')
    return (
        <Container>
            <EditWrapper contentContainerStyle={{paddingVertical: 10}}>
                <ImageContainer>
                    <ImagePreview source={imageSource}/>
                    <RemoveImageButton>
                        <Image style={{width: '100%', height: '100%'}} source={userImageHandleImage} />
                    </RemoveImageButton>
                    <ImageSelectButton>
                        <Image style={{width: '100%', height: '100%'}} source={userImageHandleImage} />
                    </ImageSelectButton>
                </ImageContainer>
                <EditUserForm userData={user} updateUser={updateUser}/>
            </EditWrapper>
        </Container>
    )
}

const Container = styled.View`
flex-grow: 1;
background-color: #fff;
`

const EditWrapper = styled.ScrollView`
flex-grow: 1;
`

const ImageContainer = styled.View`
position: relative;
width:  60%;
height: 260px;
background-color: red;
margin: 20px auto 0;
`
const ImagePreview = styled.Image`
background-color: blue;
width: 100%;
height: 100%;
`
const ImageSelectButton = styled.TouchableOpacity`
position: absolute;
bottom: -10px;
right: -10px;
width: 30px;
height: 30px;
border-radius: 40px;
background-color: #fff;
transform: rotate(45deg);
border-color: #000;
border-width: 1px;
`
const RemoveImageButton = styled.TouchableOpacity`
position: absolute;
top: -10px;
right: -10px;
width: 30px;
height: 30px;
border-radius: 40px;
background-color: #fff;
border-color: #000;
border-width: 1px;
`

const EditForm = styled.View`

`

export default EditUser