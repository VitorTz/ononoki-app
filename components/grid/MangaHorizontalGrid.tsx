import { AppConstants } from '@/constants/AppConstants'
import { Manga } from '@/helpers/types'
import React from 'react'
import { FlatList, View } from 'react-native'
import MangaCard from './MangaCard'


interface ManhwaHorizontalGridProps {
    mangas: Manga[]
}


const MangaHorizontalGrid = ({mangas}: ManhwaHorizontalGridProps) => {
    return (
        <View style={{alignItems: 'flex-start', height: AppConstants.ManhwaCoverDimension.height + 180, width: '100%'}}>
            <FlatList
                data={mangas}
                horizontal={true}
                onEndReachedThreshold={2}
                keyExtractor={(item: Manga) => item.manga_id.toString()}
                renderItem={({item}) => <MangaCard manga={item} marginRight={4} />}
            />
        </View>
    )
}

export default MangaHorizontalGrid
