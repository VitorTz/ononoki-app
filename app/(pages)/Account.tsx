import ReturnButton from '@/components/buttons/ReturnButton'
import ChangeProfileInfoForm from '@/components/form/ChangeProfileInfoForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import { Image } from 'expo-image'
import React from 'react'
import { SafeAreaView, View } from 'react-native'


const Account = () => {

  const { user } = useAuthState()    
  
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' titleColor={Colors.accountColor} >
        <ReturnButton color={Colors.accountColor} />
      </TopBar>
      <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
        <Image
          source={user!.image_url} 
          style={{width: 128, height: 128}}
          contentFit='cover' />
      </View>
      <ChangeProfileInfoForm/>
    </SafeAreaView>
  )
  
}

export default Account
