import ReturnButton from '@/components/buttons/ReturnButton'
import MangaGrid from '@/components/grid/MangaGrid'
import TopBar from '@/components/TopBar'
import { Manga } from '@/helpers/types'
import { dbReadMangasOrderedByUpdateAt } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native'


const PAGE_LIMIT = 30


const LatestUpdatesPage = () => {

  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(
    () => {
      async function init() {
        if (mangas.length === 0) {
          setLoading(true)
          await dbReadMangasOrderedByUpdateAt(db, 0, PAGE_LIMIT)
            .then(values => setMangas(values))
          setLoading(false)
      }
        isInitialized.current = true
      }
      init()
    },
    [db, mangas]
  )

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      await dbReadMangasOrderedByUpdateAt(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
        .then(values => {
          hasResults.current = values.length > 0
          setMangas(prev => [...prev, ...values])
        })
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Latest Updates' >
        <ReturnButton/>
      </TopBar>
      <MangaGrid
        mangas={mangas}
        loading={loading}
        numColumns={2}
        estimatedItemSize={400}
        hasResults={true}
        showChaptersPreview={true}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
        listMode='FlashList'
      />
    </SafeAreaView>
  )
}

export default LatestUpdatesPage
