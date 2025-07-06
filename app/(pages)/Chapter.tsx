import ChapterReaderHorizontal from '@/components/chapter/ChapterReaderHorizontal';
import ChapterReaderVertical from '@/components/chapter/ChapterReaderVertical';
import { Colors } from '@/constants/Colors';
import { dbSetAppInfo } from '@/lib/database';
import { useReadModeState } from '@/store/readModeState';
import { AppStyle } from '@/styles/AppStyle';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';


const ChapterPage = () => {
    
  const db = useSQLiteContext()
  const { readMode } = useReadModeState()
  const params = useLocalSearchParams()  
  const mangaTitle: string = params.mangaTitle as any

  useEffect(
    () => {
      if (!readMode) { return }
      async function init() {
        await dbSetAppInfo(db, 'read_mode', readMode)
      }
      init()
    },
    [readMode]
  )

  if (readMode == "List") {
    return (
        <SafeAreaView style={[AppStyle.safeArea, styles.container]} >
          <ChapterReaderVertical mangaTitle={mangaTitle} />
        </SafeAreaView>
    )
  }

  if (readMode == "Page") {
    return (
        <SafeAreaView style={[AppStyle.safeArea, styles.container]} >
          <ChapterReaderHorizontal mangaTitle={mangaTitle} />
        </SafeAreaView>
    )
  }

  Toast.show({text1: "Error", text2: "Invalid chapter orientation", type: "error"})
  router.back()
  
}

export default ChapterPage

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, 
    paddingVertical: 0,  
    paddingTop: 0,
    marginBottom: 0,
    marginTop: 0, 
    backgroundColor: Colors.backgroundColor
  }
})
