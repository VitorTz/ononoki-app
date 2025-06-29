import { wp } from '@/helpers/util'
import { Image } from 'expo-image'
import React, { memo } from 'react'


interface MangaImageProps {
    originalWidth: number
    originalHeight: number
    imageUrl: string
}


const MAX_WIDTH = wp(100)


const MangaImageComponent = ({originalWidth, originalHeight, imageUrl}: MangaImageProps) => {
    
    const width = originalWidth < MAX_WIDTH ? originalWidth : MAX_WIDTH
    const height = width * (originalHeight / originalWidth)
    
    return (
        <Image style={{ width, height}} source={imageUrl} contentFit='cover'/>
    )
}


const areEqual = (
  prevProps: MangaImageProps,
  nextProps: MangaImageProps
) => prevProps.imageUrl === nextProps.imageUrl


export const MangaImage = memo(MangaImageComponent, areEqual)

export default MangaImage

