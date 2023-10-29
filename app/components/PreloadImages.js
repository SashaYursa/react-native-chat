import { View, Text, Image, TouchableOpacity} from 'react-native'
import React from 'react'
import styled from 'styled-components'
import { ScrollView } from 'react-native-gesture-handler'

const PreloadImages = ({images, removeImage}) => {
  return (
    <ImagesScroll horizontal>
        <Container>
        {
            images.map(image => {
                if(image.progress){
                    return <ImageContainer key={image.path}>
                    <ImageItem source={{uri: image.path}}/>
                    <DeleteButton onPress={() => removeImage(image.path)}>
                        <DeleteImage source={require('../../assets/remove-item.png')}/>
                    </DeleteButton>
                    <LoadProgress>
                        <LoadProgressText>{image.progress}%</LoadProgressText>
                    </LoadProgress>
                    </ImageContainer>
                }
                return (
                <ImageContainer key={image.path}>
                    <ImageItem source={{uri: image.path}}/>
                    <DeleteButton onPress={() => removeImage(image.path)}>
                        <DeleteImage source={require('../../assets/remove-item.png')}/>
                    </DeleteButton>
                </ImageContainer>
            )})
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
const LoadProgress = styled.View`
position: absolute;
left: 0;
right: 0;
top: 0;
bottom: 0;
background-color: rgba(0, 0, 0, 0.3);
align-items: center;
justify-content: center;
`
const LoadProgressText = styled.Text`
font-size: 16px;
font-weight: 700;
color: #fff;
`

export default PreloadImages