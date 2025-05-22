import ReturnButton from '@/components/buttons/ReturnButton'
import MangaGrid from '@/components/grid/MangaGrid'
import TopBar from '@/components/TopBar'
import { Manga } from '@/helpers/types'
import { dbReadMangasByAuthorId } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native'


const MangaByAuthor = () => {
  
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const author_id: number = parseInt(params.author_id as any)
    const author_name: string = params.author_name as any
    const author_role: string = params.author_role as any
    
    const [mangas, setMangas] = useState<Manga[]>([])
    const [loading, setLoading] = useState(false)
    
    useEffect(
        () => {
            async function init() {
                if (mangas.length === 0) {
                    setLoading(true)
                    await dbReadMangasByAuthorId(db, author_id)
                        .then(values => setMangas([...values]))
                    setLoading(false)
                }
            }
            init()
        },
        [db, mangas, author_id]
    )    

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={`${author_role}: ${author_name}`}>
                <ReturnButton/>
            </TopBar>
            <MangaGrid
                mangas={mangas}
                numColumns={2}
                loading={loading}
                hasResults={true}
                listMode='FlatList'
                showChaptersPreview={false}/>
        </SafeAreaView>
  )
}


export default MangaByAuthor
