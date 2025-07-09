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
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
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
const SCREEN_HEIGHT = hp(100)
const SCREEN_WIDTH = MAX_WIDTH
const HEADER_BOX_HEIGHT = 160
const FOOTER_BOX_HEIGHT = 300

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<ChapterImage>)


const ChapterReaderVertical = ({ mangaTitle }: { mangaTitle: string }) => {
    const db = useSQLiteContext()
    const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
    const [images, setImages] = useState<ChapterImage[]>([])
    const [loading, setLoading] = useState(false)
    const flashListRef = useRef<FlashList<ChapterImage>>(null)

    const currentChapter: Chapter = chapters[currentChapterIndex]
    const headerVisible = useSharedValue(true)
    const footerVisible = useSharedValue(false)
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const flashListTotalHeight = useSharedValue(hp(100))

    useEffect(
      () => {
        async function load() {
          if (currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
          return
        }
        setLoading(true)
          await Image.clearMemoryCache()
          const imgs = await spFetchChapterImages(currentChapter.chapter_id)      
          let newHeight = 0
          imgs.forEach(img => {
            const w = Math.min(img.width, MAX_WIDTH)
            const h = (w * img.height) / img.width
            newHeight += h
          })
          Image.prefetch(imgs.slice(0, 3).map((i) => i.image_url))
          setImages(imgs)
          flashListTotalHeight.value = newHeight + FOOTER_BOX_HEIGHT
          footerVisible.value = false
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

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        headerVisible.value = event.contentOffset.y <= 50
        footerVisible.value = event.contentOffset.y + SCREEN_HEIGHT >= flashListTotalHeight.value
      }
    })

    const animatedHeaderStyle = useAnimatedStyle(() => {
      return {        
        transform: [
          {
            translateY: withTiming(headerVisible.value ? 0 : -HEADER_BOX_HEIGHT, { duration: 400 })
          }
        ],
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0
      }
    })

    const animatedFooterStyle = useAnimatedStyle(() => {
      return {        
        transform: [
          {
            translateY: withTiming(footerVisible.value ? -100 : FOOTER_BOX_HEIGHT, { duration: 400 })
          }
        ],
        zIndex: 10,
        width: '100%',
        position: 'absolute',
        bottom: -200,
        left: 0
      }
    })

    // IMAGES

    const pinchGesture = Gesture.Pinch()
      .onUpdate((e) => {
        scale.value = Math.max(1, savedScale.value * e.scale);
      })
      .onEnd(() => {
        savedScale.value = scale.value;
    });
    
    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        if (scale.value != 1) {
          const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
          translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, savedTranslateX.value + e.translationX));
        }
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
      })
      .activeOffsetX([-5, 5])
      .failOffsetY([-5, 5]);
    
    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onStart(() => {
        if (scale.value != 1) {
          scale.value = withTiming(1);
          savedScale.value = 1;
          translateX.value = withTiming(0);
          savedTranslateX.value = 0;
        } else {
          scale.value = withTiming(1.5);
          savedScale.value = 1.5;
          translateX.value = withTiming(0);
          savedTranslateX.value = 0;
        }
    });

    const composedGesture = Gesture.Simultaneous(
      pinchGesture, 
      panGesture, 
      doubleTapGesture
    );

    const imageAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateX: translateX.value }
      ],
    }))

    const renderItem = ({item}: {item: ChapterImage | "BoxHeader" | "BoxFooter"}) => {
      
      if (item === 'BoxHeader') {
        return <View style={{width: '100%', height: 160}} />
      }

      if (item === 'BoxFooter') {
        return <View style={{width: '100%', height: FOOTER_BOX_HEIGHT}} />
      }

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

    const keyExtractor = (item: ChapterImage | 'BoxHeader' | 'BoxFooter'): string => {
      switch (item) {
        case "BoxHeader":
          return 'BoxHeader'
        case "BoxFooter":
          return 'BoxFooter'
        default:
          return item.image_url
      }
    }

    return (
      <GestureDetector gesture={composedGesture} >
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
          <Animated.View style={[{flex: 1}, imageAnimatedStyle]} >
            <AnimatedFlashList
              data={[...['BoxHeader'], ...images, ...['BoxFooter']] as any}
              ref={flashListRef}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              estimatedItemSize={hp(50)}
              scrollEventThrottle={4}
              drawDistance={hp(300)}
              onEndReachedThreshold={3}
              onScroll={scrollHandler}
              ListEmptyComponent={<ActivityIndicator size={32} color={Colors.white} />}
            />
            <ChapterArrowUpButton onPress={scrollToTop} />
          </Animated.View>
          <Animated.View style={animatedFooterStyle} >
            <ChapterFooter
              mangaTitle={mangaTitle}
              currentChapter={currentChapter}
              loading={loading}
              goToNextChapter={goToNextChapter}
              goToPreviousChapter={goToPreviousChapter}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    )
}


export default ChapterReaderVertical


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.black
  }
}) 