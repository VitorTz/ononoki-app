import ChapterReaderHorizontal from '@/components/chapter/ChapterReaderHorizontal';
import ChapterReaderVertical from '@/components/chapter/ChapterReaderVertical';
import { Colors } from '@/constants/Colors';
import { dbSetAppInfo } from '@/lib/database';
import { useReadModeState } from '@/store/readModeState';
import { AppStyle } from '@/styles/AppStyle';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';


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

  return (
    <SafeAreaView style={[AppStyle.safeArea, styles.container]} >
      {
        readMode === 'List' ? 
        <ChapterReaderVertical mangaTitle={mangaTitle} /> :
        <ChapterReaderHorizontal mangaTitle={mangaTitle} />
      }
    </SafeAreaView>
  )
}

export default ChapterPage

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, 
    paddingVertical: 0,   
    backgroundColor: Colors.black
  }
})
