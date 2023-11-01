import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import styled from 'styled-components'
import EditUserForm from './Forms/EditUserForm'

const EditUser = ({user, updateUser}) => {
    return (
        <Container>
            <EditWrapper contentContainerStyle={{paddingVertical: 10}}>
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


export default EditUser