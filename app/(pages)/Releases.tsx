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

    const openUrl = async (url: string) => {
        try {
            await Linking.openURL(url)
        } catch (error) {
          Toast.show({text1: "Could not open link", type: 'error'})
        }
    };

    const renderItem = ({item}: {item: AppRelease}) => {
        return (
            <Pressable onPress={() => openUrl(item.url)} style={styles.item}>
                <Row style={{width: '100%', justifyContent: "space-between"}} >
                    <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]} >{item.version}</Text>
                    <Ionicons name='download-outline' size={28} color={Colors.backgroundColor} />
                </Row>            
                {item.descr && <Text style={AppStyle.textRegular}>{item.descr}</Text>}            
            </Pressable>
        )
    }

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
                renderItem={renderItem}
            />
        </SafeAreaView>
    )
}

export default Releases

const styles = StyleSheet.create({
    item: {
        width: '100%', 
        padding: 10,        
        borderRadius: 4, 
        backgroundColor: Colors.releasesColor, 
        marginBottom: 20
    }
})