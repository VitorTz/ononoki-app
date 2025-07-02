import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { Chapter, Manga } from '@/helpers/types';
import { dbReadLast3Chapters } from '@/lib/database';
import { AppStyle } from '@/styles/AppStyle';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle
} from 'react-native';
import ChapterLink from '../ChapterLink';
import MangaStatusComponent from '../MangaStatusComponent';



interface MangaCoverProps {
    manga: Manga
    width?: number
    height?: number
    marginRight?: number
    marginBottom?: number
    styleProp?: StyleProp<ViewStyle>
    showChaptersPreview?: boolean
    shouldShowChapterDate?: boolean
}


const MangaCard = ({
    manga, 
    width = AppConstants.ManhwaCoverDimension.width, 
    height = AppConstants.ManhwaCoverDimension.height, 
    marginRight = 10,
    marginBottom = 0,
    styleProp = false,
    showChaptersPreview = true,
    shouldShowChapterDate = true    
}: MangaCoverProps) => {
    
    const db = useSQLiteContext()
    const [chapters, setChapters] = useState<Chapter[]>([])
    
    const mangaStatusColor = manga.status === "Completed" ? 
        Colors.ononokiGreen : 
        Colors.neonRed
    
    const onPress = () => {
        router.push({
            pathname: '/(pages)/Manga', 
            params: {manga_id: manga.manga_id}
        })
    }
    
    useEffect(
        () => {
            async function init() {
                if (!showChaptersPreview) {
                    return
                }
                await dbReadLast3Chapters(db, manga.manga_id)
                    .then(values => setChapters(values))
            }
            init()
        },
        [db, manga, showChaptersPreview]
    )

    return (
        <Pressable style={[{width, marginRight, marginBottom}, styleProp]} onPress={onPress} >
            <Image 
                source={manga.cover_image_url} 
                contentFit='cover'
                cachePolicy={'disk'}
                style={[{borderRadius: 4, width, height}]}/>
            <View style={styles.container} >
                <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 20}]}>{manga.title}</Text>
                {
                    showChaptersPreview && 
                    chapters.map(
                        (item) => 
                            <ChapterLink 
                                shouldShowChapterDate={shouldShowChapterDate} 
                                key={item.chapter_num} 
                                manga={manga} 
                                chapter={item} />
                )}
            </View>
            <MangaStatusComponent
                style={{position: 'absolute', left: 8, top: 8, borderRadius: 12}}
                status={manga.status}
                paddingHorizontal={10}
                paddingVertical={8}
                fontSize={12}
                backgroundColor={mangaStatusColor}
                borderRadius={22}
            />
        </Pressable>
    )
}

export default MangaCard

const styles = StyleSheet.create({    
    container: {
        paddingVertical: 10,  
        width: '100%',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4        
    }
})