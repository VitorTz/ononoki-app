import AppVersion from '@/components/AppVersion'
import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { AppRelease } from '@/helpers/types'
import { dbGetAllReleases } from '@/lib/database'
import { useAppVersionState } from '@/store/appReleaseState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Linking, Pressable, SafeAreaView, StyleSheet, Text } from 'react-native'
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
        <Pressable onPress={openUrl} style={styles.item}>
            <Row style={{justifyContent: "space-between"}} >
                <Text style={[AppStyle.textHeader, {color: Colors.releasesColor}]} >{release.version}</Text>
                <Ionicons name='download-outline' size={28} color={Colors.releasesColor} />
            </Row>            
            {release.descr && <Text style={AppStyle.textRegular}>{release.descr}</Text>}            
        </Pressable>
    )
}

const Releases = () => {

    const db = useSQLiteContext()
    const { allReleases, setAllReleases } = useAppVersionState()
    const [loading, setLoading] = useState(false)

    useEffect(
        () => {
            async function init() {
                if (allReleases.length > 0) { return }
                setLoading(true)
                    await dbGetAllReleases(db)
                        .then(values => setAllReleases(values))
                        .catch(e => {console.log(e); setAllReleases([])})
                setLoading(false)
            }
            init()
        },
        [db, allReleases]
    )

    if (loading) {
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Releases' titleColor={Colors.releasesColor} >
                <ReturnButton color={Colors.releasesColor} />
            </TopBar>
            <AppVersion/>
            <ActivityIndicator size={32} color={Colors.releasesColor} />
        </SafeAreaView>
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Releases' titleColor={Colors.releasesColor} >
                <ReturnButton color={Colors.releasesColor} />
            </TopBar>
            <AppVersion/>
            <FlatList
                data={allReleases}
                keyExtractor={(item) => item.release_id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => <ReleaseItem release={item}/>}
            />
        </SafeAreaView>
    )
}

export default Releases

const styles = StyleSheet.create({
    item: {
        width: '100%', 
        padding: 10, 
        paddingVertical: 12, 
        borderRadius: 4, 
        backgroundColor: Colors.gray, 
        marginBottom: 20
    }
})