import { AppConstants } from '@/constants/AppConstants'
import { ReadingSummary } from '@/helpers/types'
import { spFetchUserReadingStatusSummary } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface ReadingSummaryProps {
    user_id: string
}

const ORDER = new Map(AppConstants.READING_STATUS_ORDER.map((v, i) => [v, i]))

const sortSummary = (summary: ReadingSummary[]): ReadingSummary[] => {
    return summary.sort(
        (a: ReadingSummary, b: ReadingSummary): number => {
            const ia = ORDER.get(a.status)!
            const ib = ORDER.get(b.status)!
            if (ia > ib) {
                return 1
            }
            if (ia < ib) {
                return -1
            }
            return 0
        }
    )
}


const ReadingSummaryComponent = ({user_id}: ReadingSummaryProps) => {

    const [readingSummary, setReadingSummary] = useState<ReadingSummary[]>([])
    
    useEffect(
        () => {
            const init = async () => {
                if (readingSummary.length > 0) { return }
                await spFetchUserReadingStatusSummary(user_id)
                    .then(v => setReadingSummary(sortSummary(v)))
                    .catch(e => {console.log(e); setReadingSummary([])})
            }
            init()
        },
        []
    )

    const renderItem = ({item}: {item: ReadingSummary}) => {
        const color: string = AppConstants.READING_STATUS_COLOR.get(item.status)!

        return (
            <View key={item.status} style={{width: '100%', flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <View style={{flexDirection: 'row', gap: 20, alignItems: "center", justifyContent: "flex-start"}} >
                    <View style={{width: 20, height: 20, backgroundColor: color, borderRadius: 32}} />
                    <Text style={AppStyle.textRegular}>{item.status}</Text>
                </View>
                <Text style={AppStyle.textRegular}>{item.total}</Text>
            </View>
        )
    }

    return (
        <View style={{width: '100%', gap: 10}} >
            <Text style={AppStyle.textHeader}>Manga Stats</Text>
            {
                readingSummary.map((i) => renderItem({item: i}))
            }
        </View>
    )
}

export default ReadingSummaryComponent

const styles = StyleSheet.create({})