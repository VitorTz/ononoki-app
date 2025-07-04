import HomeButton from '@/components/buttons/HomeButton'
import SignInForm from '@/components/form/SignForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { SafeAreaView } from 'react-native'



const SignInPage = () => {
    
    return (
      <SafeAreaView style={AppStyle.safeArea} >
          <TopBar title='SignIn' titleColor={Colors.accountColor} >
              <HomeButton color={Colors.accountColor}/>
          </TopBar>
          <SignInForm/>
      </SafeAreaView>
    )
}

export default SignInPage