import { Colors } from '@/constants/Colors'
import { Chapter, ChapterImage } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { dbUpsertReadingHistory } from '@/lib/database'
import { spFetchChapterImages } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { Image } from 'expo-image'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import InteractiveImage from '../InteractiveImage'
import TopBar from '../TopBar'
import ChangeChapterReadModeButton from '../buttons/ChangeChapterReadModeButton'
import ReturnButton from '../buttons/ReturnButton'
import Row from '../util/Row'
import ChangeChapter from './ChangeChapter'
import ChangeChapterPage from './ChangeChapterPage'



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
    <View style={styles.container} >
      <View style={styles.innerContainer} >
        <TopBar title={mangaTitle!} numberOfLines={1} >
          <ReturnButton backgroundColor={Colors.black} />
        </TopBar>
        <Row style={{width: '100%', justifyContent: "space-between"}} >
          <ChangeChapter 
            loading={loading} 
            goToNextChapter={goToNextChapter} 
            goToPreviousChapter={goToPreviousChapter}/>

          <ChangeChapterPage
            currentPage={imageIndex.current}
            goToNextPage={moveToNextImage}
            goToPreviousPage={moveToPreviousImage}
            maxPage={images.length - 1}/>
          <ChangeChapterReadModeButton/>
        </Row>
      </View>

      {
        currentImage &&
        <View style={styles.imageContainer} >
          <InteractiveImage
            swapLeft={moveToPreviousImage}
            swapRight={moveToNextImage}
            chapterImage={currentImage}
          />          
        </View>
      }      
    </View>
  )
}

export default ChapterReaderHorizontal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black
  },
  innerContainer: {
    backgroundColor: Colors.black,
    paddingHorizontal: wp(5), 
    paddingTop: 26, 
    paddingVertical: 8
  },
  imageContainer: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  }
})