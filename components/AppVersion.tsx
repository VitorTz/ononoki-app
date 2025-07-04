import { Colors } from '@/constants/Colors'
import { useAppVersionState } from '@/store/appReleaseState'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Text } from 'react-native'

const AppVersion = () => {

    const { localVersion } = useAppVersionState()

    return (
        <>
            {
                localVersion && 
                <Text 
                    style={[AppStyle.textRegular, {marginBottom: 10, color: Colors.releasesColor}]} >Your app version: {localVersion}</Text>
            }
        </>
    )
}

export default AppVersion
