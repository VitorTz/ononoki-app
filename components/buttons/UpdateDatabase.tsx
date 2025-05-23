import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { hasInternetAvailable } from '@/helpers/util'
import { dbCheckSecondsSinceLastRefresh, dbHasMangas, dbShouldUpdate, dbUpdateDatabase } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable } from 'react-native'
import Toast from 'react-native-toast-message'


interface UpdateDatabaseProps {
    iconSize?: number
    iconColor?: string,
    type: "server" | "client"
}

const UpdateDatabase = ({
    iconSize = 28, 
    iconColor = Colors.white,
    type
}: UpdateDatabaseProps) => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)

    const update = async () => {
        setLoading(true)
        const hasInternet = await hasInternetAvailable()
        if (!hasInternet) { 
            Toast.show({text1: "Hey", text2: "You don’t have internet access", type: 'info'})
            setLoading(false)
            return 
        }

        const shouldUpdate = await dbShouldUpdate(db, type)
        let hasMangas = true

        if (!shouldUpdate) {
            hasMangas = await dbHasMangas(db)
        }
        
        if (!shouldUpdate && hasMangas) {
            const secondsUntilRefresh = await dbCheckSecondsSinceLastRefresh(db, 'database')
            Toast.show({
                text1: "Wait ⌛", 
                text2: `You can try again in ${secondsUntilRefresh} seconds`, 
                type: 'info',
                visibilityTime: 3000
            })
        } else {
            Toast.show({
                text1: "Updating local database",
                type: 'info'
            })
            try {
                await dbUpdateDatabase(db)
                setLoading(false)
                router.replace("/(pages)/Home")
                return
            } catch (error) {
                console.log(error)
            }
        }

        setLoading(false)
    }

    return (
        <>
            {
                loading ?
                <ActivityIndicator size={iconSize} color={iconColor} /> :
                <Pressable onPress={update} hitSlop={AppConstants.hitSlop} >
                    <Ionicons name='cloud-download-outline' size={iconSize} color={iconColor} />
                </Pressable>
            }
        </>
    )
}

export default UpdateDatabase
