import ReturnButton from '@/components/buttons/ReturnButton'
import MangaGrid from '@/components/grid/MangaGrid'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { Manga } from '@/helpers/types'
import { hp, wp } from '@/helpers/util'
import { spFetchMangasByCollection } from '@/lib/supabase'
import { useCollectionState } from '@/store/collectionsState'
import { AppStyle } from '@/styles/AppStyle'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'


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
                <TopBar title={'Collection'} titleColor={Colors.ononokiBlue} >
                    <ReturnButton color={Colors.ononokiBlue}/>
                </TopBar>
            </SafeAreaView>
        )
    }    

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false} >
                <TopBar title={currentCollection.title} titleColor={Colors.ononokiBlue}  >
                    <ReturnButton color={Colors.ononokiBlue} />
                </TopBar>                    
                    <View style={{gap: 20}} >
                        {
                            currentCollection.descr &&
                            <Text style={[AppStyle.textRegular]} >
                                {currentCollection.descr}
                            </Text>
                        }
                        <MangaGrid 
                            mangas={mangas}
                            numColumns={2}
                            loading={loading}
                            estimatedItemSize={400}
                            hasResults={true}
                            listMode='FlashList'
                            shouldShowChapterDate={false}
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