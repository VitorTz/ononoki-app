import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable } from 'react-native'


interface ButtonProps {
    iconName: string
    onPress: () => any
    iconSize?: number
    iconColor?: string
}


const Button = ({iconName, onPress, iconSize = 28, iconColor = Colors.white}: ButtonProps) => {

  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.hitSlop} >
        <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
    </Pressable>
  )

}

export default Button
