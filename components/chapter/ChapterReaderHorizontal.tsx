import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import InteractiveImage from '../InteractiveImage'
import TopBar from '../TopBar'
import ChangeChapterReadModeButton from '../buttons/ChangeChapterReadModeButton'
import ReturnButton from '../buttons/ReturnButton'
import Row from '../util/Row'
import ChangeChapter from './ChangeChapter'

interface ChangeChapterPageComponentProps {
  currentPage: number
  goToPreviousPage: () => any
  goToNextPage: () => any
  maxPage: number
}


const ChangeChapterPageComponent = ({
  currentPage,
  goToPreviousPage,
  goToNextPage,
  maxPage
}: ChangeChapterPageComponentProps) => {

  return (
    <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "flex-start"}} >
      <Text style={[AppStyle.textRegular, {fontSize: 18}]}>Page</Text>
      {
        currentPage > 0 &&
        <Pressable onPress={goToPreviousPage} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.hitSlop} >
          <Ionicons name='chevron-back' size={20} color={Colors.white} />
        </Pressable>
      }
      <View style={{alignItems: "center", justifyContent: "center"}} >
        <Text style={[AppStyle.textRegular, {fontSize: 18}]}>{currentPage + 1}</Text>
      </View>
      {
        currentPage < maxPage &&
        <Pressable onPress={goToNextPage} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.hitSlop}>
          <Ionicons name='chevron-forward' size={20} color={Colors.white} />
        </Pressable>
      }
    </View> 
  )
}


const ChapterReaderHorizontal = ({mangaTitle}: {mangaTitle: string}) => {
  const db = useSQLiteContext()  
  const { chapters, currentChapterIndex, setCurrentChapterIndex } = useChapterState()
  const [images, setImages] = useState<ChapterImage[]>([])
  const [currentImage, setCurrentImage] = useState<ChapterImage | null>(null)  
  const [loading, setLoading] = useState(false)

  const currentChapter: Chapter = chapters[currentChapterIndex]    

  const imageIndex = useRef(0)
  const prefetchState = useRef<{url: string, fetched: boolean}[]>([])

  const goToNextChapter = async () => {
    if (currentChapterIndex + 1 < chapters.length) {
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
  }

  const goToPreviousChapter = async () => {
    if (currentChapterIndex - 1 >= 0) {
      setCurrentChapterIndex(currentChapterIndex - 1)
    }
  }

  useEffect(
    () => {
      async function init() {
          if (currentChapterIndex >= 0 && currentChapterIndex < chapters.length) {
            setLoading(true)
              await Image.clearMemoryCache()
              const imgs: ChapterImage[] = await spFetchChapterImages(currentChapter.chapter_id)
              setCurrentImage(imgs.length > 0 ? imgs[0] : null)
              imageIndex.current = 0
              prefetchState.current = imgs.map(i => {return {fetched: false, url: i.image_url}})
              prefetchImages()
              setImages(imgs)
              dbUpsertReadingHistory(
                db, 
                currentChapter.manga_id, 
                currentChapter.chapter_id,
                currentChapter.chapter_num
              )
            setLoading(false)
        }
      }
      init()
    },
    [db, currentChapterIndex]
  )

  const prefetchImages = () => {
    for (let i = imageIndex.current; i < imageIndex.current + 2 && i < images.length; i++) {
      if (!prefetchState.current[i].fetched) {
        Image.prefetch(prefetchState.current[i].url)
        prefetchState.current[i].fetched = true
      }
    }
  }

  const moveToNextImage = () => {
    if (imageIndex.current + 1 < images.length ) {
      imageIndex.current += 1
      setCurrentImage(images[imageIndex.current])
      prefetchImages()
    }
  }

  const moveToPreviousImage = () => {  
    if (imageIndex.current - 1 >= 0 && images.length > 0) {
      imageIndex.current -= 1
      setCurrentImage(images[imageIndex.current])
      prefetchImages()
    }
  }

  return (
    <View style={{flex: 1}} >
      <View style={{paddingHorizontal: wp(5), paddingTop: 26, paddingVertical: 8}} >
        <TopBar title={mangaTitle!} numberOfLines={1} >
          <ReturnButton backgroundColor={Colors.backgroundColor} />
        </TopBar>

        <Row style={{justifyContent: "space-between"}} >
          <ChangeChapter 
            loading={loading} 
            goToNextChapter={goToNextChapter} 
            goToPreviousChapter={goToPreviousChapter}/>

          <ChangeChapterPageComponent
            currentPage={imageIndex.current}
            goToNextPage={moveToPreviousImage}
            goToPreviousPage={moveToNextImage}
            maxPage={images.length - 1}/>
          <ChangeChapterReadModeButton/>
        </Row>

      </View>

      {
        currentImage &&
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
          <InteractiveImage
            swapLeft={moveToPreviousImage}
            swapRight={moveToNextImage}
            originalWidth={currentImage.width}
            originalHeight={currentImage.height}
            imageUri={currentImage.image_url}
          />          
        </View>
      }      
    </View>
  )
}

export default ChapterReaderHorizontal

const styles = StyleSheet.create({})