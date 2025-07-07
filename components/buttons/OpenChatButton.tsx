import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'

const OpenChatButton = () => {
  
    const onPress = () => {
        router.navigate("/(pages)/ChooseChatPage")
    }

    return (
        <Pressable onPress={onPress} hitSlop={AppConstants.hitSlop} style={styles.container} >
            <Ionicons name='chatbox-ellipses' size={28} />
        </Pressable>
    )
  
}

export default OpenChatButton

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.chatColor,
        padding: 12,
        borderRadius: 32
    }
})