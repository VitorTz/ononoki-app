import { Manga } from '@/helpers/types'
import { dbReadRandomManga } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import RotatingButton from '../buttons/RotatingButton'
import Title from '../Title'
import MangaHorizontalGrid from './MangaHorizontalGrid'


const RandomMangaGrid = () => {

    const db = useSQLiteContext()
    const [mangas, setManhwas] = useState<Manga[]>([])

    useEffect(
        () => {            
            async function init() {
                await dbReadRandomManga(db, 30)
                    .then(values => setManhwas(values))
            }
            init()
        },
        [db]
    )

    const reload = async () => {
        await dbReadRandomManga(db, 30)
            .then(values => setManhwas(values))
    }

    const debounceReload = useCallback(debounce(reload, 2000), []);

    return (
        <View style={{gap: 10}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >                
                <Title title='Random' iconName='dice-outline'/>
                <RotatingButton onPress={debounceReload} duration={800} />
            </View>
            <MangaHorizontalGrid mangas={mangas}/>
        </View>
    )
}

export default RandomMangaGrid
