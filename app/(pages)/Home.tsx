import Button from '@/components/buttons/Button'
import RandomMangaButton from '@/components/buttons/RandomMangaButton'
import UpdateDatabase from '@/components/buttons/UpdateDatabase'
import GenreGrid from '@/components/grid/GenreGrid'
import LatestUpdatesGrid from '@/components/grid/LatestUpdates'
import MostViewGrid from '@/components/grid/MostViewsGrid'
import RandomMangaGrid from '@/components/grid/RandomMangaGrid'
import LateralMenu from '@/components/LateralMenu'
import Logo from '@/components/util/Logo'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { hp, wp } from '@/helpers/util'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React, { useRef } from 'react'
import { Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'


const MENU_WIDTH = wp(70)
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
            <Row style={{marginBottom: 20, justifyContent: "space-between"}} >
                <Logo/>
                <Row style={{gap: 16}} >
                    <UpdateDatabase iconColor={Colors.white} type='client' />
                    <Button iconName='search-outline' onPress={searchPress} iconColor={Colors.white} />
                    <RandomMangaButton color={Colors.white} size={28} />
                    <Button iconName='options-outline' onPress={toggleMenu} iconColor={Colors.white} />
                </Row>
            </Row>

            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={{gap: 20}} >
                    <GenreGrid/>
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