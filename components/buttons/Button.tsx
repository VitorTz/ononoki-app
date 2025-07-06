import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, ViewStyle } from 'react-native'


interface ButtonProps {
    iconName: string
    onPress: () => any
    iconSize?: number
    iconColor?: string
    style?: ViewStyle
}


const Button = ({iconName, onPress, style, iconSize = 28, iconColor = Colors.white}: ButtonProps) => {

  const [loading, setLoading] = useState(false)

  const p = async () => {
    setLoading(true)
    await onPress()
    setLoading(false)
  }

  if (loading) {
    return (
      <Pressable onPress={p} hitSlop={AppConstants.hitSlop} style={style} >
        <ActivityIndicator size={iconSize} color={iconColor} />
      </Pressable>
    )
  }

  return (
    <Pressable onPress={p} hitSlop={AppConstants.hitSlop} style={style} >
        <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
    </Pressable>
  )

}

export default Button
