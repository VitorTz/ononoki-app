import ReturnButton from '@/components/buttons/ReturnButton'
import MangaGrid from '@/components/grid/MangaGrid'
import SearchBar from '@/components/SearchBar'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manga } from '@/helpers/types'
import { spSearchManga } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, View } from 'react-native'


const PAGE_LIMIT = 30


const SearchManhwa = () => {
  
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const [manhwas, setManhwas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(false)
  const searchTerm = useRef('')

  const init = useCallback(async () => {
    if (manhwas.length == 0) {
      setLoading(true)
      await spSearchManga(searchTerm.current, 0.30, 0, PAGE_LIMIT)
        .then(values => setManhwas(values))
      setLoading(false)
    }
    isInitialized.current = true
  }, [])
  
  useEffect(
    () => {
      init()
    },
    []
  )

  const handleSearch = async (value: string) => {
    searchTerm.current = value.trim()
    page.current = 0
    setLoading(true)
      await spSearchManga(searchTerm.current, 0.30, page.current * PAGE_LIMIT, PAGE_LIMIT)      
        .then(values => {
          hasResults.current = values.length > 0
          setManhwas([...values])
        })
    setLoading(false)
  }

  const debounceSearch = debounce(handleSearch, 400)

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      await spSearchManga(searchTerm.current, 0.30, page.current * PAGE_LIMIT, PAGE_LIMIT)
        .then(values => {
          hasResults.current = values.length > 0
          setManhwas(prev => [...prev, ...values])
        })
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Search' titleColor={Colors.ononokiBlue} > 
        <ReturnButton color={Colors.ononokiBlue} />
      </TopBar>
      <View style={{flex: 1, gap: 10}} >
        <SearchBar onChangeValue={debounceSearch} color={Colors.ononokiBlue} />
        <MangaGrid
          mangas={manhwas}
          loading={loading}
          estimatedItemSize={400}
          numColumns={2}
          hasResults={true}
          showChaptersPreview={false}          
          onEndReached={onEndReached}
          listMode='FlashList'
        />
      </View>
    </SafeAreaView>
  )
}

export default SearchManhwa
