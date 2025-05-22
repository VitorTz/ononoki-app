import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'


interface HomeButtonProps {
  size?: number
  color?: string
}

const HomeButton = ({size = 28, color = Colors.white}: HomeButtonProps) => {

  return (
    <Pressable 
      onPress={() => router.replace('/(pages)/Home')} 
      hitSlop={AppConstants.hitSlopLarge}
      style={AppStyle.buttonBackground} >
        <Ionicons name='home' size={size} color={color} />
    </Pressable>
  )
}

export default HomeButton