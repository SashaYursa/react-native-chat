import { View, Text, Image, TouchableOpacity} from 'react-native'
import React from 'react'
import styled from 'styled-components'
import { ScrollView } from 'react-native-gesture-handler'

const PreloadImages = ({images, removeImage}) => {
  return (
    <ImagesScroll horizontal>
        <Container>
        {
            images.map(image => (
                <ImageContainer key={image}>
                    <ImageItem source={{uri: image}}/>
                    <DeleteButton onPress={() => removeImage(image)}>
                        <DeleteImage source={require('../../assets/remove-item.png')}/>
                    </DeleteButton>
                </ImageContainer>
            ))
        }
        </Container>
    </ImagesScroll>
  )
}
const Container = styled.View`
background-color: #fff;
padding: 10px;
flex-direction: row;
gap: 8px;
`
const ImageContainer = styled.View`
position: relative;
height: 100px;
width: 100px;
background-color: #fff;
`
const ImagesScroll = styled.ScrollView`
overflow: visible;
`
const ImageItem = styled.Image`
width: 100%;
height: 100%;
border-radius: 6px;
overflow: hidden;
`
const DeleteButton = styled.TouchableOpacity`
position: absolute;
top: -5px;
right: -5px;
width: 20px;
height: 20px;
border-radius: 10px;
overflow: hidden;
border-width: 1px;
border-color: #000;
`
const DeleteImage = styled.Image`
width: 100%;
height: 100%;
background-color: #fff;
`

export default PreloadImages