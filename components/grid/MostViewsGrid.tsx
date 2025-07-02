import { Manga } from '@/helpers/types'
import { dbReadMangasOrderedByViews } from '@/lib/database'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import ViewAllButton from '../buttons/ViewAllButton'
import Title from '../Title'
import MangaHorizontalGrid from './MangaHorizontalGrid'


const MostViewGrid = () => {

    const db = useSQLiteContext()
    const [mangas, setManhwas] = useState<Manga[]>([])    

    useEffect(
        () => {
            async function fetchMangas() {
                const values = await dbReadMangasOrderedByViews(db, 0, 30);
                setManhwas(values);
            }
            fetchMangas();
        },
        [db]
    )

    const onViewAllPress = () => {
        router.navigate("/(pages)/MostView")
    }

    return (
        <View style={{gap: 10}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >                
                <Title title='Most View' iconName='flame-outline'/>
                <ViewAllButton onPress={onViewAllPress}/>
            </View>
            <MangaHorizontalGrid mangas={mangas}/>
        </View>
    )
}

export default MostViewGrid
