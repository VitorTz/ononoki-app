import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { ReadingSummary } from '@/helpers/types'
import { dbGetUserReadingSummary } from '@/lib/database'
import { spFetchUserReadingStatusSummary } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, DimensionValue, StyleSheet, Text, View } from 'react-native'

interface ReadingSummaryProps {
    user_id: string
    is_app_user?: boolean
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


const ReadingSummaryBar = ({items}: {items: ReadingSummary[]}) => {

    const height = 20
    
    let total = 0;
    items.forEach(i => total += i.total)

    if (items.length == 0) {
        return <></>
    }

    const calculateWidth = (value: number): string => {
        const x = value / total * 100
        return `${x.toString()}%`
    }
    
    return (
        <View style={{width: '100%', flexDirection: 'row'}} >
            {
                items.map(
                    (item: ReadingSummary, index: number) => 
                    <View 
                        key={index}
                        style={{
                            height, 
                            width: calculateWidth(item.total) as DimensionValue, 
                            backgroundColor: AppConstants.READING_STATUS_COLOR.get(item.status)!,
                            borderTopLeftRadius: index == 0 ? 4 : 0,
                            borderBottomLeftRadius: index == 0 ? 4 : 0,
                            borderTopRightRadius: index == items.length - 1 ? 4 : 0,
                            borderBottomRightRadius: index == items.length - 1 ? 4 : 0,
                        }}
                    />
                )
            }
        </View>
    )
}


const ReadingSummaryComponent = ({user_id, is_app_user}: ReadingSummaryProps) => {

    const db = useSQLiteContext()
    const [readingSummary, setReadingSummary] = useState<ReadingSummary[]>([])
    const [loading, setLoading] = useState(false)
    
    useEffect(
        () => {
            const init = async () => {
                if (readingSummary.length > 0) { return }
                setLoading(true)
                    if (is_app_user) {
                        await dbGetUserReadingSummary(db)
                            .then(v => setReadingSummary(v as any))
                            .catch(e => {console.log(e); setReadingSummary([])})
                    } else {
                        await spFetchUserReadingStatusSummary(user_id)
                            .then(v => setReadingSummary(sortSummary(v)))
                            .catch(e => {console.log(e); setReadingSummary([])})
                    }                
                setLoading(false)
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

    if (loading) {
        return (
            <ActivityIndicator size={32} color={Colors.peopleColor} />
        )
    }

    if (readingSummary.length == 0) {
        return <></>
    }

    return (
        <View style={{width: '100%', gap: 10}} >
            <Text style={AppStyle.textHeader}>Manga Stats</Text>
            <ReadingSummaryBar items={readingSummary} />
            { readingSummary.map((i) => renderItem({item: i})) }
        </View>
    )
}

export default ReadingSummaryComponent

const styles = StyleSheet.create({})