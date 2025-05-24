import { Chapter } from '@/helpers/types';
import { create } from "zustand";


export type ReadingState = {
    mangaTitle: string | null
    setMangaTitle: (mangaTitle: string) => void
    chapterMap: Map<number, Chapter>
    currentChapter: Chapter | null
    setChapterMap: (chapterMap: Map<number, Chapter>) => void
    setChapterNum: (chapterNum: number) => void
    moveToNextChapter: () => void
    moveToPreviousChapter: () => void    
}


export const useReadingState = create<ReadingState>(
    (set) => ({
        mangaTitle: null,
        chapterMap: new Map(),
        currentChapter: null,
        setMangaTitle: (mangaTitle: string) => {set((state) => {
            return {...state, mangaTitle}
        })},
        setChapterMap: (chapterMap: Map<number, Chapter>) => {set((state) => {
            return {...state, chapterMap}
        })},
        moveToNextChapter: () => {set((state) => {
            if (!state.currentChapter) { return state }
            if (!state.chapterMap.has(state.currentChapter.chapter_num + 1)) { return state }
            const newChapter: Chapter = state.chapterMap.get(state.currentChapter.chapter_num + 1)!
            return {
                ...state, 
                currentChapter: newChapter
            }
        })},
        moveToPreviousChapter: () => {set((state) => {
            if (!state.currentChapter) { return state }
            if (!state.chapterMap.has(state.currentChapter.chapter_num - 1)) { return state }
            const newChapter: Chapter = state.chapterMap.get(state.currentChapter.chapter_num - 1)!
            return {
                ...state, 
                currentChapter: newChapter
            }
        })},
        setChapterNum: (chapterNum: number) => {set((state) => {
            if (!state.chapterMap.has(chapterNum)) { return state }
            const newChapter: Chapter = state.chapterMap.get(chapterNum)!
            return {
                ...state, 
                currentChapter: newChapter
            }
        })},  
}))