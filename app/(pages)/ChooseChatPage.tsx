import HomeButton from '@/components/buttons/HomeButton'
import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { OnonokiUser } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { dbGetUserFriends } from '@/lib/database'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'


const ChooseChat = () => {

  const db = useSQLiteContext();
  const { user } = useAuthState()
  const [friends, setFriends] = useState<OnonokiUser[]>([])
  const [loading, setLoading] = useState(false)  

  const init = async () => {
      if (!user || !user.user_id) { return }
      console.log("init")
      setLoading(true)
        await dbGetUserFriends(db)
          .then(v => setFriends([...v]))
          .catch(e => {console.log(e); setFriends([])})
      setLoading(false)
  }

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
        gap: 10, 
        paddingVertical: 10, 
        flexDirection: 'row', 
        alignItems: "center", 
        backgroundColor: Colors.gray,
        paddingHorizontal: 10,
        borderRadius: 4,
        justifyContent: "flex-start", 
        marginBottom: 10
      }} >
        <Image source={item.profile_image_url} style={{width: 96, height: 96, borderRadius: 4}} />
        <Text numberOfLines={1} style={[AppStyle.textRegular, {maxWidth: '70%'}]}>{item.username}</Text>
      </Pressable>
    )
  }

  const renderFooter = () => {

    if (loading) {
      return (
        <View style={{width: '100%', height: 80, alignItems: "center", justifyContent: "center"}} >
          <ActivityIndicator size={28} color={Colors.chatColor} />
        </View>
      )
    }
    return <View style={{height: 80}} />
  }

  const onEndReached = async () => {
    
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Select Friend' titleColor={Colors.chatColor} >
        <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
          <HomeButton color={Colors.chatColor} />
          <ReturnButton color={Colors.chatColor} />
        </View>
      </TopBar>
      <View style={{flex: 1, gap: 16}} >
        <Pressable onPress={openUsersPage} style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", backgroundColor: Colors.chatColor, borderRadius: 4, height: 52, gap: 20}} >          
          <Text style={[AppStyle.textRegular, {fontSize: 22, color: Colors.backgroundColor}]}>New friend</Text>
          <Ionicons name='person-add' size={28} />
        </Pressable>
        
        <Text style={[AppStyle.textHeader, {color: Colors.chatColor}]} >
          Friends
        </Text>        

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