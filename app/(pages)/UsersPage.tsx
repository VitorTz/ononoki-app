import Button from '@/components/buttons/Button'
import HomeButton from '@/components/buttons/HomeButton'
import ReturnButton from '@/components/buttons/ReturnButton'
import SearchBar from '@/components/SearchBar'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import { Colors } from '@/constants/Colors'
import { OnonokiUser } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { dbCreateFriend, dbDeleteFriend, dbUserHasFriend } from '@/lib/database'
import { spCreateFriend, spDeleteFriend, spFetchUsers } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { useProfileState } from '@/store/profileState'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { debounce } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'


const PAGE_LIMIT = 30


const FriendComponent = ({user_id, friend}: {user_id: string | null, friend: OnonokiUser}) => {

    const db = useSQLiteContext()
    const { setProfile } = useProfileState()
    const [isFriend, setIsFriend] = useState(false)

    const iconName = isFriend ?
        'person-remove' :
        'person-add'

    useEffect(
        () => {
            const init = async () => {
                if (!user_id) { return }
                console.log("init", friend.username)
                await dbUserHasFriend(db, friend.user_id)
                    .then(v => setIsFriend(v))
                    .catch(e => {console.log(e); setIsFriend(false)})
            }
            init()
        },
        [db, friend]
    )

    const mail = () => {

    }

    const addOrRemoveFriend = async (friend: OnonokiUser) => {
        if (!user_id) {
            Toast.show({text1: "You are not logged!", type: "error"})
            return
        }
        const isFriend = await dbUserHasFriend(db, friend.user_id)
        if (isFriend) {
            await spDeleteFriend(user_id, friend.user_id)
            await dbDeleteFriend(db, friend.user_id)
        } else {
            await spCreateFriend(user_id, friend.user_id)
            await dbCreateFriend(db, friend)
        }
        setIsFriend(prev => !prev)
    }

    const openProfile = (profile: OnonokiUser) => {
        setProfile(profile)
        router.navigate("/ProfilePage")
    }

    return (
        <Pressable style={styles.item} onPress={() => openProfile(friend)} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                <Image source={friend.profile_image_url} style={{width: 128, height: 128, borderRadius: 4}} />
                <Text style={[AppStyle.textHeader, {fontSize: 22}]} >{friend.username}</Text>
            </View>
            <Column style={{gap: 20, alignItems: "center"}} >
                <Button iconName='mail' onPress={mail} iconColor={Colors.peopleColor} />
                <Button 
                    iconName={iconName} 
                    onPress={() => addOrRemoveFriend(friend)} 
                    iconColor={Colors.peopleColor} />
            </Column>
        </Pressable>
    )
}


const UsersPage = () => {
    
    const { user } = useAuthState()    
    const [users, setUsers] = useState<OnonokiUser[]>([])
    const [loading, setLoading] = useState(false)
        
    const searchTerm = useRef('')
    const isInitialized = useRef(false)
    const hasResults = useRef(true)
    const page = useRef(0)

    const fetchUsers = async () => {
        await spFetchUsers(user ? user.user_id : null, null, 0, PAGE_LIMIT)
            .then(values => {
                hasResults.current = values.length == PAGE_LIMIT;
                setUsers(values)
            })
            .catch(e => {console.log("error UersPage.fetchUserse", e); setUsers([])})
    }
    
    useEffect(
        () => {
            const init = async () => {
                if (isInitialized.current) { return }
                setLoading(true)
                    await fetchUsers()
                setLoading(false)
                isInitialized.current = true
            }
            init()
        },
        []
    )


    const renderFooter = () => {

        if (loading) {
            return (
                <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                    <ActivityIndicator size={32} color={Colors.peopleColor} />
                </View>
            )
        }

        return (
            <View style={{height: 80}} />
        )        
    }

    const handleSearch = async (value: string) => {
        searchTerm.current = value.trim()
        page.current = 0
        setLoading(true)
            await spFetchUsers(
                user ? user.user_id! : null, 
                searchTerm.current === '' ? null : searchTerm.current, 
                page.current * PAGE_LIMIT,
                PAGE_LIMIT
            ).then(values => {
              hasResults.current = values.length === PAGE_LIMIT
              setUsers([...values])
            })
        setLoading(false)
    }
    
    const debounceSearch = debounce(handleSearch, 400)

    const onEndReached = async () => {
        if (!hasResults.current || !isInitialized.current) {
          return
        }
        page.current += 1
        setLoading(true)
        await spFetchUsers(
            user ? user.user_id! : null, 
            searchTerm.current === '' ? null : searchTerm.current,
            page.current * PAGE_LIMIT, 
            PAGE_LIMIT
        )
          .then(values => {
            hasResults.current = values.length > 0
            setUsers(prev => [...prev, ...values])
          })
        setLoading(false)
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Users' titleColor={Colors.peopleColor} >
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                    <HomeButton color={Colors.peopleColor} />
                    <ReturnButton color={Colors.peopleColor} />
                </View>
            </TopBar>
            <SearchBar onChangeValue={debounceSearch} style={{marginBottom: 20}} color={Colors.peopleColor} />
            <FlashList
                keyboardShouldPersistTaps={'always'}
                data={users}                
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={({item}) => <FriendComponent user_id={user ? user.user_id : null} friend={item} />}
                estimatedItemSize={200}
                drawDistance={hp(100)}
                onEndReached={onEndReached}
                scrollEventThrottle={4}
                onEndReachedThreshold={2}
                ListFooterComponent={renderFooter}
            />
        </SafeAreaView>
    )
}

export default UsersPage

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        width: '100%',
        alignItems: "center",
        marginBottom: 20, 
        justifyContent: "space-between", 
        backgroundColor: Colors.gray, 
        padding: 10, 
        paddingHorizontal: 16, 
        borderRadius: 4
    }
})