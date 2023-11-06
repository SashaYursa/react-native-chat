import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { TextInput, Button } from 'react-native-paper';
import React, {memo} from 'react'
import { Formik } from 'formik'
import styled from 'styled-components'
import * as ImagePicker from 'expo-image-picker';
import CachedImage from '../CachedImage';
const EditUserForm = ({userData, updateUser}) => {
    console.log('here re')
    //const imageSource = user.image ? {uri: user.image} : require('../../assets/default-user-big.png')
    const userImageHandleImage = require('../../../assets/remove-item.png')
    const initValues = {
        displayName: userData.displayName,
        image: userData.image
    }

    const selectUserImage = async (setValue) => {
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            aspect: [4, 3],
            quality: .1,
            selectionLimit: 1,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false
        }
        const result = await ImagePicker.launchImageLibraryAsync(options);
        if(!result.canceled){
            const images = result.assets.map(item => {
            if(item.type === 'image'){
                return item.uri
            }
            })
            setValue('image', images[0])
        }
    }

    return (
        <Formik 
        initialValues={initValues}
        onSubmit={async (values) => {
            updateUser(values)
        }}
        >
            {({ handleChange, setFieldValue, handleSubmit, values }) => (
                <View>
                    <ImageContainer>
                    { values.image
                        ?   <CachedImage url={values.image} style={styles.imagePreview} />
                        :   <Image source={require('../../../assets/default-user-big.png')} style={styles.imagePreview}/>
                    }
                    
                    { values.image !== null &&
                    <RemoveImageButton onPress={() => setFieldValue('image', null)}>
                        <Image style={{width: '100%', height: '100%'}} source={userImageHandleImage} />
                    </RemoveImageButton>
                    }
                    <ImageSelectButton onPress={() => {
                        selectUserImage(setFieldValue)
                    }}>
                        <Image style={{width: '100%', height: '100%'}} source={userImageHandleImage} />
                    </ImageSelectButton>
                </ImageContainer>
                <TextFields>
                    <TextInput label='UserName' mode='outlined'
                    onChangeText={handleChange('displayName')}
                    value={values.displayName}
                    />
                </TextFields>
                <Button style={{alignSelf: 'center', marginTop: 20}} icon="check" mode="elevated" uppee textColor='#000' onPress={handleSubmit}>
                    Save
                </Button>
                </View>
             )}
        </Formik>
    )
}

const styles = StyleSheet.create({
    imagePreview: {
        backgroundColor: '#eaeaea',
        width: '100%',
        height: '100%',
    }
})

const ImageContainer = styled.View`
position: relative;
width:  60%;
height: 260px;
background-color: red;
margin: 20px auto;
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
const TextFields = styled.View`
flex-grow: 1;
padding: 10px 5px;
background-color: #fff;
`


export default React.memo(EditUserForm, (prevProps, nextProps) => {
        console.log(prevProps, 'prev')
        console.log( nextProps, 'next')
    }
)