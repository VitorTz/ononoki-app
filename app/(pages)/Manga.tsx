import AddToLibray from '@/components/AddToLibrary';
import BugReportButton from '@/components/buttons/BugReportButton';
import HomeButton from '@/components/buttons/HomeButton';
import RandomMangaButton from '@/components/buttons/RandomMangaButton';
import ReturnButton from '@/components/buttons/ReturnButton';
import MangaChapterGrid from '@/components/grid/MangaChapterGrid';
import MangaAuthorInfo from '@/components/MangaAuthorInfo';
import MangaGenreInfo from '@/components/MangaGenreInfo';
import { Colors } from '@/constants/Colors';
import { Manga } from '@/helpers/types';
import { hp, isColorDark, wp } from '@/helpers/util';
import { dbReadMangaById, dbUpdateMangaViews } from '@/lib/database';
import { spUpdateMangaViews } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, {
  useEffect,
  useRef,
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
// import ManhwaCommentSection from '@/components/ManhwaCommentSection';


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
  const [manga, setManga] = useState<Manga | null>()
  const manga_id: number = parseInt(params.manga_id as any)  
  const iconColor = useRef(Colors.white)
  const textColor = useRef(Colors.backgroundColor)

  useEffect(
    () => {
      async function init() {
        await dbReadMangaById(db, manga_id)
          .then(value => {
            if (value) {
              if (isColorDark(value.color)) {
                textColor.current = Colors.white
                iconColor.current = Colors.white
              } else {
                textColor.current = Colors.backgroundColor
                iconColor.current = value.color
              }
              setManga(value)
            } else {
              Toast.show({text1: "Error", text2: "invalid manga", type: "error"})
              router.replace("/(pages)/Home")
              return
            }
        })  
        spUpdateMangaViews(manga_id)
        dbUpdateMangaViews(db, manga_id)      
      }
      init()

    },
    [db, manga_id]
  )  

  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0}]} >
      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} >
        {
          manga ?
          <>
            {/* Header */}
            <LinearGradient 
                colors={[manga.color, Colors.backgroundColor]}
                style={styles.linearBackground} />
            <View style={styles.topBar} >
                <HomeButton color={iconColor.current} />
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                    <BugReportButton color={iconColor.current} title={manga.title} />                    
                    <RandomMangaButton color={iconColor.current} />
                    <ReturnButton color={iconColor.current} />
                </View>
            </View>

            {/* Manhwa Info */}
            <View style={styles.manhwaContainer}>
                
                <Image
                  source={manga.cover_image_url}
                  cachePolicy={'disk'}
                  contentFit='cover'
                  style={styles.image} />
                <View style={{alignSelf: "flex-start"}} >
                  <Text style={AppStyle.textManhwaTitle}>{manga!.title}</Text>
                  <Text style={AppStyle.textRegular}>{manga.descr}</Text>
                </View>
                
                <MangaAuthorInfo manga_id={manga_id} />
                <MangaGenreInfo manga_id={manga_id} />
                <AddToLibray manhwa_id={manga_id} textColor={textColor.current} backgroundColor={manga.color} />

                <View style={{flexDirection: 'row', width: '100%', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
                  <Item text={manga.status} textColor={textColor.current} backgroundColor={manga.color} />
                  <Item text={`Views: ${manga.views}`} textColor={textColor.current} backgroundColor={manga.color} />
                </View>

                <MangaChapterGrid textColor={textColor.current} manga={manga} />
                {/* <ManhwaCommentSection manhwa={manhwa} /> */}
            </View>
          </>

          :
          
          <View style={{flex: 1, height: hp(100), alignItems: "center", justifyContent: "center"}} >
              <ActivityIndicator size={'large'} color={Colors.white} />
          </View>
        }

      </ScrollView>
    </SafeAreaView>
  )
}

export default MangaPage

const styles = StyleSheet.create({
  linearBackground: {
    position: 'absolute',
    width: wp(100),
    left: 0,    
    top: 0,
    height: hp(90)
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
    marginVertical: 10, 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: wp(5)
  },
  manhwaContainer: {
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