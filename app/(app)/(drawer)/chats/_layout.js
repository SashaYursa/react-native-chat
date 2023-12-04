import { Text, View } from "react-native"
import Chats from "."
import { useSelector } from "react-redux"
const ChatsLayout = () => {
  const user = useSelector(state => state.auth.user)
  return (
    <Chats user={user}/>
  )
}

export default ChatsLayout