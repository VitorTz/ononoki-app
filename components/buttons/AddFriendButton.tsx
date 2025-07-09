import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { OnonokiUser } from '@/helpers/types'
import { dbCreateFriend, dbDeleteFriend, dbUserHasFriend } from '@/lib/database'
import { spCreateFriend, spDeleteFriend } from '@/lib/supabase'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, View, ViewStyle } from 'react-native'
import Toast from 'react-native-toast-message'


interface AddFriendButton {
    user_id: string | null
    friend: OnonokiUser
    style: ViewStyle
}

const AddFriendButton = ({user_id, friend, style}: AddFriendButton) => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)
    const [isFriend, setIsFriend] = useState(false)

    useEffect(
        () => {
            const init = async () => {
                await dbUserHasFriend(db, friend.user_id)
                    .then(v => setIsFriend(v))
            }
            init()
        },
        []
    )

    const iconName = isFriend ?
        'person-remove' :
        'person-add'

    const onPress = async () => {
        if (user_id === null) {
            Toast.show(ToastMessages.EN.NOT_LOGGED_IN)
            return
        }
        setLoading(true)
            if (isFriend) {
                await spDeleteFriend(user_id, friend.user_id)
                await dbDeleteFriend(db, friend.user_id)
                setIsFriend(false)
            } else {
                await spCreateFriend(user_id, friend.user_id)
                await dbCreateFriend(db, friend)
                setIsFriend(true)
            }
        setLoading(false)
    }

    if (loading) {
        return (
            <View style={style}>
                <ActivityIndicator size={28} color={Colors.backgroundColor} />
            </View>
        )
    }

    return (
        <Pressable onPress={onPress} style={style}>
            <Ionicons name={iconName} size={28} color={Colors.backgroundColor} />
        </Pressable>
    )
}

export default AddFriendButton
