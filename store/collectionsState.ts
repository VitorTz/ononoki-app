import { MangaCollection } from '@/helpers/types'
import { create } from 'zustand'


type CollectionState = {
    collections: MangaCollection[]
    currentCollection: MangaCollection | null
    setCollections: (collections: MangaCollection[]) => void
    setCurrentCollection: (collection: MangaCollection | null) => void
}


export const useCollectionState = create<CollectionState>(
    (set) => ({
        collections: [],
        currentCollection: null,
        setCollections: (collections: MangaCollection[]) => {set((state) => {
            return {...state, collections}
        })},
        setCurrentCollection: (collection: MangaCollection | null) => {set((state) => {
            return {...state, currentCollection: collection}
        })}
    })
)