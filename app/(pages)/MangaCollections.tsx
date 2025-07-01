import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import { Colors } from '@/constants/Colors'
import { MangaCollection } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { spFetchMangaCollections } from '@/lib/supabase'
import { useCollectionState } from '@/store/collectionsState'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text } from 'react-native'


const MangaCollections = () => {

    const { collections, setCollections, setCurrentCollection } = useCollectionState()

    useEffect(
        () => {
            const init = async () => {
                if (collections.length > 10) { return }
                await spFetchMangaCollections(0, null)
                    .then(values => setCollections([...values]))
            }
            init()
        },
        []
    )

    const onItemPress = (item: MangaCollection) => {
        setCurrentCollection(item)
        router.navigate("/(pages)/MangaCollection")
      }

    const size = wp(45)
    
    const renderItem = ({item}: {item: MangaCollection}) => {
    
        return (
          <Pressable 
            onPress={() => onItemPress(item)} 
            style={{alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: item.color, padding: 10, borderRadius: 12, marginBottom: 10}} >
            <Image source={item.cover_image_url} style={{width: size, height: size, borderRadius: size, borderWidth: 4, borderColor: Colors.backgroundColor}} contentFit='cover' />
            <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: hp(2.4), color: Colors.backgroundColor}]} >{item.title}</Text>        
          </Pressable>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title='Collections' >
                <ReturnButton/>        
            </TopBar>
            <FlashList
                data={collections}
                keyExtractor={(item) => item.collection_id.toString()}
                renderItem={renderItem}
            />
        </SafeAreaView>
    )
}

export default MangaCollections

const styles = StyleSheet.create({})