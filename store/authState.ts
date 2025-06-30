import { OnonokiUser } from '@/helpers/types'
import { Session } from '@supabase/supabase-js'
import { create } from 'zustand'


type AuthState = {
    user: OnonokiUser | null
    session: Session | null
    changeUserName: (username: string) => void
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
        changeUserName: (username: string) => {
            set((state) => {return {...state, user: {image_url: state.user!.image_url, user_id: state.user!.user_id, username}, session: null}})
        }
    })
)