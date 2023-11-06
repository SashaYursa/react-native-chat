import { Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import styled from 'styled-components';

const BackButton = ({onPress}) => {
    const router = useRouter();
    const pressAction = () => onPress ? onPress() : router.back()

    return (
        <BackButtonContainer onPress={() => pressAction()}>
            <BackImage source={require('../../../assets/back.png')} />
        </BackButtonContainer>
    )
}

const BackButtonContainer = styled.TouchableOpacity`
justify-content: center;
align-items: center;
padding-top: 10px;
padding-left: 10px;
`
const BackImage = styled.Image`
height: 25px;
width: 25px;
`

export default BackButton