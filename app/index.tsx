import AppLogo from '@/components/util/Logo';
import Row from '@/components/util/Row';
import { Colors } from '@/constants/Colors';
import { dbClearTable, dbGetAppVersion, dbPopulateReadingStatusTable, dbReadAppInfo, dbSetLastRefresh, dbShouldUpdate, dbUpdateDatabase } from '@/lib/database';
import { spFetchUser, spGetSession, supabase } from '@/lib/supabase';
import { useAppVersionState } from '@/store/appReleaseState';
import { useAuthState } from '@/store/authState';
import { useReadModeState } from '@/store/readModeState';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef } from 'react';
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
    const { setLocalVersion } = useAppVersionState()
    const { setMode } = useReadModeState()
    const alreadyInited = useRef(false)

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
            logout()
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
                if (alreadyInited.current) { return }
                alreadyInited.current = true
                Image.clearMemoryCache()

                const state: NetInfoState = await NetInfo.fetch()
                if (!state.isConnected) {
                    Toast.show({text1: 'Hey', text2: "You have no internet!", type: "info"})
                    router.replace("/(pages)/Home")
                    return
                }
                
                await dbGetAppVersion(db).then(value => setLocalVersion(value))

                await initSession()
                
                const readMode = await dbReadAppInfo(db, 'read_mode')
                if (readMode == 'List' || readMode == 'Page') {
                    setMode(readMode)
                }

                const shouldUpdate = await dbShouldUpdate(db, 'server')
                if (shouldUpdate) {
                    Toast.show({text1: "Synchronizing local database...", type: "info"})
                    await dbSetLastRefresh(db, 'client')
                    await dbUpdateDatabase(db)
                    Toast.show({text1: "Sync completed", type: "info"})
                }

                router.replace("/(pages)/Home")
            }
            init()
        },
        [fontsLoaded]
    )  

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <View style={{flexDirection: 'row', alignItems: "center", paddingRight: 2, marginTop: 10, marginBottom: 10, justifyContent: "space-between"}} >
                <AppLogo/>
                <Row style={{gap: 16}} >
                    <Ionicons name='sync' size={28} color={Colors.ononokiBlue} />
                    <Ionicons name='search' size={28} color={Colors.ononokiBlue} />
                    <Ionicons name='dice' size={28} color={Colors.ononokiBlue} />
                    <Ionicons name='options' size={28} color={Colors.ononokiBlue} />
                </Row>
            </View>
            <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
                <ActivityIndicator size={32} color={Colors.ononokiBlue} />
            </View>
        </SafeAreaView>
    )
}

export default App
