import { Image } from 'react-native'
import {memo} from 'react'
import CachedImage from './CachedImage'

const UserImage = memo(({imageUrl, style}) => {
    return imageUrl === null 
    ? <Image source={require('../../assets/default-chat-image.png')} style={style}/> 
    : <CachedImage style={style} url={imageUrl}/>
  }, (prev, next) => {
    return prev === next
  })

export default UserImage