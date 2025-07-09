import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import { Colors } from '@/constants/Colors'
import { Genre } from '@/helpers/types'
import { dbReadGenres } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'


const AllGenres = () => {

    const db = useSQLiteContext()
    const [genres, setGenres] = useState<Genre[]>([])

    useEffect(
        () => {
            const init = async () => {
                const g: Genre[] = await dbReadGenres(db)
                setGenres([...g])
            }
            init()
        },
        [db]
    )

    const onGenrePress = async (genre: Genre) => {
        router.navigate({
            pathname: '/(pages)/MangaByGenre', 
            params: {
                genre: genre.genre,
                genre_id: genre.genre_id
            }
        })
    }
    
    const renderItem = ({item, index}: {item: Genre, index: number}) => {
        return (
            <Pressable
                onPress={() => onGenrePress(item)}
                style={[styles.item, {marginRight: index % 2 == 0 ? '4%' : 0}]} >
                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >{item.genre}</Text>
            </Pressable>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title="Genres" titleColor={Colors.ononokiBlue} >
                <ReturnButton color={Colors.ononokiBlue} />
            </TopBar>
            <FlatList
                data={genres}
                initialNumToRender={30}
                keyExtractor={(item) => item.genre_id.toString()}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                renderItem={renderItem}
                ListFooterComponent={<View style={{height: 62}} />}
            />
        </SafeAreaView>
    )
}

export default AllGenres

const styles = StyleSheet.create({
    item: {
        width: '48%',
        height: 52,
        alignItems: "center", 
        justifyContent: "center",         
        backgroundColor: Colors.ononokiBlue, 
        borderRadius: 4,
        marginBottom: 10
    }
})