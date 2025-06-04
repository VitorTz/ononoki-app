import ReturnButton from '@/components/buttons/ReturnButton'
import ChangeProfileInfoForm from '@/components/form/ChangeProfileInfoForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import React from 'react'
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native'


const Account = () => {

  const { user } = useAuthState()    
  
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' titleColor={Colors.accountColor} >
        <ReturnButton color={Colors.accountColor} />
      </TopBar>
      <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
        <View style={{marginBottom: 20}} >
          <Image
            source={user!.image_url} 
            style={{width: 128, height: 128}}
            contentFit='cover' />
          <Pressable style={style.brush} >
            <Ionicons name='brush-outline' size={20} color={Colors.backgroundColor} />
          </Pressable>
        </View>
      </View>
      <ChangeProfileInfoForm/>
    </SafeAreaView>
  )
  
}

export default Account

const style = StyleSheet.create({
  brush: {
    backgroundColor: Colors.accountColor, 
    padding: 8, 
    borderRadius: 42,
    position: 'absolute', 
    right: -20,
    bottom: -20
  }
})
