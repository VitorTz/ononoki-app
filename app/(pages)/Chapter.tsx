import BugReportButton from '@/components/buttons/BugReportButton';
import ReturnButton from '@/components/buttons/ReturnButton';
import InteractiveImage from '@/components/InteractiveImage';
import MangaImage from '@/components/MangaImage';
import TopBar from '@/components/TopBar';
import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { Chapter, ChapterImage } from '@/helpers/types';
import { hp, wp } from '@/helpers/util';
import { dbUpsertReadingHistory } from '@/lib/database';
import { spFetchChapterImages } from '@/lib/supabase';
import { useReadingState } from '@/store/mangaReadingState';
import { AppStyle } from '@/styles/AppStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, {
  useEffect,
  useRef,
  useState
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import BugIcon from '../../components/BugIcon';


interface ChangeChapterComponentProps {
  loading: boolean
  currentChapter: Chapter
  goToPreviousChapter: () => any,
  goToNextChapter: () => any
}

const ChangeChapterComponent = ({
  loading,
  currentChapter,
  goToPreviousChapter,
  goToNextChapter
}: ChangeChapterComponentProps) => {

  return (
    <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "flex-start"}} >
      <Text style={[AppStyle.textRegular, {fontSize: 18}]}>Chapter</Text>
      <Pressable onPress={goToPreviousChapter} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.hitSlop} >
        <Ionicons name='chevron-back' size={20} color={Colors.white} />
      </Pressable>
      <View style={{alignItems: "center", justifyContent: "center"}} >
        {
          loading ?
          <ActivityIndicator size={20} color={Colors.white} /> :
          <Text style={[AppStyle.textRegular, {fontSize: 18}]}>{currentChapter!.chapter_num}</Text>
        }
      </View>
      <Pressable onPress={goToNextChapter} style={{alignItems: "center", justifyContent: "center", marginTop: 2}}  hitSlop={AppConstants.hitSlop}>
        <Ionicons name='chevron-forward' size={20} color={Colors.white} />
      </Pressable>
    </View> 
  )
}


interface ChangeChapterPageComponentProps {
  currentPage: number
  goToPreviousPage: () => any
  goToNextPage: () => any
}


const ChangeChapterPageComponent = ({
  currentPage,
  goToPreviousPage,
  goToNextPage
}: ChangeChapterPageComponentProps) => {

  return (
    <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "flex-start"}} >
      <Text style={[AppStyle.textRegular, {fontSize: 18}]}>Page</Text>
      <Pressable onPress={goToPreviousPage} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.hitSlop} >
        <Ionicons name='chevron-back' size={20} color={Colors.white} />
      </Pressable>
      <View style={{alignItems: "center", justifyContent: "center"}} >
        <Text style={[AppStyle.textRegular, {fontSize: 18}]}>{currentPage + 1}</Text>
      </View>
      <Pressable onPress={goToNextPage} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.hitSlop}>
        <Ionicons name='chevron-forward' size={20} color={Colors.white} />
      </Pressable>
    </View> 
  )
}

interface ChapterHeaderProps {
  manhwaTitle: string
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterHeader = ({ manhwaTitle, loading, goToPreviousChapter, goToNextChapter}: ChapterHeaderProps) => {

  const { currentChapter } = useReadingState()

  const reportTitle = `${manhwaTitle}/${currentChapter ? currentChapter.chapter_num: '?'}`

  const exitChapter = async () => {
    Image.clearMemoryCache()
    router.back()
  }
  
  return (
    <View style={{width: '100%', paddingHorizontal: wp(5)}} >
      <TopBar title={manhwaTitle} >
        <ReturnButton onPress={exitChapter} backgroundColor={Colors.black} />
      </TopBar>

      <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 20}} >
        
        {/* Chapter Controller Button */}
        <ChangeChapterComponent
            currentChapter={currentChapter!}
            goToNextChapter={goToNextChapter}
            goToPreviousChapter={goToPreviousChapter}
            loading={loading}            
        />
        <BugReportButton size={32} title={reportTitle} backgroundColor={Colors.black} />

      </View>
    </View>
  )
}


