import { hp, wp } from '@/helpers/util'
import { Image } from 'expo-image'
import React from 'react'
import { StyleSheet } from 'react-native'

interface ProfileImageBigProps {
    image_url: string
    width: number
    height: number
}


const MAX_WIDTH = wp(90)
const MAX_HEIGHT = hp(50)


const ProfileImageBig = ({image_url, width, height}: ProfileImageBigProps) => {

    const w = width >= MAX_WIDTH ? MAX_WIDTH : width
    const h = w * (height / width)

    return (
        <Image
            source={image_url} 
            style={{width: w, height: h > MAX_HEIGHT ? MAX_HEIGHT : h }}
            contentFit='contain' 
        />
    )
}

export default ProfileImageBig

const styles = StyleSheet.create({})