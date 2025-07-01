import { Colors } from '@/constants/Colors'
import { Genre } from '@/helpers/types'
import { dbReadGenres } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Title from '../Title'


const GenreGrid = () => {

    const db = useSQLiteContext()
    const [genres, setGenres] = useState<Genre[]>([])
    
    useEffect(
        () => {
            async function init() {
                await dbReadGenres(db).then(values => setGenres(values))
            }
            init()
        },
        [db]
    )

    const onPress = (genre: Genre) => {
        router.navigate({
            pathname: '/(pages)/MangaByGenre', 
            params: {
                genre: genre.genre,
                genre_id: genre.genre_id
            }
        })
    }

    return (
        <View style={styles.container} >
            <Title title='Genres' />            
            <FlatList
                data={genres}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                renderItem={({item, index}) => 
                    <Pressable onPress={() => onPress(item)} style={styles.button} >
                        <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{item.genre}</Text>
                    </Pressable>
                }
            />
        </View>
    )
}

export default GenreGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 20,
        alignItems: "flex-start"
    },
    button: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        backgroundColor: Colors.ononokiBlue,
        marginRight: 10
    }
})