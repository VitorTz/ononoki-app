import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
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
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, AppState, SafeAreaView, View } from 'react-native';


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

    const init = async () => {
        router.replace("/(pages)/Home")
    }

    useEffect(
        () => {
            if (fontsLoaded) { init() }
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
