import { AppConstants } from '@/constants/AppConstants'
import { Manga } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { View } from 'react-native'
import MangaCard from './MangaCard'


interface ManhwaHorizontalGridProps {
    mangas: Manga[]
}


const MangaHorizontalGrid = ({mangas}: ManhwaHorizontalGridProps) => {
    return (
        <View style={{alignItems: 'flex-start', height: AppConstants.ManhwaCoverDimension.height + 180, width: '100%'}}>
            <FlashList
                data={mangas}
                horizontal={true}
                onEndReachedThreshold={2}
                estimatedItemSize={wp(80)}
                drawDistance={wp(100)}
                keyExtractor={(item: Manga) => item.manga_id.toString()}
                renderItem={({item}) => <MangaCard manga={item} marginRight={4} />}
            />
        </View>
    )
}

export default MangaHorizontalGrid
