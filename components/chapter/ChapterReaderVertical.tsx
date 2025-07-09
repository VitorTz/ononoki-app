import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import ChapterArrowUpButton from '../buttons/ChapterArrowUpButton'
import ChapterFooter from './ChapterFooter'
import ChapterHeader from './ChapterHeader'


const MAX_WIDTH = wp(100)


const ChapterImageComponent = ({image}: {image: ChapterImage | "Box"}) => {
  if (image === 'Box') {
    return <View style={{width: '100%', height: 160}} />
  }
  const width = Math.min(image.width, MAX_WIDTH)
  const height = (width * image.height) / image.width

  return (
    <Image style={{ width, height }} source={image.image_url} contentFit="cover"/>
  )
}


const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<ChapterImage>)


const ChapterReaderVertical = ({ mangaTitle }: { mangaTitle: string }) => {
    const db = useSQLiteContext()
    const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
    const [images, setImages] = useState<ChapterImage[]>([])
    const [loading, setLoading] = useState(false)
    const flashListRef = useRef<FlashList<ChapterImage>>(null)

    const currentChapter: Chapter = chapters[currentChapterIndex]

    const scrollToTop = () => {
      flashListRef.current?.scrollToOffset({ animated: false, offset: 0 })
    }
    
    const goToNextChapter = () => {
      if (currentChapterIndex + 1 < chapters.length) {
        setCurrentChapterIndex(currentChapterIndex + 1)
        scrollToTop()
      }
    }

    const goToPreviousChapter = () => {
      if (currentChapterIndex - 1 >= 0) {
        setCurrentChapterIndex(currentChapterIndex - 1)
        scrollToTop()
      }
    }

    useEffect(
      () => {
        async function load() {
          if (currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
          return
        }
        setLoading(true)
          await Image.clearMemoryCache()
          const imgs = await spFetchChapterImages(currentChapter.chapter_id)      
          Image.prefetch(imgs.slice(0, 3).map((i) => i.image_url))
          setImages(imgs)
        setLoading(false)

        dbUpsertReadingHistory(
          db,
          currentChapter.manga_id,
          currentChapter.chapter_id,
          currentChapter.chapter_num
        )
      }
      load()
    }, [currentChapterIndex])
    
    const headerVisible = useSharedValue(true)    

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        headerVisible.value = event.contentOffset.y <= 20
      }
    })

    const animatedHeaderStyle = useAnimatedStyle(() => {
      return {        
        transform: [
          {
            translateY: withTiming(headerVisible.value ? 0 : -160, { duration: 400 })
          }
        ],
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0
      }
    })

    return (
      <View style={styles.container} >
        <Animated.View style={animatedHeaderStyle}>
          <ChapterHeader
            mangaTitle={mangaTitle}
            currentChapter={currentChapter}
            loading={loading}
            goToNextChapter={goToNextChapter}
            goToPreviousChapter={goToPreviousChapter}
          />
        </Animated.View>        
          <AnimatedFlashList
            data={[...['Box'], ...images] as any}
            ref={flashListRef}
            keyExtractor={(item: ChapterImage | 'Box') => item === 'Box' ? 'Box' : item.image_url}
            renderItem={({item}) => <ChapterImageComponent image={item} />}
            estimatedItemSize={hp(50)}
            scrollEventThrottle={4}
            drawDistance={hp(300)}
            onEndReachedThreshold={3}
            onScroll={scrollHandler}
            ListFooterComponent={
              <ChapterFooter
                mangaTitle={mangaTitle}
                currentChapter={currentChapter}
                loading={loading}
                goToNextChapter={goToNextChapter}
                goToPreviousChapter={goToPreviousChapter}
              />
            }
            ListEmptyComponent={<ActivityIndicator size={32} color={Colors.white} />}
          />
          <ChapterArrowUpButton onPress={scrollToTop} />        
    </View>
    )
}


export default ChapterReaderVertical


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.black
  }
}) 