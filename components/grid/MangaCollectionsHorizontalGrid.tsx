import { Colors } from '@/constants/Colors'
import { MangaCollection } from '@/helpers/types'
import { spFetchMangaCollections, spUpdateCollectionViews } from '@/lib/supabase'
import { useCollectionState } from '@/store/collectionsState'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'




const MangaCollectionsHorizontalGrid = () => {

  const { collections, setCollections, setCurrentCollection } = useCollectionState()  

  useEffect(
    () => {
      const init = async () => {
        if (collections.length == 0) {
            await spFetchMangaCollections(0, 10)
              .then(values => setCollections(values))
        }    
      }
      init()
    },
    []
  )


  const onViewAllPress = () => {
    router.navigate("/MangaCollections")
  }

  const onItemPress = (item: MangaCollection) => {
    setCurrentCollection(item)
    spUpdateCollectionViews(item.collection_id)
    router.navigate("/(pages)/MangaCollection")
  }

  const renderItem = ({item}: {item: MangaCollection | "Header"}) => {
    if (item === 'Header') {
      return (
        <Pressable 
          onPress={onViewAllPress} 
          style={styles.item} >
          <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >All Collections</Text>        
        </Pressable>  
      )
    }
    return (
      <Pressable 
        onPress={() => onItemPress(item)} 
        style={styles.item} >
        <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >{item.title}</Text>        
      </Pressable>
    )
  }

  const COLEC = [...['Header'], ...collections]

  return (
    <View style={{width: '100%', gap: 20}} >
      <View style={{width: '100%'}}>
        <FlatList
          data={[...['Header'], ...collections].slice(0, 11) as any}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
          onEndReachedThreshold={2}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
        />
      </View>
      
    </View>
  )
}

export default MangaCollectionsHorizontalGrid

const styles = StyleSheet.create({
  item: {
    alignItems: "center", 
    justifyContent: "center", 
    flexDirection: 'row', 
    gap: 10, 
    marginRight: 10, 
    backgroundColor: Colors.ononokiBlue, 
    paddingHorizontal: 10, 
    paddingVertical: 12,
    borderRadius: 4
  }
})