interface ChapterFooterProps {
  manwhaTitle: string
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterFooter = ({manwhaTitle: manhwa_title, loading, goToPreviousChapter, goToNextChapter }: ChapterFooterProps) => {
  
  const {  currentChapter } = useReadingState()

  const openBugReport = () => {    
    router.navigate({
      pathname: "/(pages)/BugReport",
      params: {title: `${manhwa_title}/${currentChapter ? currentChapter.chapter_num: '?'}`}
    })
  }

  return (
    <View style={{width: '100%', paddingHorizontal: wp(5), marginTop: 42, marginBottom: 220}} >
        
        {/* Chapter Controller Button */}
        <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", marginBottom: 20}} >
          <Text style={AppStyle.textHeader}>Chapter</Text>
          <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "center"}} >
            <Pressable onPress={goToPreviousChapter} hitSlop={AppConstants.hitSlop} >
              <Ionicons name='chevron-back' size={24} color={Colors.white} />
            </Pressable>
            <View style={{alignItems: "center", justifyContent: "center"}} >
              {
                loading ?
                <ActivityIndicator size={20} color={Colors.white} /> :
                <Text style={AppStyle.textHeader}>{currentChapter!.chapter_num}</Text>
              }
            </View>
            <Pressable onPress={goToNextChapter} hitSlop={AppConstants.hitSlop}>
              <Ionicons name='chevron-forward' size={24} color={Colors.white} />
            </Pressable>
          </View>
        </View>
            
          
        {/* Custom Bug Report Button */}
        <Pressable onPress={openBugReport} style={{width: '100%', padding: 12, flexDirection: 'row', borderRadius: 4, backgroundColor: Colors.gray}} >
          <Text style={[AppStyle.textRegular, {fontSize: 18, flex: 0.8}]}>
            If you encounter broken or missing images, please use the bug-report option.
          </Text>
          <View style={{flex: 0.2, height: 64, alignSelf: "flex-start", alignItems: "center", justifyContent: "center"}} > 
            <BugIcon size={48} />
          </View>
        </Pressable>

      </View>
  )
}

interface ChapterProps {
  viewMode?: "List" | "Page"
}


interface ChapterListModeProps {  
  manga_title: string
  setReadMode: React.Dispatch<React.SetStateAction<"List" | "Page">>
}

