import { Colors } from '@/constants/Colors';
import { dbClearTable, dbGetAppVersion, dbPopulateReadingStatusTable, dbShouldUpdate, dbUpdateDatabase } from '@/lib/database';
import { spFetchUser, spGetReleases, spGetSession, supabase } from '@/lib/supabase';
import { useAppVersionState } from '@/store/appReleaseState';
import { useAuthState } from '@/store/authState';
import { AppStyle } from '@/styles/AppStyle';
import {
    LeagueSpartan_100Thin,
    LeagueSpartan_200ExtraLight,
    LeagueSpartan_300Light,
    LeagueSpartan_400Regular,
    LeagueSpartan_500Medium,
    LeagueSpartan_600SemiBold,
    LeagueSpartan_700Bold,
    LeagueSpartan_800ExtraBold,
    LeagueSpartan_900Black,
    useFonts,
} from '@expo-google-fonts/league-spartan';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect } from 'react';
import { ActivityIndicator, AppState, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';


AppState.addEventListener(
    'change', (state) => {  
        if (state === 'active') {    
            supabase.auth.startAutoRefresh()  
        } else {    
            supabase.auth.stopAutoRefresh()
        }
    }
)


const App = () => {

    const db = useSQLiteContext()
    const { login, logout } = useAuthState()
    const { setLocalVersion, setAllReleases } = useAppVersionState()

    let [fontsLoaded] = useFonts({
        LeagueSpartan_100Thin,
        LeagueSpartan_200ExtraLight,
        LeagueSpartan_300Light,
        LeagueSpartan_400Regular,
        LeagueSpartan_500Medium,
        LeagueSpartan_600SemiBold,
        LeagueSpartan_700Bold,
        LeagueSpartan_800ExtraBold,
        LeagueSpartan_900Black,
    });

    const initSession = async () => {
        const session = await spGetSession()

        if (!session) { 
        await dbClearTable(db, 'reading_status')
        return 
        }

        const user = await spFetchUser(session.user.id)
        
        if (user) {
        login(user, session)
        } else {
        console.log("error fetching user", session.user.id)
        logout()
        }
        
        await dbPopulateReadingStatusTable(db, session.user.id)
    }

    useEffect(
        () => {
            async function init() {                
                Image.clearMemoryCache()

                const state: NetInfoState = await NetInfo.fetch()
                if (!state.isConnected) {
                    Toast.show({text1: 'Hey', text2: "You have no internet!", type: "info"})
                    router.replace("/(pages)/Home")
                    return
                }

                await dbGetAppVersion(db).then(value => setLocalVersion(value))
                spGetReleases().then(values => setAllReleases(values))
                await initSession()
                
                const shouldUpdate = await dbShouldUpdate(db, 'server')
                if (shouldUpdate) {
                    Toast.show({text1: "Updating local database", type: "info"})
                    await dbUpdateDatabase(db)
                }
            
                router.replace("/(pages)/Home")
            }
            init()
        },
        [fontsLoaded]
    )  


    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
                <ActivityIndicator size={48} color={Colors.white} />
            </View>
        </SafeAreaView>
    )
}

export default App
