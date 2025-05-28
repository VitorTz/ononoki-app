import BugReportButton from '@/components/buttons/BugReportButton';
import ChangeChapterReadModeButton from '@/components/buttons/ChangeChapterReadModeButton';
import ReturnButton from '@/components/buttons/ReturnButton';
import InteractiveImage from '@/components/InteractiveImage';
import MangaImage from '@/components/MangaImage';
import TopBar from '@/components/TopBar';
import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { Chapter, ChapterImage } from '@/helpers/types';
import { getRelativeHeight, hp, wp } from '@/helpers/util';
import { dbSetAppInfo, dbUpsertReadingHistory } from '@/lib/database';
import { spFetchChapterImages } from '@/lib/supabase';
import { useChapterState } from '@/store/chapterState';
import { useReadModeState } from '@/store/readModeState';
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
  goToPreviousChapter: () => any,
  goToNextChapter: () => any
}

const ChangeChapterComponent = ({
  loading,
  goToPreviousChapter,
  goToNextChapter
}: ChangeChapterComponentProps) => {

  const { currentChapterIndex, chapters } = useChapterState()
  
  const currentChapter = chapters[currentChapterIndex]

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
          <Text style={[AppStyle.textRegular, {fontSize: 18}]}>{currentChapter.chapter_name}</Text>
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

interface ChapterHeaderProps {
  mangaTitle: string
  currentChapter: Chapter,
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterHeader = ({ 
  mangaTitle,
  currentChapter,
  loading, 
  goToPreviousChapter, 
  goToNextChapter
}: ChapterHeaderProps) => {

  const reportTitle = `${mangaTitle}/${currentChapter.chapter_name}`

  const exitChapter = async () => {
    Image.clearMemoryCache()
    router.back()
  }  

  return (
    <View style={{width: '100%', paddingHorizontal: wp(5), paddingVertical: 8}} >
      <TopBar title={mangaTitle} >
        <ReturnButton onPress={exitChapter} backgroundColor={Colors.black} />
      </TopBar>

      <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 20}} >
        
        {/* Chapter Controller Button */}
        <BugReportButton size={32} title={reportTitle} backgroundColor={Colors.black} padding={0} />
        <ChangeChapterComponent
            goToNextChapter={goToNextChapter}
            goToPreviousChapter={goToPreviousChapter}
            loading={loading}            
            />
        <ChangeChapterReadModeButton/>

      </View>
    </View>
  )
}


interface ChapterFooterProps {
  mangaTitle: string
  currentChapter: Chapter,
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterFooter = ({
  mangaTitle, 
  currentChapter,
  loading, 
  goToPreviousChapter, 
  goToNextChapter 
}: ChapterFooterProps) => {  

  const openBugReport = () => {    
    router.navigate({
      pathname: "/(pages)/BugReport",
      params: {title: `${mangaTitle!}/${currentChapter}`}
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
                <Text style={AppStyle.textHeader}>{currentChapter.chapter_name}</Text>
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



const ChapterListMode = ({mangaTitle}: {mangaTitle: string}) => {

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
                .then(values => setImages([...values]))
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


const ChapterPageMode = ({mangaTitle}: {mangaTitle: string}) => {

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
      <View style={{paddingHorizontal: wp(5), paddingVertical: 8}} >
        <TopBar title={mangaTitle!} >
          <ReturnButton backgroundColor={Colors.black} />
        </TopBar>

        <View style={{width: '100%', flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginBottom: 20}} >
          <ChangeChapterComponent 
            loading={loading} 
            goToNextChapter={goToNextChapter} 
            goToPreviousChapter={goToPreviousChapter}/>

          <ChangeChapterPageComponent
            currentPage={imageIndex.current}
            goToNextPage={moveToPreviousImage}
            goToPreviousPage={moveToNextImage}
            maxPage={images.length - 1}/>
          <ChangeChapterReadModeButton/>
        </View>

      </View>

      {
        currentImage &&
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
          <InteractiveImage
            swapLeft={moveToPreviousImage}
            swapRight={moveToNextImage}
            width={wp(100)}
            height={getRelativeHeight(wp(100), currentImage.width, currentImage.height)}
            imageUri={currentImage.image_url}
          />          
        </View>
      }      
    </View>
  )
}


const ChapterPage = () => {
    
  const db = useSQLiteContext()
  const { readMode } = useReadModeState()
  const params = useLocalSearchParams()  
  const mangaTitle: string = params.mangaTitle as any

  useEffect(
    () => {
      if (!readMode) { return }
      async function init() {
        await dbSetAppInfo(db, 'read_mode', readMode)
      }
      init()
    },
    [readMode]
  )

  return (
    <SafeAreaView style={[AppStyle.safeArea, {paddingHorizontal: 0, paddingVertical: 0, backgroundColor: Colors.black}]} >
      {
        readMode === 'List' ? 
        <ChapterListMode mangaTitle={mangaTitle} /> :
        <ChapterPageMode mangaTitle={mangaTitle} />
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