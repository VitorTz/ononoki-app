import { Conversation } from '@/helpers/types'
import { create } from 'zustand'


type ChatState = {
    conversation: Conversation | null
    setConversation: (conversation: Conversation) => void
}


export const useChatState = create<ChatState>(
    (set) => ({
        conversation: null,
        setConversation: (conversation: Conversation) => {
            (set((state) => {return {...state, conversation}}))
        }
    })
)