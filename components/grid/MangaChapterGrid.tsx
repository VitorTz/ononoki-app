import { Colors } from "@/constants/Colors"
import { Chapter, Manga } from '@/helpers/types'
import { dbGetMangaReadChapters } from '@/lib/database'
import { spFetchChapterList } from "@/lib/supabase"
import { useChapterState } from "@/store/chapterState"
import { AppStyle } from "@/styles/AppStyle"
import { router } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import CButton from "../buttons/CButton"


interface ChapterItemProps {
  isReaded: boolean
  mangaTitle: string
  chapter: Chapter  
}


const ChapterItem = ({
  isReaded, 
  mangaTitle, 
  chapter  
}: ChapterItemProps) => {

  const { setCurrentChapterIndex } = useChapterState()

  const onPress = () => {
    setCurrentChapterIndex(chapter.chapter_num - 1)
    router.navigate({
      pathname: "/(pages)/Chapter", 
      params: {mangaTitle: mangaTitle}
    })
  }

  const bColor = isReaded ? Colors.white : Colors.gray
  const tColor = isReaded ? Colors.backgroundColor : Colors.white

  return (
    <Pressable       
      onPress={onPress}
      style={[styles.chapterItem, {backgroundColor: bColor}]} >
        <Text style={[AppStyle.textRegular, {color: tColor, fontSize: 14}]}>{chapter.chapter_name}</Text>
    </Pressable>
  )
}


interface ChapterPageSelectorProps {
  textColor: string
  mangaColor: string
  currentPage: number
  numChapters: number
  moveToPreviousChapterPage: () => any
  moveToNextChapterPage: () => any
}

const ChapterPageSelector = ({
  textColor,
  mangaColor,  
  currentPage,
  moveToPreviousChapterPage,
  moveToNextChapterPage,
  numChapters
}: ChapterPageSelectorProps) => {


  return (
    <View style={{width: '100%', gap: 10, flexDirection: 'row'}} >
      <View style={{flex: 1, alignItems: "center", justifyContent: "center", height: 52, borderRadius: 4, backgroundColor: mangaColor}} >
          <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >Chapters: {numChapters}</Text>
      </View>
      <View style={{flex: 1, gap: 10, flexDirection: 'row'}} >
        <CButton 
          style={{flex: 1, height: 52, borderRadius: 4, backgroundColor: mangaColor}} 
          iconColor={textColor}
          iconName="chevron-back-outline"
          onPress={moveToPreviousChapterPage}
          />
        <View style={{flex: 1, alignItems: "center", justifyContent: "center", height: 52, borderRadius: 4, borderWidth: 1, borderColor: mangaColor}}>
          <Text style={AppStyle.textRegular}>{currentPage + 1}</Text>
        </View>
        <CButton 
          style={{flex: 1, height: 52, borderRadius: 4, backgroundColor: mangaColor}} 
          iconColor={textColor}
          iconName="chevron-forward-outline"
          onPress={moveToNextChapterPage}
          />
      </View>
    </View>
  )
}


interface MangaChapterListProps {
  manga: Manga
  textColor?: string
}


const PAGE_LIMIT = 96


const MangaChapterGrid = ({  
  manga,
  textColor = Colors.backgroundColor
}: MangaChapterListProps) => {
  
  const db = useSQLiteContext()
  const { chapters, setChapters, setCurrentChapterIndex } = useChapterState()

  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  
  const chaptersReadByUser = useRef<Set<number>>(new Set())
  const maxChapterPageNum = Math.floor(chapters.length / PAGE_LIMIT)
  
  useEffect(
    () => {
      async function init() {
        if (!manga) { return }
        setLoading(true)
        await dbGetMangaReadChapters(db, manga.manga_id)
          .then(s => chaptersReadByUser.current = s)
        await spFetchChapterList(manga.manga_id)
          .then(values => {
            setLoading(false)
            setChapters(values)
        }).catch(error => setLoading(false))
      }
      init()
    },
    [db, manga]
  )
  
  
  const readFirst = () => {
    if (chapters.length > 0) {
      setCurrentChapterIndex(0)
      router.navigate({
        pathname: "/(pages)/Chapter",
        params: {mangaTitle: manga.title}
      })
    }
  }

  const readLast = () => {
    if (chapters.length > 0) {
      setCurrentChapterIndex(chapters.length - 1)
      router.navigate({
        pathname: "/(pages)/Chapter",
        params: {mangaTitle: manga.title}
      })
    }
  }

  const moveToNextChapterPage = () => {
    setCurrentPage(prev => prev > maxChapterPageNum - 1 ? 0 : prev + 1)
  }

  const moveToPreviousChapterPage = () => {
    setCurrentPage(prev => prev === 0 ? prev = maxChapterPageNum : prev - 1)
  }
  
  return (
    <>
      {
        manga &&

        <View style={{width: '100%', gap: 10, flexWrap: 'wrap', flexDirection: 'row', alignItems: "center", justifyContent: "center"}} >
          {
            loading ?

              <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
                <ActivityIndicator size={'large'} color={Colors.white} />
              </View>

              :

              <View style={{width: '100%', gap: 10}} >
                <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center"}} >
                  <Pressable onPress={readFirst} style={{flex: 1, backgroundColor: manga!.color, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                    <Text style={[AppStyle.textRegular, {color: textColor}]}>Read First</Text>
                  </Pressable>
                  <Pressable onPress={readLast} style={{flex: 1, backgroundColor: manga!.color, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                    <Text style={[AppStyle.textRegular, {color: textColor}]}>Read Last</Text>
                  </Pressable>
                </View>

                  <ChapterPageSelector
                    currentPage={currentPage}
                    numChapters={chapters.length}
                    mangaColor={manga!.color}
                    textColor={textColor}              
                    moveToNextChapterPage={moveToNextChapterPage}
                    moveToPreviousChapterPage={moveToPreviousChapterPage}
                  />

                  <View style={{flex: 1, alignItems: "center", justifyContent: "center", gap: 10, flexDirection: 'row', flexWrap: 'wrap'}}>
                    {
                      chapters.slice(currentPage * PAGE_LIMIT, (currentPage + 1) * PAGE_LIMIT).map((item, index) => 
                        <ChapterItem
                          key={item.chapter_id}
                          chapter={item}
                          isReaded={chaptersReadByUser.current.has(item.chapter_id)}
                          mangaTitle={manga!.title}
                        />
                      )
                    }
                  </View>
              </View>
          }
        </View>
      }
    </>
  )
}

export default MangaChapterGrid;

const styles = StyleSheet.create({
  chapterItem: {    
    width: 42, 
    height: 42, 
    borderRadius: 4, 
    alignItems: "center", 
    justifyContent: "center"    
  }
})