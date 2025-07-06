import { Colors } from '@/constants/Colors'
import { spCreateFriend } from '@/lib/supabase'
import Ionicons from '@expo/vector-icons/Ionicons'
import { PostgrestError } from '@supabase/supabase-js'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, ViewStyle } from 'react-native'
import Toast from 'react-native-toast-message'


interface AddFriendButton {
    user_id: string | null
    friend_id: string
    style: ViewStyle
}

const AddFriendButton = ({user_id, friend_id, style}: AddFriendButton) => {

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        if (user_id === null) {
            Toast.show({text1: "You are not logged!", type: "info"})
            return
        }
        setLoading(true)
        const error: PostgrestError | null = await spCreateFriend(user_id, friend_id)
        if (error) {
            console.log(error)
            Toast.show({text1: "Error", text2: error.message, type: "error"})
        } else {
            Toast.show({text1: "Success!", type: "success"})
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <Pressable onPress={onPress} style={style}>
                <ActivityIndicator size={28} color={Colors.backgroundColor} />
            </Pressable>
        )
    }

    return (
        <Pressable onPress={onPress} style={style}>
            <Ionicons name='person-add' size={28} color={Colors.backgroundColor} />
        </Pressable>
    )
}

export default AddFriendButton
