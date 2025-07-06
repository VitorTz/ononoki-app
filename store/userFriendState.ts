import { create } from 'zustand'


type UserFriendState = {
    friends: Set<string>
    setFriends: (friends: Set<string>) => void
}


export const useUserFriendState = create<UserFriendState>(
    (set) => ({
        friends: new Set<string>(),
        setFriends: (friends: Set<string>) => {
            (set((state) => {return {...state, friends}}))
        }
    })
)