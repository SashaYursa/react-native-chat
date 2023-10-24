import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'

const Home = () => {
  const [data, setData] = useState([]);
  useEffect(()=> {
    console.log('123')
    try{
      setData([...data, 123])
    }
    catch(ex){
      console.log(ex, '----> exeption')
    }
    return () => {console.log(123); setData([])}
  }, [])
  console.log(data)
  return (
    <View>
      <Text>Home</Text>
    </View>
  )
}

export default Home