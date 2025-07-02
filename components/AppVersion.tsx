import { useAppVersionState } from '@/store/appReleaseState'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const AppVersion = () => {

    const { localVersion } = useAppVersionState()

    return (
        <View>
            {
                localVersion && 
                <Text style={[AppStyle.textRegular, {marginBottom: 10}]} >Your app version: {localVersion}</Text>
            }
        </View>
    )
}

export default AppVersion

const styles = StyleSheet.create({})