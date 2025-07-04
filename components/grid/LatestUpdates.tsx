import { Manga } from '@/helpers/types'
import { dbReadMangasOrderedByUpdateAt } from '@/lib/database'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import ViewAllButton from '../buttons/ViewAllButton'
import Title from '../Title'
import MangaHorizontalGrid from './MangaHorizontalGrid'


const LatestUpdatesGrid = () => {

    const db = useSQLiteContext()
    const [mangas, setManhwas] = useState<Manga[]>([])
    
    useEffect(
        () => {
            async function init() {
                await dbReadMangasOrderedByUpdateAt(db, 0, 30)
                    .then(values => setManhwas(values))
            }
            init()
        },
        [db]
    )

    const onViewAllPress = () => {
        router.navigate("/(pages)/LatestUpdates")
    }

    return (
        <View style={{gap: 10}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >                
                <Title title='Latest Updates' iconName='rocket'/>
                <ViewAllButton onPress={onViewAllPress} />
            </View>
            <MangaHorizontalGrid mangas={mangas}/>
        </View>
    )
}

export default LatestUpdatesGrid
