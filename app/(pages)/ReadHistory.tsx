import CButton from '@/components/buttons/CButton'
import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { Chapter, ChapterReadLog } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { dbGetUserReadHistory } from '@/lib/database'
import { spFetchChapterList } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'


const PAGE_LIMIT = 16
const ITEM_PAGE_LIMIT = 32


interface HistoryChapterItemProps {
  chapter_num: number
  backgroundColor: string
  textColor: string
  onPress: () => any
}


const HistoryChapterItem = ({chapter_num, backgroundColor, textColor, onPress}: HistoryChapterItemProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.historyChapterItem, {backgroundColor}]}>
      <Text style={[AppStyle.textRegular, {color: textColor}]} >{chapter_num}</Text>
    </Pressable>
  )
}

const HistoryItem = ({log}: {log: ChapterReadLog}) => {
  
  const { setChapterState } = useChapterState()
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const maxChapterPageNum = Math.floor(log.chapters.length / ITEM_PAGE_LIMIT)

  const onPress = async (chapter_num: number, manga_Id: number) => {
    setLoading(true)
      const chapters: Chapter[] = await spFetchChapterList(manga_Id)
      setChapterState(chapters, chapter_num - 1)
    setLoading(false)
    router.navigate({
      pathname: "/(pages)/Chapter", 
      params: {mangaTitle: log.title}}
    )
  } 

  const onImagePress = () => {
    router.navigate({
        pathname: '/(pages)/Manga', 
        params: {manga_id: log.manga_id}
    })
  }

  if (loading) {
    return (
      <View style={styles.itemContainer} >
        <Pressable onPress={onImagePress} style={{width: '100%'}} >
          <Image source={log.cover_image_url} contentFit='cover' style={styles.image}/>
        </Pressable>
        <View style={{gap: 10, width: '100%'}} >
            <View style={{paddingVertical: 20, alignItems: "center", justifyContent: "center"}} >
              <ActivityIndicator size={32} color={log.color} />
            </View>
        </View>
      </View>
    )
  }

  const moveToNextChapterPage = () => {
    setPage(prev => prev > maxChapterPageNum - 1 ? 0 : prev + 1)
  }

  const moveToPreviousChapterPage = () => {
    setPage(prev => prev === 0 ? prev = maxChapterPageNum : prev - 1)
  }

  return (
    <View style={styles.itemContainer} >
      <Pressable onPress={onImagePress} style={{width: '100%'}} >
        <Image 
          source={log.cover_image_url}
          contentFit='cover'
          style={styles.image}
          />
      </Pressable>
      <Row style={{width: '100%', height: 52, gap: 10}} >
        <View style={{flex: 1, height: 52, alignItems: "center", justifyContent: "center", backgroundColor: log.color, borderRadius: 4}} >
          <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>Total: {log.chapters.length}</Text>
        </View>
        <Row style={{flex: 1, gap: 10}} >
          <CButton 
          style={{flex: 1, height: 52, borderRadius: 4, backgroundColor: log.color}} 
          iconColor={Colors.backgroundColor}
          iconName="chevron-back-outline"
          onPress={moveToPreviousChapterPage}
          />
          <View style={{flex: 1, borderRadius: 4, height: 52, borderWidth: 1, borderColor: log.color, alignItems: "center", justifyContent: "center"}} >
            <Text style={[AppStyle.textRegular, {color: log.color}]}>{page + 1}</Text>
          </View>
          <CButton 
          style={{flex: 1, height: 52, borderRadius: 4, backgroundColor: log.color}} 
          iconColor={Colors.backgroundColor}
          iconName="chevron-forward-outline"
          onPress={moveToNextChapterPage}
          />
        </Row>
      </Row>
      <View style={styles.itemGrid} >
        {
          log.chapters.slice(ITEM_PAGE_LIMIT * page, (page + 1) * ITEM_PAGE_LIMIT).map(
            (chapter_num) => 
              <HistoryChapterItem 
                key={chapter_num}
                textColor={Colors.backgroundColor}
                backgroundColor={log.color}
                chapter_num={chapter_num} 
                onPress={() => onPress(chapter_num, log.manga_id)}
              />
          )
        }
      </View>
    </View>
  )
}

const ReadHistory = () => {

  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)
  
  const [logs, setLogs] = useState<ChapterReadLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(
    () => {
      const init = async () => {
        if (isInitialized.current) { return }
        isInitialized.current = true
        await dbGetUserReadHistory(db, 0, PAGE_LIMIT)
          .then(values => setLogs(values))
          .catch(e => {console.log(e); hasResults.current = false; setLogs([])})
      }
      init()
    },
    [db]
  )

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    setLoading(true)
      page.current += 1    
      await dbGetUserReadHistory(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
        .then(values => {
          hasResults.current = values.length > 0
          setLogs(prev => [...prev, ...values])
        })
        .catch(e => {console.log(e); hasResults.current = false;})
    setLoading(false)
  }

  const renderFooter = () => {
    if (!(loading && hasResults.current)) {
      return <View style={{height: 62}} />
    }

    return (
        <View style={styles.footer} >
          <ActivityIndicator size={32} color={Colors.white} />
        </View> 
    )
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Reading History' titleColor={Colors.readingHistoryColor} >
        <ReturnButton color={Colors.readingHistoryColor} />
      </TopBar>
      <FlashList
        data={logs} 
        estimatedItemSize={600}
        keyExtractor={(item) => item.manga_id.toString()}
        renderItem={({item}) => <HistoryItem log={item}/>} 
        onEndReached={onEndReached}
        drawDistance={hp(100)}
        scrollEventThrottle={4}
        onEndReachedThreshold={1}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  )
}

export default ReadHistory

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40
  },
  image: {
    width: '100%',
    maxWidth: wp(92),
    height: 520, 
    borderRadius: 4,
    alignSelf: "flex-start"
  },
  itemGrid: {
    gap: 10,
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    alignItems: "center", 
    justifyContent: "center"
  },
  historyChapterItem: {
    width: 48, 
    height: 48, 
    borderRadius: 4,     
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 8
  },
  footer: {
    width: '100%', 
    paddingVertical: 22, 
    alignItems: "center", 
    justifyContent: "center"
  }
})