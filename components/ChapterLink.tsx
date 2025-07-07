import { Colors } from '@/constants/Colors'
import { Chapter, Manga } from '@/helpers/types'
import { formatTimestamp } from '@/helpers/util'
import { spFetchChapterList, spUpdateMangaViews } from '@/lib/supabase'
import { useChapterState } from '@/store/chapterState'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
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

    const { setChapterState } = useChapterState()

    const [loading, setLoading] = useState(false)

    const onPress = async () => {
        setLoading(true)
            const chapters: Chapter[] = await spFetchChapterList(manga.manga_id)
            setChapterState(chapters, chapter.chapter_num - 1)
            spUpdateMangaViews(manga.manga_id)
        setLoading(false)        
        router.navigate({
            pathname: "/(pages)/Chapter",
            params: {mangaTitle: manga.title}
        })
    }

    if (loading) {
        return (
            <View style={[styles.chapterLink, style]} >
                <ActivityIndicator size={20} color={Colors.white} />
            </View>    
        )
    }

    return (
        <Pressable onPress={onPress} style={[styles.chapterLink, style]} >
            <Text style={AppStyle.textRegular}>{prefix}{chapter.chapter_name}</Text>
            {
                shouldShowChapterDate &&
                <Text style={[AppStyle.textRegular, {paddingRight: 20}]}>
                    {formatTimestamp(chapter.created_at)}
                </Text>
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