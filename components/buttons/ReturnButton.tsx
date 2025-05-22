import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'


interface ReturnButtonProps {
  size?: number
  color?: string
  onPress?: () => any
}


const ReturnButton = ({
  size = 28, 
  color = Colors.white, 
  onPress = () => router.back()
}: ReturnButtonProps) => {
  return (
    <Pressable 
      style={styles.container}
      onPress={onPress} 
      hitSlop={AppConstants.hitSlopLarge} >
        <Ionicons name='return-down-back-outline' size={size} color={color} />
    </Pressable>
  )
}

export default ReturnButton

const styles = StyleSheet.create({
  container: {
    padding: 6,
    backgroundColor: Colors.almostBlack,
    borderRadius: 4
  }
})