import Button from '@/components/buttons/Button'
import RandomMangaButton from '@/components/buttons/RandomMangaButton'
import UpdateDatabase from '@/components/buttons/UpdateDatabase'
import GenreGrid from '@/components/grid/GenreGrid'
import LatestUpdatesGrid from '@/components/grid/LatestUpdates'
import MostViewGrid from '@/components/grid/MostViewsGrid'
import RandomMangaGrid from '@/components/grid/RandomMangaGrid'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'



const Home = () => {

    const searchPress = () => {
        Toast.show({
            text1: "Date",
            type: "info"
        })
    }

    const toggleMenu = () => {

    }    

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <View style={{width: '100%', 
                flexDirection: 'row', 
                marginTop: 20, 
                marginBottom: 10, 
                alignItems: "center", 
                justifyContent: "space-between"}} >
                <Text style={[AppStyle.textHeader, {fontSize: 30, color: Colors.ononokiBlue}]}>Ononoki</Text>                
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 16}} >
                    <UpdateDatabase iconColor={Colors.ononokiGreen} />
                    <Button iconName='search-outline' onPress={searchPress} iconColor={Colors.ononokiGreen} />
                    <RandomMangaButton color={Colors.ononokiGreen} size={28} />
                    <Button iconName='options-outline' onPress={toggleMenu} iconColor={Colors.ononokiGreen} />
                </View>
            </View>

            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={{gap: 20}} >
                    <GenreGrid/>
                    <LatestUpdatesGrid/>
                    <MostViewGrid/>
                    <RandomMangaGrid/>
                    <View style={{width: '100%', height: 60}} />
                </View>
            </ScrollView>

        </SafeAreaView>
    )
}


export default Home
