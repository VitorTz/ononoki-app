import AddToLibray from '@/components/AddToLibrary';
import BugReportButton from '@/components/buttons/BugReportButton';
import HomeButton from '@/components/buttons/HomeButton';
import MALButton from '@/components/buttons/MalButton';
import OpenRandomMangaButton from '@/components/buttons/RandomMangaButton';
import ReturnButton from '@/components/buttons/ReturnButton';
import MangaChapterGrid from '@/components/grid/MangaChapterGrid';
import MangaAuthorInfo from '@/components/MangaAuthorInfo';
import MangaCommenctSection from '@/components/MangaCommentSection';
import MangaGenreInfo from '@/components/MangaGenreInfo';
import { Colors } from '@/constants/Colors';
import { Manga } from '@/helpers/types';
import { hp, wp } from '@/helpers/util';
import { dbReadMangaById, dbUpdateMangaViews } from '@/lib/database';
import { spUpdateMangaViews } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, {
  useEffect,
  useState
} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';


interface ItemProps {
  text: string
  backgroundColor: string
  textColor?: string
}

const Item = ({text, backgroundColor, textColor = Colors.backgroundColor}: ItemProps) => {
  return (
    <View style={[styles.item, {backgroundColor}]} >
      <Text style={[AppStyle.textRegular, {color: textColor}]}>{text}</Text>
    </View>
  )
}


const MangaPage = () => {

  const db = useSQLiteContext()
  const params = useLocalSearchParams()
  const manga_id: number = params.manga_id as any
  const [manga, setManga] = useState<Manga | null>(null)  

  useEffect(
    () => {
      async function init() {
        if (!manga_id) { 
          Toast.show({text1: "Error", text2: "invalid manga", type: "error"})
          router.replace("/(pages)/Home")
          return
        }
        const m: Manga | null = await dbReadMangaById(db, manga_id).catch(e => null)
        if (m === null) {
          Toast.show({text1: "Error", text2: "Invalid Manga", type: "error"})
          router.replace("/(pages)/Home")
          return
        }
        setManga(m)
        spUpdateMangaViews(manga_id)
        dbUpdateMangaViews(db, manga_id)
      }
      init()
    },
    [db, manga_id]
  )

  if (!manga) {
    return (
      <SafeAreaView style={[AppStyle.safeArea, styles.container]} >        
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
          <ActivityIndicator size={'large'} color={Colors.white} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, styles.container]} >
      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false} >
        {/* Header */}
        <LinearGradient 
            colors={[manga.color, Colors.backgroundColor]}
            style={styles.linearBackground} />
        <View style={styles.topBar} >
            <HomeButton color={manga.color} />
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 16}} >
                <MALButton mal_url={manga.mal_url} color={manga.color} />
                <BugReportButton color={manga.color} title={manga.title} />                    
                <OpenRandomMangaButton color={manga.color} />
                <ReturnButton color={manga.color} />
            </View>
        </View>

        {/* Manga Info */}
        <View style={styles.mangaContainer}>
            <View style={{width: '100%'}} >
              <Image
                source={manga.cover_image_url}
                cachePolicy={'disk'}
                contentFit='cover'
                style={styles.image} />
            </View>
            <View style={{alignSelf: "flex-start"}} >
              <Text style={AppStyle.textMangaTitle}>{manga!.title}</Text>
              <Text style={AppStyle.textRegular}>{manga.descr}</Text>
            </View>
            
            <MangaAuthorInfo manga={manga} />
            <MangaGenreInfo manga={manga} />
            <AddToLibray 
              manga={manga} 
              textColor={Colors.backgroundColor} 
              backgroundColor={manga.color} />

            <View style={{flexDirection: 'row', width: '100%', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
              <Item text={manga.status} textColor={Colors.backgroundColor} backgroundColor={manga.color} />
              <Item text={`Views: ${manga.views + 1}`} textColor={Colors.backgroundColor} backgroundColor={manga.color} />
            </View>

            <MangaChapterGrid manga={manga} />
            <MangaCommenctSection manga={manga} />
        </View>          
      </ScrollView>
    </SafeAreaView>
  )
}

export default MangaPage

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, 
    paddingVertical: 0,
    paddingTop: 0
  },
  linearBackground: {
    position: 'absolute',
    width: wp(100),
    left: 0,    
    top: 0,
    height: hp(100)
  },
  item: {
    height: 52,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  topBar: {
    width: '100%',     
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginTop: 10,
    paddingHorizontal: wp(5),
    paddingVertical: hp(4),
    paddingBottom: 20
  },
  mangaContainer: {
    width: '100%', 
    gap: 10, 
    alignItems: "center", 
    paddingHorizontal: wp(4), 
    paddingBottom: hp(8)
  },
  image: {
    width: '100%',
    maxWidth: wp(92),
    height: 520, 
    borderRadius: 4
  }
})
