import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Manga } from '@/helpers/types'
import { getItemGridDimensions, hp, wp } from '@/helpers/util'
import { FlashList } from '@shopify/flash-list'
import React, { useEffect, useRef } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import MangaCard from './MangaCard'


interface MangaGridProps {
    mangas: Manga[]
    onEndReached?: () => void
    loading?: boolean
    hasResults?: boolean
    shouldScrollToTopWhenManhwasChange?: boolean
    paddingHorizontal?: number
    gap?: number
    numColumns?: number
    shouldShowChapterDate?: boolean
    showChaptersPreview?: boolean
    listMode?: 'FlashList' | 'FlatList'
    estimatedItemSize?: number
    activityIndicatorColor?: string
}


const MangaGrid = ({
    mangas, 
    onEndReached, 
    loading = false, 
    hasResults = true,
    shouldScrollToTopWhenManhwasChange = false,
    paddingHorizontal = wp(5), 
    gap = 10, 
    numColumns = 1,
    shouldShowChapterDate = true,
    showChaptersPreview = true,
    listMode = 'FlashList',
    estimatedItemSize = AppConstants.MangaCoverDimension.height + 180,
    activityIndicatorColor = Colors.ononokiBlue
}: MangaGridProps) => {    

    const ref = useRef<FlashList<Manga>>(null)

    const {width, height} = getItemGridDimensions(
        paddingHorizontal,
        gap,
        numColumns,
        AppConstants.MangaCoverDimension.width,
        AppConstants.MangaCoverDimension.height
    )

    useEffect(
        () => {            
            if (shouldScrollToTopWhenManhwasChange) {
                ref.current?.scrollToOffset({animated: false, offset: 0})
            }
        },
        [mangas, shouldScrollToTopWhenManhwasChange]
    )

    return (
        <View style={{width: '100%', flex: 1, marginBottom: 42}} >
            {
                listMode === 'FlashList' ?
                    <FlashList
                        ref={ref as any}
                        keyboardShouldPersistTaps={'always'}
                        data={mangas}
                        numColumns={numColumns}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => 
                            <MangaCard 
                                showChaptersPreview={showChaptersPreview} 
                                shouldShowChapterDate={shouldShowChapterDate} 
                                width={width} 
                                height={height} 
                                marginBottom={6} 
                                manga={item} />
                        }
                        estimatedItemSize={estimatedItemSize}
                        ListFooterComponent={
                            <>
                                {
                                    loading && hasResults &&
                                    <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                                        <ActivityIndicator size={32} color={activityIndicatorColor} />
                                    </View> 
                                }
                            </>
                        }
                        drawDistance={hp(100)}
                        onEndReached={onEndReached}
                        scrollEventThrottle={4}
                        onEndReachedThreshold={2}/>
                    :
                    <FlatList
                        keyboardShouldPersistTaps={'always'}
                        ref={ref as any}
                        data={mangas}
                        numColumns={numColumns}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => 
                            <MangaCard 
                                showChaptersPreview={showChaptersPreview} 
                                shouldShowChapterDate={shouldShowChapterDate} 
                                width={width} 
                                height={height} 
                                marginBottom={6} 
                                manga={item} />
                        }
                        initialNumToRender={4}
                        onEndReached={onEndReached}
                        scrollEventThrottle={4}
                        onEndReachedThreshold={3}
                        ListFooterComponent={
                            <>
                                {
                                    loading && hasResults &&
                                    <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                                        <ActivityIndicator size={32} color={activityIndicatorColor} />
                                    </View> 
                                }
                            </>
                        }
                    />
            }
        </View>
    )
}

export default MangaGrid
