import { OnonokiUser } from '@/helpers/types'
import { create } from 'zustand'


type ProfileState = {
    profile: OnonokiUser | null
    setProfile: (profile: OnonokiUser) => any 
}


export const useProfileState = create<ProfileState>(
    (set) => ({
        profile: null,        
        setProfile: (profile: OnonokiUser) => {
            (set((state) => {return {...state, profile}}))
        }
    })
)