import { OnonokiUser } from '@/helpers/types'
import { Session } from '@supabase/supabase-js'
import { create } from 'zustand'


type AuthState = {
    user: OnonokiUser | null
    session: Session | null
    changeUserName: (username: string) => void
    changeProfileImage: (image_url: string, width: number, height: number) => void
    setUser: (user: OnonokiUser | null) => void,
    login: (user: OnonokiUser, session: Session | null) => void
    logout: () => void
}


export const useAuthState = create<AuthState>(
    (set) => ({
        user: null,
        session: null,
        login: (user: OnonokiUser, session: Session | null) => {
            (set((state) => {return {...state, user, session}}))
        },
        logout: () => {
            set((state) => {return {...state, user: null, session: null}})
        },
        setUser: (user: OnonokiUser | null) => {
            set((state) => {return {...state, user: user}})
        },
        changeUserName: (username: string) => {
            set((state) => {
                return {
                    ...state, 
                    user: {profile_image_url: state.user!.profile_image_url, user_id: state.user!.user_id, username, profile_image_width: state.user!.profile_image_width, profile_image_height: state.user!.profile_image_height, bio: state.user!.bio}}
            })
        },
        changeProfileImage: (image_url: string, width: number, height: number) => {
            set((state) => {
                return {
                    ...state, 
                    user: {profile_image_url: image_url, user_id: state.user!.user_id, username: state.user!.username, profile_image_width: width, profile_image_height: height, bio: state.user!.bio}}
            })
        }
    })
)