import { Colors } from "@/constants/Colors"
import { Manga, MangaAuthor } from "@/helpers/types"
import { dbReadMangaAuthors } from "@/lib/database"
import { AppStyle } from "@/styles/AppStyle"
import { useRouter } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { useEffect, useRef, useState } from "react"
import { FlatList, Pressable, StyleSheet, Text } from "react-native"
import Row from "./util/Row"


interface MangaAuthorInfoProps {
  manga: Manga
}

const MangaAuthorInfo = ({manga}: MangaAuthorInfoProps) => {
  
  const router = useRouter()
  const db = useSQLiteContext()  
  const [authors, setAuthors] = useState<MangaAuthor[]>([])
  const flatListRef = useRef<FlatList>(null)  
  
  useEffect(
    () => {
      async function init() {
        await dbReadMangaAuthors(db, manga!.manga_id).then(values => setAuthors(values))
        flatListRef.current?.scrollToIndex({animated: false, index: 0})
      }
      init()
    }, 
    [db, manga]
  )
  
  const openAuthorPage = (author: MangaAuthor) => {
    router.push({
      pathname: '/(pages)/MangaByAuthor',
      params: {
        author_id: author.author_id,
        author_name: author.name, 
        author_role: author.role
    }})
  }

  const renderItem = ({item}: {item: MangaAuthor}) => {
    return (
      <Pressable style={styles.item} onPress={() => openAuthorPage(item)}>
        <Text style={[AppStyle.textRegular, {color: Colors.white}]} >
          {item.role == "Author" ? "Story" : "Art"}: {item.name}
        </Text>
      </Pressable>
    )
  }

  return (
    <Row style={{width: '100%', flexWrap: 'wrap', gap: 10}} >
      <FlatList
        ref={flatListRef}
        data={authors}
        keyExtractor={(item) => item.author_id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
    </Row>
  )

}

export default MangaAuthorInfo;

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
