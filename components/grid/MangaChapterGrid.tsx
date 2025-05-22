import { Colors } from "@/constants/Colors"
import { Chapter, Manga } from '@/helpers/types'
import { dbGetMangaReadChapters } from '@/lib/database'
import { spFetchChapterList } from "@/lib/supabase"
import { useReadingState } from "@/store/mangaReadingState"
import { AppStyle } from "@/styles/AppStyle"
import { router } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"


interface ChapterItemProps {
  isReaded: boolean
  manhwa_title: string
  chapter: Chapter  
}


const ChapterItem = ({
  isReaded, 
  manhwa_title, 
  chapter  
}: ChapterItemProps) => {

  const { setChapterNum } = useReadingState()  

  const onPress = () => {
    setChapterNum(chapter.chapter_num)
    router.navigate({pathname: "/(pages)/Chapter", params: {manhwa_title}})
  }

  const bColor = isReaded ? Colors.white : Colors.gray
  const tColor = isReaded ? Colors.backgroundColor : Colors.white

  return (
    <Pressable       
      onPress={onPress}
      style={[styles.chapterItem, {backgroundColor: bColor}]} >
        <Text style={[AppStyle.textRegular, {color: tColor, fontSize: 14}]}>{chapter.chapter_num}</Text>
    </Pressable>
  )
}


interface MangaChapterListProps {
  manga: Manga
  textColor?: string
}


const MangaChapterGrid = ({
  manga, 
  textColor = Colors.backgroundColor
}: MangaChapterListProps) => {
  
  const db = useSQLiteContext()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(false)
  const { setChapterNum, setChapterMap } = useReadingState()
  
  const chapterAlreadyReaded = useRef<Set<number>>(new Set())
  
  useEffect(
    () => {
      async function init() {
        setLoading(true)
        dbGetMangaReadChapters(db, manga.manga_id).then(s => chapterAlreadyReaded.current = s)
            .then(
            v => {
            spFetchChapterList(manga.manga_id)
                .then(values => {
                setChapterMap(new Map(values.map(i => [i.chapter_num, i])))
                setChapters(values)
                setLoading(false)
                }).catch(error => console.log("error spFetchChapterList", error))
            }
        ) 
      }
      init()
    },
    [db, manga.manga_id, setChapterMap]
  )

  const readFirst = () => {
    if (chapters.length > 0) {
      setChapterNum(chapters[0].chapter_num)
      router.navigate({pathname: "/(pages)/Chapter", params: {manhwa_title: manga.title}})
    }
  }

  const readLast = () => {
    if (chapters.length > 0) {
      setChapterNum(chapters[chapters.length - 1].chapter_num)
      router.navigate({pathname: "/(pages)/Chapter", params: {manhwa_title: manga.title}})
    }
  }
  
  return (
    <View style={{width: '100%', gap: 10, flexWrap: 'wrap', flexDirection: 'row', alignItems: "center", justifyContent: "center"}} >
      {
        loading ?
          <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
            <ActivityIndicator size={'large'} color={Colors.white} />
          </View>
            :
          <View style={{width: '100%', gap: 20}} >
            <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center"}} >
              <Pressable onPress={readFirst} style={{flex: 1, backgroundColor: manga.color, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                <Text style={[AppStyle.textRegular, {color: textColor}]}>Read First</Text>
              </Pressable>
              <Pressable onPress={readLast} style={{flex: 1, backgroundColor: manga.color, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                <Text style={[AppStyle.textRegular, {color: textColor}]}>Read Last</Text>
              </Pressable>
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: "center", justifyContent: "center"}} >
              {
                chapters.map((item, index) => 
                  <ChapterItem                    
                    isReaded={chapterAlreadyReaded.current.has(item.chapter_num)}
                    manhwa_title={manga.title} 
                    key={item.chapter_id} 
                    chapter={item}/>
                )
              }
            </View>
          </View>
      }
    </View>
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