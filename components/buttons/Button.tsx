import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable, ViewStyle } from 'react-native'


interface ButtonProps {
    iconName: string
    onPress: () => any
    iconSize?: number
    iconColor?: string
    style?: ViewStyle
}


const Button = ({iconName, onPress, style, iconSize = 28, iconColor = Colors.white}: ButtonProps) => {

  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.hitSlop} style={style} >
        <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
    </Pressable>
  )

}

export default Button
