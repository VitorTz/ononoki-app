import { Colors } from "@/constants/Colors"
import { Genre, Manga } from "@/helpers/types"
import { dbReadManhwaGenres } from "@/lib/database"
import { AppStyle } from "@/styles/AppStyle"
import { router } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { useEffect, useRef, useState } from "react"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"


interface MangaGenreInfoProps {
  manga: Manga
}

const MangaGenreInfo = ({manga}: MangaGenreInfoProps) => {

  const db = useSQLiteContext()
  const [genres, setGenres] = useState<Genre[]>([])

  const flatListRef = useRef<FlatList>(null)  

  useEffect(
    () => {
      async function init() {
        await dbReadManhwaGenres(db, manga!.manga_id).then(values => setGenres(values))
        flatListRef.current?.scrollToIndex({animated: false, index: 0})
      }
      init()
    }, 
    [db, manga]
  )

  const openGenrePage = (genre: Genre) => {
    router.navigate({
      pathname: '/(pages)/MangaByGenre', 
      params: {
        genre_id: genre.genre_id,
        genre: genre.genre
      }})
  }

  return (
    <View style={{width: '100%', flexWrap: 'wrap', flexDirection: 'row', gap: 10}} >
      <FlatList 
        ref={flatListRef}
        data={genres}
        keyExtractor={(item, index) => index.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => 
          <Pressable style={styles.item} onPress={() => openGenrePage(item)}>
            <Text style={[AppStyle.textRegular, {color: Colors.white}]} >{item.genre}</Text>
          </Pressable>
        }
      />
    </View>
  )

}

export 
default MangaGenreInfo;

const styles = StyleSheet.create({
    item: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: Colors.gray,
        marginRight: 8,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center"
      }
})