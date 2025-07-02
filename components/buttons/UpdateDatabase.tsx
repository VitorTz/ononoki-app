import { Colors } from '@/constants/Colors'
import { hasInternetAvailable } from '@/helpers/util'
import { dbCheckSecondsSinceLastRefresh, dbHasMangas, dbShouldUpdate, dbUpdateDatabase } from '@/lib/database'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React from 'react'
import Toast from 'react-native-toast-message'
import BooleanRotatingButton from './BooleanRotatingButton'


interface UpdateDatabaseProps {
    iconSize?: number
    iconColor?: string,
    type: "server" | "client"
}


const UpdateDatabaseButton = ({
    iconSize = 28, 
    iconColor = Colors.white,
    type
}: UpdateDatabaseProps) => {

    const db = useSQLiteContext()    

    const update = async () => {        
        const hasInternet = await hasInternetAvailable()
        if (!hasInternet) { 
            Toast.show({text1: "Hey", text2: "You don’t have internet access", type: 'info'})
            return 
        }

        const shouldUpdate = await dbShouldUpdate(db, type)
        let hasMangas = true

        if (!shouldUpdate) {
            hasMangas = await dbHasMangas(db)
        }
        
        if (!shouldUpdate && hasMangas) {
            const secondsUntilRefresh = await dbCheckSecondsSinceLastRefresh(db, type)
            Toast.show({
                text1: "Wait ⌛", 
                text2: `You can try again in ${secondsUntilRefresh} seconds`, 
                type: 'info',
                visibilityTime: 3000
            })
        } else {
            Toast.show({
                text1: "Synchronizing local database...",
                type: 'info'
            })
            try {
                await dbUpdateDatabase(db)
                Toast.show({
                    text1: "Sync completed",
                    type: 'info'
                })
                router.replace("/(pages)/Home")
                return
            } catch (error) {
                console.log(error)
            }
        }
        
    }

    return (           
        <BooleanRotatingButton 
            onPress={update} 
            iconSize={iconSize} 
            iconColor={iconColor}
        />
    )
}

export default UpdateDatabaseButton
