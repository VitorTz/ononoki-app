import Button from '@/components/buttons/Button'
import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { OnonokiUser } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { spFetchUsers } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native'


const UsersPage = () => {

    const { user } = useAuthState()
    const [users, setUsers] = useState<OnonokiUser[]>([])
    const [loading, setLoading] = useState(false)
    const page = useRef(0)

    useEffect(
        () => {
            const init = async () => {
                setLoading(true)
                await spFetchUsers(user ? user.user_id : null)
                    .then(values => setUsers(values))
                    .catch(e => {console.log(e); setUsers([])})
                setLoading(false)
            }
            init()
        },
        []
    )

    const mail = () => {

    }

    const addFriend = () => {

    }

    const renderItem = ({item}: {item: OnonokiUser}) => {
        return (
            <Row style={{marginBottom: 20, justifyContent: "space-between", backgroundColor: Colors.gray, padding: 10, paddingHorizontal: 20, borderRadius: 4}} >
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                    <Image source={item.profile_image_url} style={{width: 128, height: 128, borderRadius: 4}} />
                    <Text style={[AppStyle.textHeader, {fontSize: 22}]} >{item.username}</Text>
                </View>
                <Column style={{gap: 20, alignItems: "center"}} >
                    <Button iconName='mail' onPress={mail} iconColor={Colors.peopleColor} />
                    <Button iconName='person-add' onPress={addFriend} iconColor={Colors.peopleColor} />
                </Column>
            </Row>
        )
    }

    const onEndReached = () => {
        
    }

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Users' titleColor={Colors.peopleColor} >
                <ReturnButton color={Colors.peopleColor} />
            </TopBar>
            <ActivityIndicator size={32} color={Colors.peopleColor} />
        </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Users' titleColor={Colors.peopleColor} >
                <ReturnButton color={Colors.peopleColor} />
            </TopBar>
            <FlashList
                keyboardShouldPersistTaps={'always'}
                data={users}                
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={renderItem}
                estimatedItemSize={400}
                drawDistance={hp(100)}
                onEndReached={onEndReached}
                scrollEventThrottle={4}
                onEndReachedThreshold={2}/>
        </SafeAreaView>
    )
}

export default UsersPage

const styles = StyleSheet.create({})