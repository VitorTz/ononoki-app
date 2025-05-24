import { create } from 'zustand'


type ReadModeState = {
    readMode: "List" | "Page"
    setMode: (readMode: "List" |  "Page") => void    
}

export const useReadModeState = create<ReadModeState>(
    (set) => ({
        readMode: "List",
        setMode: (readMode: "List" | "Page") => {
            (set((state) => {return {...state, readMode}}))
        }
    })
)