import { hp, wp } from '@/helpers/util'
import { Image } from 'expo-image'
import React from 'react'

interface ProfileImageBigProps {
    image_url: string
    width: number
    height: number
}


const MAX_WIDTH = wp(90)
const MAX_HEIGHT = hp(60)


const ProfileImageBig = ({image_url, width, height}: ProfileImageBigProps) => {

    const w = width >= MAX_WIDTH ? MAX_WIDTH : width
    const h = w * (height / width)

    return (
        <Image
            source={image_url} 
            style={{width: w, height: h, borderRadius: 4, alignSelf: "center"}}
            contentFit='cover' 
        />
    )
}

export default ProfileImageBig
