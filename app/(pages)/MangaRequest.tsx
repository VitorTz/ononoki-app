import ReturnButton from '@/components/buttons/ReturnButton'
import RequestMangaForm from '@/components/form/RequestMangaForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { SafeAreaView } from 'react-native'


const RequestManhwa = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Request Manga' titleColor={Colors.requestMangaColor} >
            <ReturnButton color={Colors.requestMangaColor} />
        </TopBar>
        <RequestMangaForm/>
    </SafeAreaView>
  )
}


export default RequestManhwa
