import { View, Text } from 'react-native'
import React from 'react'
import styled from 'styled-components'
import BackButton from '../components/Buttons/BackButton'
import { TextInput } from 'react-native-paper'
const TopSearch = ({inputRef, searchText, setSearchText, hasBack = true}) => {
  return (
    <Container>
        {hasBack && <BackButton/>}
        <SearchContainer>
            <TextInput ref={inputRef} mode='outlined' label='Search' style={{flexGrow: 1}} value={searchText} onChangeText={setSearchText}/>
        </SearchContainer>
   </Container>
  )
}

const Container = styled.View`
flex-direction: row;
gap: 5px;
`
const SearchContainer = styled.View`
flex-direction: row;
padding: 10px 5px;
flex-grow: 1;
`
export default TopSearch