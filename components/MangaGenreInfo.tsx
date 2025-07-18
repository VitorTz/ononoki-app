import { Colors } from "@/constants/Colors"
import { Genre, Manga } from "@/helpers/types"
import { dbReadManhwaGenres } from "@/lib/database"
import { AppStyle } from "@/styles/AppStyle"
import { useRouter } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { useEffect, useRef, useState } from "react"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"


interface MangaGenreInfoProps {
  manga: Manga
}


const MangaGenreInfo = ({manga}: MangaGenreInfoProps) => {

  const db = useSQLiteContext()
  const router = useRouter()
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
    router.push({
      pathname: '/(pages)/MangaByGenre', 
      params: {
        genre_id: genre.genre_id,
        genre: genre.genre
      }})
  }

  const renderItem = ({item}: {item: Genre}) => {
    return (
      <Pressable style={styles.item} onPress={() => openGenrePage(item)}>
        <Text style={[AppStyle.textRegular, {color: Colors.white}]} >{item.genre}</Text>
      </Pressable>
    )
  }

  return (
    <View style={styles.container} >
      <FlatList 
        ref={flatListRef}
        data={genres}
        keyExtractor={(item) => item.genre_id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
    </View>
  )
}

export 
default MangaGenreInfo;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
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