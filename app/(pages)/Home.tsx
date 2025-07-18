import Button from '@/components/buttons/Button'
import OpenRandomMangaButton from '@/components/buttons/RandomMangaButton'
import UpdateDatabaseButton from '@/components/buttons/UpdateDatabase'
import GenreGrid from '@/components/grid/GenreGrid'
import LatestUpdatesGrid from '@/components/grid/LatestUpdates'
import MangaCollectionsHorizontalGrid from '@/components/grid/MangaCollectionsHorizontalGrid'
import MostViewGrid from '@/components/grid/MostViewsGrid'
import RandomMangaGrid from '@/components/grid/RandomMangaGrid'
import LateralMenu from '@/components/LateralMenu'
import AppLogo from '@/components/util/Logo'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { hp, wp } from '@/helpers/util'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useRef } from 'react'
import { Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'


const MENU_WIDTH = 250
const ANIMATION_TIME = 300
const SCREEN_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)


const Home = () => {

    const menuAnim = useRef(new Animated.Value(-MENU_WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current

    const menuVisible = useRef(false)

    const openMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: ANIMATION_TIME,      
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = true
        })
        Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: ANIMATION_TIME * 1.2,
            useNativeDriver: false
        }).start(() => {})
    }

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -MENU_WIDTH,
            duration: ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = false
        })
        Animated.timing(backgroundAnim, {
            toValue: -SCREEN_WIDTH,
            duration: ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {})
    }  

    const searchPress = () => {
        router.navigate("/(pages)/MangaSearch")
    }

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            
            {/* Header */}
            <View style={{flexDirection: 'row', alignItems: "center", paddingRight: 2, marginBottom: 10, justifyContent: "space-between"}} >
                <AppLogo/>
                <Row style={{width: '100%', gap: 16}} >
                    <UpdateDatabaseButton iconColor={Colors.ononokiBlue} type='client' />
                    <Button iconName='search-outline' onPress={searchPress} iconSize={28} iconColor={Colors.ononokiBlue} showLoading={false} />
                    <OpenRandomMangaButton color={Colors.ononokiBlue} size={28} backgroundColor='' />
                    <Button iconName='options-outline' onPress={toggleMenu} iconSize={28} iconColor={Colors.ononokiBlue} showLoading={false} />
                </Row>
            </View>

            {/* Main content */}
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={{gap: 10}} >
                    <GenreGrid/>
                    <MangaCollectionsHorizontalGrid/>                
                    <LatestUpdatesGrid/>
                    <MostViewGrid/>
                    <RandomMangaGrid/>
                    <View style={{width: '100%', height: 60}} />
                </View>
            </ScrollView>

            {/* Lateral Menu */}
            <Animated.View style={[styles.menuBackground, { width: SCREEN_WIDTH, transform: [{ translateX: backgroundAnim }] }]}>
                <Pressable onPress={closeMenu} style={{width: '100%', height: '100%'}} />
            </Animated.View>
            <Animated.View style={[styles.sideMenu, { width: MENU_WIDTH, transform: [{ translateX: menuAnim }] }]}>
                <LateralMenu closeMenu={closeMenu}/>
            </Animated.View>

        </SafeAreaView>
    )
}


export default Home


const styles = StyleSheet.create({
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,        
        backgroundColor: Colors.backgroundColor,
        elevation: 5,
        shadowColor: Colors.almostBlack,
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 5,    
        zIndex: 100
    },
    menuBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    }
})