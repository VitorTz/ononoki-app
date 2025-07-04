import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { hp, wp } from '@/helpers/util'
import { dbClearTable } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'
import CloseBtn from './buttons/CloseButton'
import NewAppVersionButton from './buttons/NewAppVersionButton'



const ICON_SIZE = 26


interface OptionProps {
    onPress: () => void
    iconColor?: string
    title: string
    iconName: string
}


const Option = ({onPress, title, iconName, iconColor = Colors.white}: OptionProps) => {

    const [loading, setLoading] = useState(false)

    const p = async () => {
        setLoading(true)
        await onPress()
        setLoading(false)
    }

    return (
        <Pressable 
            onPress={p} 
            style={styles.link} 
            hitSlop={AppConstants.hitSlop} >
            <View style={{padding: 5, backgroundColor: iconColor, borderRadius: 4}} >
                {
                    loading ?
                        <ActivityIndicator size={ICON_SIZE} color={Colors.backgroundColor} /> :
                        <Ionicons name={iconName as any} size={ICON_SIZE} color={Colors.backgroundColor} />
                }
            </View>
            <Text style={[[AppStyle.textRegular, {fontSize: 16}]]}>{title}</Text>
        </Pressable>
    )
}


interface LateralMenuProps {
    closeMenu: () => any
}

const LateralMenu = ({closeMenu}: LateralMenuProps) => {
    
    const db = useSQLiteContext()
    const router = useRouter()
    const { session, logout } = useAuthState()
    
    const accountPage = () => {
        router.navigate("/(pages)/Account")
    }

    const usersPage = () => {
        router.navigate("/(pages)/UsersPage")
    }

    const loginPage = () => {
        router.navigate("/(auth)/SignIn")
    }

    const readingHistoryPage = () => {
        router.navigate("/(pages)/ReadHistory")
    }

    const libraryPage = () => {
        router.navigate("/(pages)/Library")
    }

    const openDonate = () => {
        router.navigate("/(pages)/Donate")
    }

    const openBugReport = () => {
        router.navigate("/(pages)/BugReport")
    }

    const openDisclaimer = () => {
        router.navigate("/(pages)/Disclaimer")
    }

    const handleLogout = async () => {
        await supabase.auth.signOut().catch(e => console.log(e))
        await dbClearTable(db, 'reading_status')
        logout()
        try {
            while (router.canGoBack()) {
                router.back();
            }
        } catch (e) {
            console.log(e)
        }
        router.replace("/(pages)/Home")
    }

    const openMangaRequest = () => {
        router.navigate("/(pages)/MangaRequest")
    }

    const openReleases = () => {
        router.navigate("/(pages)/Releases")
    }

    return (
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
            <View style={styles.container} >
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginBottom: 10}} >
                    <Text style={[AppStyle.textHeader, {color: Colors.ononokiBlue, fontFamily: "LeagueSpartan_600SemiBold"}]}>Menu</Text>
                    <CloseBtn onPress={closeMenu} style={{padding: 2}} color={Colors.ononokiBlue} />
                </View>
            
                {
                    session ? 
                    <Option 
                        onPress={accountPage} 
                        title='Account' 
                        iconName='person-outline'
                        iconColor={Colors.accountColor}
                    />
                        :
                    <Option 
                        onPress={loginPage} 
                        title='SignIn/SignUp'
                        iconName='log-in'
                        iconColor={Colors.accountColor}
                    />
                }

                <Option 
                    onPress={usersPage} 
                    title='Users' 
                    iconName='people-outline'
                    iconColor={Colors.peopleColor}
                />

                <Option 
                    onPress={libraryPage} 
                    title='Library' 
                    iconName='library-outline'
                    iconColor={Colors.libraryColor}
                />
                
                <Option 
                    onPress={readingHistoryPage} 
                    title='Reading History' 
                    iconName='calendar-number-outline'
                    iconColor={Colors.readingHistoryColor}
                />

                <Option 
                    onPress={openDonate} 
                    title='Donate' 
                    iconName='cash-outline'
                    iconColor={Colors.donateColor}
                />

                <Option 
                    onPress={openMangaRequest} 
                    title='Request Manga'
                    iconName='megaphone-outline'
                    iconColor={Colors.requestMangaColor}
                />

                <Option 
                    onPress={openReleases} 
                    title='Releases' 
                    iconName='git-branch-outline'
                    iconColor={Colors.releasesColor}
                />

                <Option 
                    onPress={openBugReport} 
                    title='Bug Report' 
                    iconName='bug-outline'
                    iconColor={Colors.BugReportColor}
                />

                <Option 
                    onPress={openDisclaimer} 
                    title='Disclaimer' 
                    iconName='newspaper-outline'
                    iconColor={Colors.disclaimerColor}
                />                

                {
                    session &&
                    <Option 
                        onPress={handleLogout} 
                        title='Logout' 
                        iconName='log-out-outline'
                        iconColor={Colors.neonRed}
                    />
                }

                <View style={{alignSelf: "flex-start"}} >
                    <NewAppVersionButton/>
                </View>

            </View>            
        </ScrollView>
    )
}

export default LateralMenu

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 20,
        paddingHorizontal: wp(4),
        paddingTop: hp(4),       
        marginTop: 6, 
        marginBottom: 10 
    },
    link: {
        width: '100%',
        gap: 16,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start"
    }
})