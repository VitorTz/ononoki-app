import { Colors } from '@/constants/Colors'
import { Chapter, Manga } from '@/helpers/types'
import { formatTimestamp } from '@/helpers/util'
import { spFetchChapterList, spUpdateMangaViews } from '@/lib/supabase'
import { useReadingState } from '@/store/mangaReadingState'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    ViewStyle
} from 'react-native'


interface ChapterLinkProps {
    manga: Manga
    chapter: Chapter
    shouldShowChapterDate?: boolean    
    prefix?: string    
    style?: StyleProp<ViewStyle>
}

const ChapterLink = ({
    manga, 
    chapter,
    shouldShowChapterDate = true,    
    prefix = 'Chapter ',
    style
}: ChapterLinkProps) => {

    const { setChapterMap, setChapterNum } = useReadingState()
    const [loading, setLoading] = useState(false)
    const isActive = useRef(false)

    const onPress = async () => {
        if (isActive.current) { return }
        isActive.current = true
        setLoading(true)
        spUpdateMangaViews(manga.manga_id)
        await spFetchChapterList(manga.manga_id)
            .then(values => setChapterMap(new Map(values.map(i => [i.chapter_num, i]))))
        setChapterNum(chapter.chapter_num)
        setLoading(false)
        isActive.current = false
        router.navigate({
            pathname: "/(pages)/Chapter", 
            params: {manga_title: manga.title}
        })
    }

    return (
        <Pressable onPress={onPress} style={[styles.chapterLink, style]} >
            {
                loading ? 
                <ActivityIndicator size={20} color={Colors.white} /> :
                <>
                    <Text style={AppStyle.textRegular}>{prefix}{chapter.chapter_name}</Text>
                    {
                        shouldShowChapterDate && 
                        <Text style={[
                            AppStyle.textRegular, 
                            {paddingRight: 20}
                        ]}>{formatTimestamp(chapter.created_at)}</Text>
                    }
                </>
            }
        </Pressable>
    )
}

export default ChapterLink

const styles = StyleSheet.create({
    chapterLink: {
        paddingVertical: 8,        
        borderRadius: 4,
        backgroundColor: Colors.backgroundColor,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20
    }
})