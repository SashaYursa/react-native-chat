import { View, Text, TextInput, Button } from 'react-native'
import React from 'react'
import { Formik } from 'formik'
const EditUserForm = ({userData, updateUser}) => {
    const initValues = {
        displayName: userData.displayName,
    }
    return (
        <Formik 
        initialValues={initValues}
        onSubmit={async (values) => {
            updateUser(values)
        }}
        >
            {({ handleChange, handleSubmit, values }) => (
                <View>
                    <Text>Username</Text>
                    <TextInput
                    onChangeText={handleChange('displayName')}
                    value={values.displayName}
                    />
                    <Button onPress={handleSubmit} title="Save" />
                </View>
             )}
        </Formik>
    )
}


export default EditUserForm