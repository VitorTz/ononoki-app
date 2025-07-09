import ReturnButton from '@/components/buttons/ReturnButton'
import MangaGrid from '@/components/grid/MangaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manga } from '@/helpers/types'
import { dbReadMangasOrderedByViews } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'


const PAGE_LIMIT = 30


const MostView = () => {

  const db = useSQLiteContext()
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(false)
  
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  useEffect(
    () => {
      async function init() {
        await dbReadMangasOrderedByViews(db, 0, PAGE_LIMIT)
            .then(values => setMangas(values))
        isInitialized.current = true
      }
      init()
    },
    [db]
  )
  
  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) {
      return
    }
    page.current += 1
    setLoading(true)
    await dbReadMangasOrderedByViews(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
      .then(values => {
        hasResults.current = values.length > 0
        setMangas(prev => [...prev, ...values])
      })
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Most Views' titleColor={Colors.ononokiBlue} >
        <ReturnButton color={Colors.ononokiBlue} />
      </TopBar>
      <MangaGrid
        mangas={mangas}
        hasResults={true}
        loading={loading}
        numColumns={2}
        estimatedItemSize={400}
        showChaptersPreview={true}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
        listMode='FlashList'/>
    </SafeAreaView>
  )
  
}

export default MostView
