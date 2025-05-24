import { AppConstants } from '@/constants/AppConstants'
import { useReadModeState } from '@/store/readModeState'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'


const ChangeChapterReadModeButton = () => {

    const { readMode, setMode } = useReadModeState()    

    const onPress = () => {
        setMode(readMode == 'List' ? 'Page' : 'List')
    }

    return (
        <Pressable onPress={onPress} style={styles.container} hitSlop={AppConstants.hitSlop} >
            <Text style={AppStyle.textRegular}>{readMode}</Text>
        </Pressable>
    )
}

export default ChangeChapterReadModeButton

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center"
    }
})