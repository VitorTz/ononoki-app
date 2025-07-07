import { Colors } from '@/constants/Colors'
import { spCreateFriend, spDeleteFriend } from '@/lib/supabase'
import { useUserFriendState } from '@/store/userFriendState'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, ViewStyle } from 'react-native'
import Toast from 'react-native-toast-message'


interface AddFriendButton {
    user_id: string | null
    friend_id: string
    style: ViewStyle
}

const AddFriendButton = ({user_id, friend_id, style}: AddFriendButton) => {

    const { friends, setFriends } = useUserFriendState()
    const [loading, setLoading] = useState(false)

    const iconName = friends.has(friend_id) ?
        'person-remove' :
        'person-add'

    const onPress = async () => {
        if (user_id === null) {
            Toast.show({text1: "You are not logged!", type: "info"})
            return
        }
        setLoading(true)
            const s = new Set(friends)
            let error = null
            if (friends.has(friend_id)) {
                error = await spDeleteFriend(user_id, friend_id)
                s.delete(friend_id)
            } else {
                error = await spCreateFriend(user_id, friend_id)
                s.add(friend_id)
            }
            if (error) {
                Toast.show({text1: "Error", text2: error.message, type: "error"})
            } else {
                Toast.show({text1: "Success!", type: "success"})
            }
            setFriends(s)
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
            <Ionicons name={iconName} size={28} color={Colors.backgroundColor} />
        </Pressable>
    )
}

export default AddFriendButton
