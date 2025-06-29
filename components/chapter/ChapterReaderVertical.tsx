import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import ChapterFooter from './ChapterFooter'
import ChapterHeader from './ChapterHeader'


const MAX_WIDTH = wp(100)


const ChapterReaderVertical = ({mangaTitle}: {mangaTitle: string}) => {

  const db = useSQLiteContext()
  const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
  const [images, setImages] = useState<ChapterImage[]>([])
  const [loading, setLoading] = useState(false)
  const flashListRef = useRef<FlashList<ChapterImage>>(null)

  const currentChapter: Chapter = chapters[currentChapterIndex]    
  
  const scrollUp = () => {
    flashListRef.current?.scrollToOffset({animated: false, offset: 0})
  }  

  const goToNextChapter = async () => {
    if (currentChapterIndex + 1 < chapters.length) {
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
    scrollUp()
  }

  const goToPreviousChapter = async () => {
    if (currentChapterIndex - 1 >= 0) {
      setCurrentChapterIndex(currentChapterIndex - 1)
    }
    scrollUp()
  }

  useEffect(
    () => {
      async function init() {
          if (currentChapterIndex >= 0 && currentChapterIndex < chapters.length) {
            setLoading(true)
              await Image.clearMemoryCache()
              await spFetchChapterImages(currentChapter.chapter_id)
                .then(values => {
                    Image.prefetch(values.slice(0, 3).map(i => i.image_url))
                    setImages([...values])
                })
            setLoading(false)
            dbUpsertReadingHistory(
              db, 
              currentChapter.manga_id, 
              currentChapter.chapter_id,
              currentChapter.chapter_num
            )
        }
      }
      init()
    },
    [db, currentChapterIndex]
  )

  const renderItem = ({item}: {item: ChapterImage}) => {
    const width = item.width < MAX_WIDTH ? item.width : MAX_WIDTH
    const height = width * (item.height / item.width)
        
    return (
        <Image style={{ width, height}} source={item.image_url} contentFit='cover'/>
    )
  }

  return (
    <View style={{flex: 1}} >
        <FlashList
          data={images}
          ListHeaderComponent={
            <ChapterHeader 
              mangaTitle={mangaTitle} 
              currentChapter={currentChapter} 
              loading={loading} 
              goToNextChapter={goToNextChapter} 
              goToPreviousChapter={goToPreviousChapter}
              />
          }
          ListFooterComponent={
            <ChapterFooter 
              mangaTitle={mangaTitle} 
              currentChapter={currentChapter} 
              loading={loading} 
              goToNextChapter={goToNextChapter} 
              goToPreviousChapter={goToPreviousChapter}
              />
          }
          keyExtractor={(item, index) => item.image_url}
          onEndReachedThreshold={3}
          estimatedItemSize={hp(50)}
          drawDistance={hp(300)}
          ref={flashListRef}
          renderItem={renderItem}
          ListEmptyComponent={<ActivityIndicator size={32} color={Colors.white} />}
        />
      
      <Pressable onPress={scrollUp} hitSlop={AppConstants.hitSlopLarge} style={styles.arrowUp} >
          <Ionicons name='arrow-up-outline' size={20} color={'rgba(0, 0, 0, 0.3)'} />
      </Pressable>

    </View>
  )
}


export default ChapterReaderVertical


const styles = StyleSheet.create({
    arrowUp: {
    position: 'absolute', 
    bottom: 80, 
    right: 12, 
    padding: 6, 
    borderRadius: 32, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  }
})