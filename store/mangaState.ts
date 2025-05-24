import { Manga } from '@/helpers/types'
import { create } from 'zustand'


type MangaState = {
    manga: Manga | null
    setManga: (manga: Manga) => void    
}

export const useMangaState = create<MangaState>(
    (set) => ({
        manga: null,
        setManga: (manga: Manga) => {set((state) => {
            return {...state, manga}
        })}        
    })
)