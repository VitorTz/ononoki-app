import OpenChatButton from '@/components/buttons/OpenChatButton'
import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'


const ChatPage = () => {

  const { user, session } = useAuthState()  

  if (!user) {
    return (
      <SafeAreaView style={AppStyle.safeArea} >
          <TopBar title='Chats' titleColor={Colors.chatColor} >
              <ReturnButton color={Colors.chatColor} />
          </TopBar>
          <View style={{gap: 16}} >
            <Text style={[AppStyle.textRegular, {color: Colors.chatColor}]}>You are not logged!</Text>
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 10}} >
              <Pressable style={styles.button} onPress={() => router.navigate("/SignIn")} >
                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>SignIn</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={() => router.navigate("/SignUp")} >
                <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>SignUp</Text>
              </Pressable>
            </View>
          </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Chats' titleColor={Colors.chatColor} >
            <ReturnButton color={Colors.chatColor} />
        </TopBar>
        <View style={{position: 'absolute', bottom: 80, right: 20}} >
            <OpenChatButton/>
        </View>
    </SafeAreaView>
  )
}

export default ChatPage

const styles = StyleSheet.create({
  button: {
    flex: 1, 
    height: 50, 
    borderRadius: 4, 
    backgroundColor: Colors.chatColor,
    alignItems: "center",
    justifyContent: "center"
  }
})