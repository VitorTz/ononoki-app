import { AppConstants } from '@/constants/AppConstants'
import { Manga } from '@/helpers/types'
import { dbReadMangasOrderedByUpdateAt } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
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

    const onPress = () => {
        router.navigate("/(pages)/LatestUpdates")
    }

    return (
        <View style={{gap: 10}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >                
                <Title title='Latest Updates' iconName='rocket-outline'/>
                <Pressable onPress={onPress} hitSlop={AppConstants.hitSlopLarge} >
                    <Text style={[AppStyle.textRegular, {textDecorationLine: 'underline'}]}>view all</Text>
                </Pressable>
            </View>
            <MangaHorizontalGrid mangas={mangas}/>
        </View>
    )
}

export default LatestUpdatesGrid
