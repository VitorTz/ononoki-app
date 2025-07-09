import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Row from '../util/Row'


interface ChangeChapterPageProps {
  currentPage: number
  goToPreviousPage: () => any
  goToNextPage: () => any
  maxPage: number
}

const ChangeChapterPage = ({
    currentPage,
    goToPreviousPage,
    goToNextPage,
    maxPage,
}: ChangeChapterPageProps) => {
  return (
    <Row style={{gap: 10, justifyContent: "flex-start"}} >
      <Text style={[AppStyle.textRegular, {fontSize: 18}]}>Page</Text>
      {
        currentPage > 0 &&
        <Pressable onPress={goToPreviousPage} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.hitSlop} >
          <Ionicons name='chevron-back' size={20} color={Colors.white} />
        </Pressable>
      }
      <View style={{alignItems: "center", justifyContent: "center"}} >
        <Text style={[AppStyle.textRegular, {fontSize: 18}]}>{currentPage + 1}</Text>
      </View>
      {
        currentPage < maxPage &&
        <Pressable onPress={goToNextPage} style={{alignItems: "center", justifyContent: "center", marginTop: 2}} hitSlop={AppConstants.hitSlop}>
          <Ionicons name='chevron-forward' size={20} color={Colors.white} />
        </Pressable>
      }
    </Row> 
  )
}

export default ChangeChapterPage

const styles = StyleSheet.create({})