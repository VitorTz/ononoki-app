import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Text, View } from 'react-native'


interface TitleProps {
    title: string
    iconName?: string
    textColor?: string
    iconColor?: string
}

const Title = ({title, iconName, textColor = Colors.white, iconColor = Colors.white}: TitleProps) => {
  return (
    <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 10}} >
        <Text style={[AppStyle.textHeader, {fontSize: 24, color: textColor}]}>{title}</Text>
        {iconName && <Ionicons name={iconName as any} size={28} color={iconColor} />}
    </View>
  )
}

export default Title