const ChapterListMode = ({  
  manga_title,
  setReadMode
}: ChapterListModeProps) => {

  const db = useSQLiteContext()
  const { currentChapter, moveToNextChapter, moveToPreviousChapter  } = useReadingState()
  const [images, setImages] = useState<ChapterImage[]>([])

  const [loading, setLoading] = useState(false)
  const flashListRef = useRef<FlashList<ChapterImage>>(null)

  const scrollUp = () => {
    flashListRef.current?.scrollToOffset({animated: false, offset: 0})
  }  

  const goToNextChapter = async () => {
    scrollUp()
    moveToNextChapter()
  }

  const goToPreviousChapter = async () => {
    scrollUp()
    moveToPreviousChapter()
  }

  useEffect(
    () => {
      async function init() {
          if (currentChapter) {
            console.log("change chapter", currentChapter)
            setLoading(true)
              await Image.clearMemoryCache()
              await spFetchChapterImages(currentChapter.chapter_id)
                .then(values => setImages([...values]))
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
    [db, currentChapter]
  )

  return (
    <View style={{flex: 1}} >
        <FlashList
          data={images}
          ListHeaderComponent={<ChapterHeader manhwaTitle={manga_title} loading={loading} goToNextChapter={goToNextChapter} goToPreviousChapter={goToPreviousChapter}/>}
          ListFooterComponent={<ChapterFooter manwhaTitle={manga_title} loading={loading} goToNextChapter={goToNextChapter} goToPreviousChapter={goToPreviousChapter}/>}
          keyExtractor={(item, index) => item.image_url}          
          onEndReachedThreshold={3}
          estimatedItemSize={hp(50)}
          drawDistance={hp(300)}
          ref={flashListRef}
          renderItem={({item, index}) => 
            <MangaImage
              imageUrl={item.image_url} 
              originalWidth={item.width} 
              originalHeight={item.height} />
          }
          ListEmptyComponent={<ActivityIndicator size={32} color={Colors.white} />}
        />
        <Pressable onPress={scrollUp} hitSlop={AppConstants.hitSlopLarge} style={styles.arrowUp} >
            <Ionicons name='arrow-up-outline' size={20} color={'rgba(0, 0, 0, 0.3)'} />
        </Pressable>
      </View>
  )
}

interface ChapterPageModeProps {  
  manga_title: string
  setReadMode: React.Dispatch<React.SetStateAction<"List" | "Page">>
}

const ChapterPageMode = ({  
  manga_title,
  setReadMode
}: ChapterPageModeProps) => {

  const db = useSQLiteContext()
  const { currentChapter, moveToNextChapter, moveToPreviousChapter  } = useReadingState()
  const [images, setImages] = useState<ChapterImage[]>([])
  const [currentImage, setCurrentImage] = useState<ChapterImage | null>(null)  
  const [loading, setLoading] = useState(false)

  const flashListRef = useRef<FlashList<ChapterImage>>(null)
  const imageIndex = useRef(0)
  const prefetchState = useRef<{url: string, fetched: boolean}[]>([])

  const scrollUp = () => {
    flashListRef.current?.scrollToOffset({animated: false, offset: 0})
  }  

  const goToNextChapter = async () => {
    scrollUp()
    moveToNextChapter()
  }

  const goToPreviousChapter = async () => {
    scrollUp()
    moveToPreviousChapter()
  }

  useEffect(
    () => {
      async function init() {
          if (currentChapter) {
            setLoading(true)
              await Image.clearMemoryCache()
              const imgs: ChapterImage[] = await spFetchChapterImages(currentChapter.chapter_id)

              setCurrentImage(imgs.length > 0 ? imgs[0] : null)
              imageIndex.current = 0
              prefetchState.current = imgs.map(i => {return {fetched: false, url: i.image_url}})
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
    [db, currentChapter]
  )

  const prefetch = () => {
    const start = imageIndex.current
    const end = start + 2
    for (let i = start; i < end && i < images.length; i++) {
      if (!prefetchState.current[i].fetched) {
        Image.prefetch(prefetchState.current[i].url)
      }
    }    
  }

  const moveToNextImage = () => {
    if (imageIndex.current + 1 < images.length ) {
      prefetch()
      imageIndex.current += 1
      setCurrentImage(images[imageIndex.current])
      Image.prefetch(images[imageIndex.current].image_url)
      if (imageIndex.current < images.length) {

      }
    }
  }

  const moveToPreviousImage = () => {
    if (imageIndex.current - 1 >= 0 && images.length > 0) {
      imageIndex.current -= 1
      setCurrentImage(images[imageIndex.current])
    }
  }

  return (
    <View style={{flex: 1}} >
      <View style={{paddingHorizontal: wp(5)}} >
        <TopBar title={manga_title} >
          <ReturnButton backgroundColor={Colors.black} />
        </TopBar>

        <View style={{width: '100%', flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginBottom: 20}} >
          <ChangeChapterComponent 
            loading={loading} 
            currentChapter={currentChapter!} 
            goToNextChapter={goToNextChapter} 
            goToPreviousChapter={goToPreviousChapter} />

          <ChangeChapterPageComponent
            currentPage={imageIndex.current}
            goToNextPage={moveToNextImage}
            goToPreviousPage={moveToPreviousImage}
          />  
        </View>

      </View>

      {
        currentImage &&
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
          <InteractiveImage 
            imageUri={currentImage.image_url }
            imageWidth={currentImage.width}
            imageHeight={currentImage.height}
            containerWidth={wp(100)}
            containerHeight={hp(80)}
          />
        </View>
      }      
    </View>
  )
}


const ChapterPage = ({viewMode = "List"} : ChapterProps) => {
  
  const params: {manga_title: string} = useLocalSearchParams()
  const manga_title: string = params.manga_title as any
  
  const [readMode, setReadMode] = useState(viewMode)
  
  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0, backgroundColor: Colors.black}]} >
      {
        readMode === 'List' ? 
        <ChapterListMode manga_title={manga_title} setReadMode={setReadMode} /> :
        <ChapterPageMode manga_title={manga_title} setReadMode={setReadMode} />
      }
    </SafeAreaView>
  )
}

export default ChapterPage

const styles = StyleSheet.create({
  arrowUp: {
    position: 'absolute', 
    bottom: 60, 
    right: 12, 
    padding: 6, 
    borderRadius: 32, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },    
  arrowDown: {
      position: 'absolute', 
      bottom: 20, 
      right: 60, 
      padding: 6, 
      borderRadius: 32, 
      backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
})