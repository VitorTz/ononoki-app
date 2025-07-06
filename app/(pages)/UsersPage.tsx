import Button from '@/components/buttons/Button'
import ReturnButton from '@/components/buttons/ReturnButton'
import SearchBar from '@/components/SearchBar'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import { Colors } from '@/constants/Colors'
import { OnonokiUser } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { spCreateFriend, spDeleteFriend, spFetchUsers, spGetUserFriends } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { useProfileState } from '@/store/profileState'
import { useUserFriendState } from '@/store/userFriendState'
import { AppStyle } from '@/styles/AppStyle'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { debounce } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'


const PAGE_LIMIT = 30

const UsersPage = () => {

    const { user } = useAuthState()
    const [users, setUsers] = useState<OnonokiUser[]>([])
    const { friends, setFriends } = useUserFriendState()
    const { setProfile } = useProfileState()
    const [loading, setLoading] = useState(false)
    
    const searchTerm = useRef('')
    const isInitialized = useRef(false)
    const hasResults = useRef(true)
    const page = useRef(0)

    const fetchFriends = async () => {
        if (friends.size != 0 || !user || !user.user_id) {
            return
        }
        await spGetUserFriends(user.user_id)
            .then(v => setFriends(new Set(v)))
            .catch(e => console.log(e))        
    }

    const fetchUsers = async () => {
        await spFetchUsers(user ? user.user_id! : null, null, 0, PAGE_LIMIT)
            .then(values => {
                hasResults.current = values.length == PAGE_LIMIT;
                setUsers(values)
            })
            .catch(e => {console.log(e); setUsers([])})
    }
    
    useEffect(
        () => {
            const init = async () => {
                if (isInitialized.current) { return }
                setLoading(true)
                await fetchFriends()
                await fetchUsers()
                setLoading(false)
                isInitialized.current = true
            }
            init()
        },
        []
    )

    const openProfile = (profile: OnonokiUser) => {
        setProfile(profile)
        router.navigate("/ProfilePage")
    }

    const mail = () => {

    }

    const addOrRemoveFriend = async (friend: OnonokiUser) => {
        if (!user || !user.user_id) {
            Toast.show({text1: "You are not logged", type: "error"})
            return
        }
        
        const s = new Set(friends)
        if (friends.has(friend.user_id)) {
            await spDeleteFriend(user.user_id, friend.user_id)
            s.delete(friend.user_id)
        } else {
            await spCreateFriend(user.user_id, friend.user_id)
            s.add(friend.user_id)
        }
        setFriends(s)
    }

    const renderItem = ({item}: {item: OnonokiUser}) => {

        const iconName = friends.has(item.user_id) ?
            'person-remove' :
            'person-add'
        
        return (
            <Pressable style={styles.item} onPress={() => openProfile(item)} >
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                    <Image source={item.profile_image_url} style={{width: 128, height: 128, borderRadius: 4}} />
                    <Text style={[AppStyle.textHeader, {fontSize: 22}]} >{item.username}</Text>
                </View>
                <Column style={{gap: 20, alignItems: "center"}} >
                    <Button iconName='mail' onPress={mail} iconColor={Colors.peopleColor} />
                    <Button iconName={iconName} onPress={() => addOrRemoveFriend(item)} iconColor={Colors.peopleColor} />
                </Column>
            </Pressable>
        )
    }

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
        )
            .then(values => {
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
                <ReturnButton color={Colors.peopleColor} />
            </TopBar>
            <SearchBar onChangeValue={debounceSearch} style={{marginBottom: 20}} color={Colors.peopleColor} />
            <FlashList
                keyboardShouldPersistTaps={'always'}
                data={users}                
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={renderItem}
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