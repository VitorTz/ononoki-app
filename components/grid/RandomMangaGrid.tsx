import { AppConstants } from '@/constants/AppConstants'
import { Manga } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { dbReadRandomManga } from '@/lib/database'
import { FlashList } from '@shopify/flash-list'
import { useSQLiteContext } from 'expo-sqlite'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import RotatingButton from '../buttons/RotatingButton'
import Title from '../Title'
import MangaCard from './MangaCard'


const RandomMangaGrid = () => {

    const db = useSQLiteContext()
    const [mangas, setManhwas] = useState<Manga[]>([])
    const flashListRef = useRef<FlashList<Manga> | null>(null)

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
            .then(values => {
                setManhwas(values); 
                flashListRef.current?.scrollToIndex({animated: true, index: 0})
        })
    }

    const debounceReload = useCallback(debounce(reload, 2000), []);

    const renderItem = ({item}: {item: Manga}) => {
        return (
            <MangaCard manga={item} marginRight={4} />
        )
    }

    return (
        <View style={{gap: 10}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >                
                <Title title='Random' iconName='dice-outline'/>
                <RotatingButton onPress={debounceReload} duration={800} />
            </View>
            <View style={style.gridContainer}>
                <FlashList
                    ref={flashListRef}
                    data={mangas}
                    horizontal={true}
                    onEndReachedThreshold={2}
                    estimatedItemSize={wp(80)}
                    drawDistance={wp(100)}
                    keyExtractor={(item: Manga) => item.manga_id.toString()}
                    renderItem={renderItem}
                />
            </View>
        </View>
    )
}

export default RandomMangaGrid


const style = StyleSheet.create({
    gridContainer: {
        alignItems: 'flex-start', 
        height: AppConstants.ManhwaCoverDimension.height + 180, 
        width: '100%'
    }
})