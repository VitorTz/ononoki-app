import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Text, View } from 'react-native'


const Logo = () => {
  return (
    <View>
      <Text style={[AppStyle.textHeader, {fontSize: 30, color: Colors.ononokiBlue}]}>Ononoki</Text>
    </View>
  )
}


export default Logo