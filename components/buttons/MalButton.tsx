import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { Linking, Pressable, Text, ViewStyle } from 'react-native'
import Toast from 'react-native-toast-message'


interface MALButtonProps {
    mal_url: string
    style?: ViewStyle
    color?: string
}

const MALButton = ({mal_url, style, color = 'white'}: MALButtonProps) => {

    const openUrl = async () => {
        try {
            await Linking.openURL(mal_url)
        } catch (error) {
            Toast.show({text1: "Could not open link", type: 'error'})
        }
    };

    return (
        <Pressable 
            onPress={openUrl} 
            hitSlop={AppConstants.hitSlopLarge}
            style={[style, {backgroundColor: Colors.backgroundColor, borderRadius: 4, width: 40, height: 40, alignItems: "center", justifyContent: "center"}]}
            >
                <Text style={[AppStyle.textMangaTitle, {fontSize: 12, color}]} >MAL</Text>
        </Pressable>
    )
}

export default MALButton