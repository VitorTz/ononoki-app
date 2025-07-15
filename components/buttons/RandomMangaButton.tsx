import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { ToastMessages } from '@/constants/Messages'
import { dbGetRandomMangaId } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'


interface RandomManhwaButtonProps {
    size?: number
    color?: string
    backgroundColor?: string
}


const OpenRandomMangaButton = ({
    size = 28, 
    color = Colors.white,
    backgroundColor = Colors.backgroundColor
}: RandomManhwaButtonProps) => {
    
    const router = useRouter()
    const db = useSQLiteContext()    
    const [loading, setLoading] = useState(false)

    const openRandomManhwa = async () => {
        setLoading(true)
        const manga_id: number | null = await dbGetRandomMangaId(db)
        if (manga_id === null) {
            Toast.show(ToastMessages.EN.NO_MANGAS)
            setLoading(false)
            return
        }        
        router.navigate({pathname: '/(pages)/Manga', params: {manga_id}})
        setLoading(false)
    }

    if (loading) {
        return (
            <View style={[styles.container, {backgroundColor}]} >
                <ActivityIndicator size={size} color={color} />
            </View>
        )
    }

    return (
        <View style={[styles.container, {backgroundColor}]}  >
            <Pressable onPress={openRandomManhwa} hitSlop={AppConstants.hitSlop}>
                <Ionicons name='dice-outline' size={size} color={color}/>
            </Pressable>
        </View>
    )
}

export default OpenRandomMangaButton


const styles = StyleSheet.create({
    container: {
        padding: 6,         
        borderRadius: 4
    }
})