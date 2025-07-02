import { Colors } from '@/constants/Colors'
import { MangaCollection } from '@/helpers/types'
import { spFetchMangaCollections } from '@/lib/supabase'
import { useCollectionState } from '@/store/collectionsState'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'
import ViewAllButton from '../buttons/ViewAllButton'



const MangaCollectionsHorizontalGrid = () => {

  const { collections, setCollections, setCurrentCollection } = useCollectionState()  
  const [loading, setLoading] = useState(false)

  useEffect(
    () => {
      const init = async () => {
        if (collections.length == 0) {
          setLoading(true)
            await spFetchMangaCollections(0, 10)
              .then(values => setCollections([...values]))
          setLoading(false)
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
    router.navigate("/(pages)/MangaCollection")
  }

  const renderItem = ({item}: {item: MangaCollection}) => {
    return (
      <Pressable 
        onPress={() => onItemPress(item)} 
        style={styles.item} >
        <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >{item.title}</Text>        
      </Pressable>
    )
  }

  return (
    <View style={{width: '100%', gap: 20}} >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"}} >
          <Title title='Collections' iconName='folder-open-outline'/>
          {
            loading ?
            <ActivityIndicator size={28} color={'white'} />
            :
            <ViewAllButton onPress={onViewAllPress} />
          }
      </View>

      <View style={{width: '100%'}}>
        <FlatList
          data={collections.slice(0, 10)}
          keyExtractor={(item) => item.collection_id.toString()}
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