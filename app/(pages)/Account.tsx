import ReturnButton from '@/components/buttons/ReturnButton'
import ChangeProfileImageForm from '@/components/form/ChangeProfileImageForm'
import ChangeProfileInfoForm from '@/components/form/ChangeProfileInfoForm'
import ReadingSummaryComponent from '@/components/ReadingSummary'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native'



const Account = () => {

  const { session } = useAuthState()

  const handleSignIn = () => {
    router.navigate("/SignIn")
  }

  const handleSignUp = () => {
    router.navigate("/SignUp")
  }

  if (!session) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Account' titleColor={Colors.accountColor} >
          <ReturnButton color={Colors.accountColor} />
        </TopBar>
        <Text style={AppStyle.textRegular}>You are not logged in</Text>
        <Row style={{width: '100%', gap: 10}} >
          <Pressable onPress={handleSignIn} style={[AppStyle.formButton, {backgroundColor: Colors.accountColor, flex: 1}]} >
            <Text style={AppStyle.formButtonText} >Sign In</Text>
          </Pressable>
          <Pressable onPress={handleSignUp} style={[AppStyle.formButton, {backgroundColor: Colors.accountColor, flex: 1}]} >
            <Text style={AppStyle.formButtonText} >Sign Up</Text>
          </Pressable>
        </Row>
      </SafeAreaView>
    )
  }
  
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' titleColor={Colors.accountColor} >
        <ReturnButton color={Colors.accountColor} />
      </TopBar>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false} >          
            <ChangeProfileImageForm/>
            <ChangeProfileInfoForm/>
            <View style={{height: 20}} />
            <ReadingSummaryComponent user_id={session.user.id} is_app_user={true} />
            <View style={{marginBottom: 160}} />          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
  
}

export default Account
