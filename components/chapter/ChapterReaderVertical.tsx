import Ionicons from '@expo/vector-icons/Ionicons'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { useSQLiteContext } from 'expo-sqlite'
import ChapterFooter from './ChapterFooter'
import ChapterHeader from './ChapterHeader'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const MAX_WIDTH = wp(100)

export default function ChapterReaderVertical({ mangaTitle }: { mangaTitle: string }) {
  const db = useSQLiteContext()
  const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
  const [images, setImages] = useState<ChapterImage[]>([])
  const [loading, setLoading] = useState(false)
  const flashListRef = useRef<FlashList<ChapterImage>>(null)

  const currentChapter: Chapter = chapters[currentChapterIndex]

  // Estado compartilhado de escala
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)

  // Gesture Pinch
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      // aplica escala relativa ao último valor salvo
      scale.value = savedScale.value * e.scale
      if (scale.value < 1) {
        scale.value = 1
      }
    })
    .onEnd(() => {
      // ao terminar o gesto, salvamos a escala para ser usada como base no próximo gesto
      savedScale.value = scale.value
      // opcional: limitar valores de zoom
      if (savedScale.value < 1) {
        savedScale.value = 1
        scale.value = withTiming(1)
      }
      if (savedScale.value > 2.5) {
        savedScale.value = 2.5
        scale.value = withTiming(2.5)
      }
    })

  // estilo animado aplicado ao container de imagens
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const scrollToTop = () => {
    flashListRef.current?.scrollToOffset({ animated: false, offset: 0 })
  }

  const goToNextChapter = () => {
    if (currentChapterIndex + 1 < chapters.length) {
      setCurrentChapterIndex(currentChapterIndex + 1)
      runOnJS(scrollToTop)()
    }
  }

  const goToPreviousChapter = () => {
    if (currentChapterIndex - 1 >= 0) {
      setCurrentChapterIndex(currentChapterIndex - 1)
      runOnJS(scrollToTop)()
    }
  }

  useEffect(() => {
    async function load() {
      if (currentChapterIndex >= 0 && currentChapterIndex < chapters.length) {
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
        // reset zoom ao mudar de capítulo
        savedScale.value = 1
        scale.value = withTiming(1)
      }
    }
    load()
  }, [currentChapterIndex])

  const renderItem = ({ item }: { item: ChapterImage }) => {
    const width = Math.min(item.width, MAX_WIDTH)
    const height = (width * item.height) / item.width
    return (
      <Image
        style={{ width, height }}
        source={item.image_url}
        contentFit="cover"
      />
    )
  }

  return (
    <View style={{flex: 1}} >
           <ChapterHeader
             mangaTitle={mangaTitle}
             currentChapter={currentChapter}
             loading={loading}
             goToNextChapter={goToNextChapter}
             goToPreviousChapter={goToPreviousChapter}
           />      
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <FlashList
          data={images}
          ref={flashListRef}
          keyExtractor={(item) => item.image_url}
          renderItem={renderItem}
          estimatedItemSize={hp(50)}
          drawDistance={hp(300)}
          onEndReachedThreshold={3}          
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

        <Pressable
          onPress={scrollToTop}
          hitSlop={AppConstants.hitSlopLarge}
          style={styles.arrowUp}
        >
          <Ionicons name="arrow-up-outline" size={20} color="rgba(0,0,0,0.3)" />
        </Pressable>
      </Animated.View>
    </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  arrowUp: {
    position: 'absolute',
    bottom: 80,
    right: 12,
    padding: 6,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
})
