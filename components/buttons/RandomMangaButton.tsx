import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manga } from '@/helpers/types'
import { dbReadRandomManga } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'


interface RandomManhwaButtonProps {
    size?: number
    color?: string
}


const RandomMangaButton = ({size = 28, color = Colors.white}: RandomManhwaButtonProps) => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)

    const openRandomManhwa = async () => {
        setLoading(true)
        const m: Manga[] = await dbReadRandomManga(db, 1)
        if (m.length === 0) {
            Toast.show({text1: "No mangas!", text2: "Try update the database", type: "info"})
            setLoading(false)
            return
        }
        setLoading(false)
        router.navigate({
            pathname: '/(pages)/Manga', 
            params: {manga_id: m[0].manga_id}
        })
    }

    return (
        <View style={styles.container}  >
            {
                loading ?
                <ActivityIndicator size={size} color={color} /> :
                <Pressable onPress={openRandomManhwa} hitSlop={AppConstants.hitSlop}>
                    <Ionicons name='dice-outline' size={size} color={color}/>
                </Pressable>
            }
        </View>
    )
}

export default RandomMangaButton


const styles = StyleSheet.create({
    container: {
        padding: 6, 
        backgroundColor: Colors.backgroundColor, 
        borderRadius: 4
    }
})