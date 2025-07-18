import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import { Colors } from '@/constants/Colors'
import { MangaCollection } from '@/helpers/types'
import { spFetchMangaCollections, spUpdateCollectionViews } from '@/lib/supabase'
import { useCollectionState } from '@/store/collectionsState'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
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
        spUpdateCollectionViews(item.collection_id)
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
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title='Collections' titleColor={Colors.ononokiBlue} >
                <ReturnButton color={Colors.ononokiBlue} />
            </TopBar>
            <FlashList
                data={collections}
                keyExtractor={(item) => item.collection_id.toString()}
                renderItem={renderItem}
                estimatedItemSize={200}
            />
        </SafeAreaView>
    )
}

export default MangaCollections

const styles = StyleSheet.create({
    item: {
        alignItems: "center", 
        justifyContent: "center", 
        gap: 10, 
        backgroundColor: Colors.ononokiBlue, 
        paddingHorizontal: 10,
        paddingVertical: 20, 
        borderRadius: 4, 
        marginBottom: 10
    }
})