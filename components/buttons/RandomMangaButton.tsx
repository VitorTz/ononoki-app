import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
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
            Toast.show({text1: "No mangas!", text2: "Try update the database", type: "info"})
            setLoading(false)
            return
        }        
        router.navigate({pathname: '/(pages)/Manga', params: {manga_id}})
        setLoading(false)
    }

    return (
        <View style={[styles.container, {backgroundColor}]}  >
            {
                loading ?
                <ActivityIndicator size={size} color={color} /> :
                <Pressable onPress={openRandomManhwa} hitSlop={AppConstants.hitSlop}>
                    <Ionicons name='dice' size={size} color={color}/>
                </Pressable>
            }
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