import ReturnButton from '@/components/buttons/ReturnButton'
import MangaGrid from '@/components/grid/MangaGrid'
import ReadingStatusPicker from '@/components/picker/ReadingStatusPicker'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manga } from '@/helpers/types'
import { dbGetMangasByReadingStatus } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView, View } from 'react-native'


const PAGE_LIMIT = 30


const Library = () => {

  const db = useSQLiteContext()
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(false)
  const status = useRef('Reading')
  const page = useRef(0)
  const hasResults = useRef(true)

  const init = async () => {
    setLoading(true)
    await dbGetMangasByReadingStatus(db, status.current)
      .then(values => setMangas(values))
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  const onChangeValue = async (value: string | null) => {
    if (!value) { return }
    setLoading(true)
    status.current = value
    page.current = 0
    await dbGetMangasByReadingStatus(db, value)
      .then(values => {
        hasResults.current = values.length > 0
        setMangas(values)
      })
    setLoading(false)
  }

  const onEndReached = async () => {
    if (!hasResults.current) { return }
    page.current += 1
    await dbGetMangasByReadingStatus(
      db,
      status.current,
      page.current * PAGE_LIMIT,
      PAGE_LIMIT
    ).then(values => {
      hasResults.current = values.length > 0
      setMangas(prev => [...prev, ...values])
    })
  }

  return (
    <SafeAreaView style={AppStyle.safeArea}>
        <TopBar title='Library' titleColor={Colors.libraryColor} >
          <ReturnButton color={Colors.libraryColor} />
        </TopBar>
        <View style={{flex: 1, gap: 10}} >
          <ReadingStatusPicker onChangeValue={onChangeValue}/>
          <MangaGrid
            mangas={mangas}
            loading={loading}          
            numColumns={2}
            estimatedItemSize={400}
            hasResults={true}
            showChaptersPreview={false}
            onEndReached={onEndReached}
            listMode='FlashList'
            activityIndicatorColor={Colors.libraryColor}
          />
        </View>
    </SafeAreaView>
  )
}

export default Library
