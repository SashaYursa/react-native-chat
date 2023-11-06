import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { memo } from 'react'
import styled from 'styled-components'
import EditUserForm from './Forms/EditUserForm'
import BackButton from './Buttons/BackButton'

const EditUser = ({user, updateUser, setDisplayModal}) => {
    console.log('rerender')
    return (
        <Container>
            <EditWrapper contentContainerStyle={{paddingVertical: 50}}>
                <BackButtonContainer>
                    <BackButton onPress={() => setDisplayModal(false)}/>
                </BackButtonContainer>
                <EditUserForm userData={user} updateUser={updateUser}/>
            </EditWrapper>
        </Container>
    )
}

const Container = styled.View`
flex-grow: 1;
background-color: #fff;
`
const BackButtonContainer = styled.View`
flex-direction: row;
align-items: flex-start;
justify-content: flex-start;
`

const EditWrapper = styled.ScrollView`
flex-grow: 1;
`


export default EditUser