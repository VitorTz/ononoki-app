import { Colors } from '@/constants/Colors'
import { Chapter } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import TopBar from '../TopBar'
import BugReportButton from '../buttons/BugReportButton'
import ChangeChapterReadModeButton from '../buttons/ChangeChapterReadModeButton'
import ReturnButton from '../buttons/ReturnButton'
import Row from '../util/Row'
import ChangeChapter from './ChangeChapter'


interface ChapterHeaderProps {
  mangaTitle: string
  currentChapter: Chapter,
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterHeader = ({ 
  mangaTitle,
  currentChapter,
  loading, 
  goToPreviousChapter, 
  goToNextChapter
}: ChapterHeaderProps) => {

  const reportTitle = `${mangaTitle}/${currentChapter.chapter_name}`

  const exitChapter = async () => {
    Image.clearMemoryCache()
    router.back()
  }  

  return (
    <View style={{width: '100%', paddingHorizontal: wp(5), paddingBottom: 8}} >
      <TopBar title={mangaTitle} >
        <ReturnButton onPress={exitChapter} backgroundColor={Colors.black} />
      </TopBar>

      <Row style={{gap: 10, justifyContent: "space-between", marginBottom: 20}} >            
        <BugReportButton size={32} title={reportTitle} backgroundColor={Colors.black} padding={0} />
        <ChangeChapter
            goToNextChapter={goToNextChapter}
            goToPreviousChapter={goToPreviousChapter}
            loading={loading}            
            />
        <ChangeChapterReadModeButton/>
      </Row>
    </View>
  )
}

export default ChapterHeader

const styles = StyleSheet.create({})