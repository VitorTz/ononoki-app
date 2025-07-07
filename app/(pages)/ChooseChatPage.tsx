import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { OnonokiUser } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { spGetFriends } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'


const ChooseChat = () => {

  const { user } = useAuthState()
  const [friends, setFriends] = useState<OnonokiUser[]>([])
  const [loading, setLoading] = useState(false)

  const init = async () => {
      console.log("init")
      setLoading(true)
        await spGetFriends(user!.user_id).then(v => setFriends(v))
      setLoading(false)
  }

  // useEffect(
  //   () => {
  //     const init = async () => {
  //       setLoading(true)
  //         await spGetFriends(user!.user_id).then(v => setFriends(v))
  //       setLoading(false)
  //     }
  //     init()
  //   },
  //   []
  // )

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  const openUsersPage = () => {
    router.navigate("/UsersPage")
  }
  

  const renderItem = ({item}: {item: OnonokiUser}) => {
    return (
      <Pressable style={{
        width: '100%', 
        gap: 20, 
        paddingVertical: 10, 
        flexDirection: 'row', 
        alignItems: "center", 
        justifyContent: "flex-start", 
        marginBottom: 10
      }} >
        <Image source={item.profile_image_url} style={{width: 64, height: 64, borderRadius: 4}} />
        <Text style={AppStyle.textRegular}>{item.username}</Text>
      </Pressable>
    )
  }

  const renderFooter = () => {

    if (loading) {
      return (
        <ActivityIndicator size={28} color={Colors.chatColor} />
      )
    }
    return <></>
  }

  const onEndReached = async () => {
    
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Select Friend' titleColor={Colors.chatColor} >
        <ReturnButton color={Colors.chatColor} />
      </TopBar>
      <View style={{flex: 1, gap: 16}} >
        <Pressable onPress={openUsersPage} style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", backgroundColor: Colors.chatColor, borderRadius: 4, height: 52, gap: 20}} >          
          <Text style={[AppStyle.textRegular, {fontSize: 22, color: Colors.backgroundColor}]}>New friend</Text>
          <Ionicons name='person-add' size={28} />
        </Pressable>
        
        <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
          <Text style={[AppStyle.textHeader, {color: Colors.chatColor}]} >
            Friends
          </Text>
          <Text style={[AppStyle.textHeader, {color: Colors.chatColor}]} >
            {friends.length}
          </Text>
        </View>

        <FlashList
          data={friends}
          keyExtractor={(item) => item.user_id}
          renderItem={renderItem}
          estimatedItemSize={200}
          ListFooterComponent={renderFooter}
          drawDistance={hp(100)}
          onEndReached={onEndReached}
          scrollEventThrottle={4}
          onEndReachedThreshold={2}/>

      </View>
    </SafeAreaView>
  )
}

export default ChooseChat

const styles = StyleSheet.create({})