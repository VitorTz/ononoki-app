import { Colors } from '@/constants/Colors';
import { dbMigrate } from '@/lib/database';
import { AppStyle } from '@/styles/AppStyle';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';


const TOAST_CONFIG = {
  
  success: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={styles.toast}>
      <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 18}]}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 16}]}>{text2}</Text>}
      <View style={{position: 'absolute', left: 0, top: 0, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, backgroundColor: Colors.ononokiGreen, height: 66, width: 5}} />
    </View>
  ),
  
  error: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={styles.toast}>
      <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 18}]}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 16}]}>{text2}</Text>}
      <View style={{position: 'absolute', left: 0, top: 0, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, backgroundColor: Colors.neonRed, height: 66, width: 5}} />
    </View>
  ),
  
  info: ({ text1, text2 }: {text1: string, text2: string}) => (
    <View style={styles.toast}>
      <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 18}]}>{text1}</Text>
      {text2 && <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 16}]}>{text2}</Text>}
      <View style={{position: 'absolute', left: 0, top: 0, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, backgroundColor: Colors.yellow, height: 66, width: 5}} />
    </View>
  )
};



const _layout = () => {
  return (
      <GestureHandlerRootView style={{flex: 1, backgroundColor: Colors.backgroundColor}} >
        <StatusBar hidden={true} barStyle={'light-content'} animated={true}/>
        <SQLiteProvider databaseName='ononoki.db' onInit={dbMigrate}>
          <Stack>
              <Stack.Screen name='index' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Home' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Manga' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/MangaByGenre' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/MangaByAuthor' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/MangaCollection' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/MangaCollections' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Chapter' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/LatestUpdates' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/MostView' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/BugReport' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Releases' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Account' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/ProfilePage' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/UsersPage' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/MangaRequest' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/ReadHistory' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Library' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/MangaSearch' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Donate' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Disclaimer' options={{headerShown: false}} />
              <Stack.Screen name='(auth)/SignIn' options={{headerShown: false}} />
              <Stack.Screen name='(auth)/SignUp' options={{headerShown: false}} />
          </Stack>
          <Toast 
            position='bottom' 
            config={TOAST_CONFIG as any} 
            bottomOffset={60} 
            visibilityTime={2500} 
            avoidKeyboard={true} 
            swipeable={true}/>
        </SQLiteProvider>
      </GestureHandlerRootView>    
  )
}

export default _layout


const styles = StyleSheet.create({
  toast: {
    height: 66, 
    width: '90%', 
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 4, 
    backgroundColor: Colors.gray
  }
})