import ChapterReaderHorizontal from '@/components/chapter/ChapterReaderHorizontal';
import ChapterReaderVertical from '@/components/chapter/ChapterReaderVertical';
import { AppConstants } from '@/constants/AppConstants';
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
  const { readMode, setMode } = useReadModeState()
  const params = useLocalSearchParams()  
  const mangaTitle: string = params.mangaTitle as any

  useEffect(
    () => {
      async function init() {
        if (!readMode || !AppConstants.VALID_READ_MODES.includes(readMode)) {
          await dbSetAppInfo(db, 'read_mode', 'List')
          setMode('List')
          return 
        }
        await dbSetAppInfo(db, 'read_mode', readMode)
      }
      init()
    },
    [db, readMode]
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

  return <></>
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
