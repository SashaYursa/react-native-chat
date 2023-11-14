import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as FileSystem from 'expo-file-system'
import shorthash from 'shorthash'

const CachedImage = ({url, style, blurRadius = 0}) => {
    useEffect(() => {
        cached();
    }, [])
    const [uri, setUri] = useState(null);
    
    const cached = async () => {
        const name = shorthash.unique(url);
        const path = `${FileSystem.cacheDirectory}${name}`;

        const image = await FileSystem.getInfoAsync(path);

        if(image.exists){
            setUri(image.uri);
            return;
        }
        console.log('selected from browser')
        const newImage = await FileSystem.downloadAsync(url, path);
        setUri(newImage.uri);
    }

    return (
        <Image style={style} source={{uri}} blurRadius={blurRadius} />
    )
}

export default CachedImage