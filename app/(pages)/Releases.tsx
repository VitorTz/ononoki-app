import { ActivityIndicator, Linking, Pressable, SafeAreaView, Text, View } from 'react-native'

import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { AppRelease } from '@/helpers/types'
import { dbGetAllReleases } from '@/lib/database'
import { useAppVersionState } from '@/store/appReleaseState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'


const ReleaseItem = ({release}: {release: AppRelease}) => {

    const openUrl = async () => {
        try {
            await Linking.openURL(release.url)
        } catch (error) {
          Toast.show({text1: "Could not open link", type: 'error'})
        }
    };

    return (
        <Pressable onPress={openUrl} style={{width: '100%', padding: 10, paddingVertical: 12, borderRadius: 4, backgroundColor: Colors.gray}}>
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <Text style={[AppStyle.textHeader, {color: Colors.releasesColor}]} >{release.version}</Text>
                <Ionicons name='download-outline' size={28} color={Colors.releasesColor} />
            </View>            
            {release.descr && <Text style={AppStyle.textRegular}>{release.descr}</Text>}            
        </Pressable>
    )
}

const Releases = () => {

    const db = useSQLiteContext()
    const { localVersion, allReleases, setAllReleases } = useAppVersionState()
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            async function init() {
                if (allReleases.length > 0) { return }
                setLoading(true)
                await dbGetAllReleases(db).then(values => setAllReleases(values))
                setLoading(false)
            }
            init()
        },
        [db, allReleases]
    )

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Releases' titleColor={Colors.releasesColor} >
                <ReturnButton color={Colors.releasesColor} />
            </TopBar>
            {
                localVersion && <Text style={[AppStyle.textRegular, {marginBottom: 10}]} >Your app version: {localVersion}</Text>
            }
            {
                loading ?

                <ActivityIndicator size={32} color={Colors.releasesColor} />

                :

                <View style={{width: '100%', gap: 20, alignItems: "center", justifyContent: 'center'}} >
                    {
                        allReleases.map((item, index) => <ReleaseItem release={item} key={index} />)
                    }
                </View>
            }            
        </SafeAreaView>
    )
}

export default Releases