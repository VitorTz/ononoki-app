import ReturnButton from '@/components/buttons/ReturnButton'
import MangaGrid from '@/components/grid/MangaGrid'
import TopBar from '@/components/TopBar'
import { Manga } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { spFetchMangasByCollection } from '@/lib/supabase'
import { useCollectionState } from '@/store/collectionsState'
import { AppStyle } from '@/styles/AppStyle'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'


const MAX_IMAGE_WIDTH = wp(90)


const MangaCollection = () => {

    const { currentCollection } = useCollectionState()
    const [mangas, setMangas] = useState<Manga[]>([])
    const [loading, setLoading] = useState(false)
    
    useEffect(
        () => {
            const init = async () => {
                if (!currentCollection) { return }
                setLoading(true)
                await spFetchMangasByCollection(currentCollection.collection_id)
                    .then(values => setMangas([...values]))
                setLoading(false)
            }
            init()
        },
        []
    )
    
    if (!currentCollection) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title={'Collection'} >
                    <ReturnButton/>
                </TopBar>
            </SafeAreaView>
        )
    }
    
    const imageWidth = currentCollection.cover_image_width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH : currentCollection.cover_image_width
    const imageHeight = imageWidth * (currentCollection.cover_image_height / currentCollection.cover_image_width)    

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false} >
                
                <TopBar title={currentCollection.title} >
                    <ReturnButton/>    
                </TopBar>                    
                    
                    <View style={{gap: 20}} >                        
                        <Text style={[AppStyle.textRegular, {fontSize: hp(2.4)}]} >
                            {currentCollection.descr}
                        </Text>
                        <MangaGrid 
                            mangas={mangas}
                            numColumns={2}
                            loading={loading}
                            estimatedItemSize={400}
                            hasResults={true}
                            listMode='FlashList'
                            showChaptersPreview={false}
                        />
                    </View>
         
            </ScrollView>
        </SafeAreaView>
    )
}

export default MangaCollection

const styles = StyleSheet.create({
    topBar: {
    width: '100%',     
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "space-between", 
    
    paddingHorizontal: wp(5),
    paddingVertical: hp(4),
    paddingBottom: 20
  },
  linearBackground: {
    position: 'absolute',
    width: wp(100),
    left: 0,    
    top: 0,
    height: hp(120)
  },
})