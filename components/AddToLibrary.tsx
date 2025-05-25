import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { Manga } from '@/helpers/types';
import { dbGetMangaReadingStatus, dbUpdateMangaReadingStatus } from '@/lib/database';
import { spUpdateMangaReadingStatus } from '@/lib/supabase';
import { useAuthState } from '@/store/authState';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-toast-message';


interface AddToLibrayProps {
    manga: Manga,
    backgroundColor?: string
    textColor?: string
}


const AddToLibray = ({
    manga,
    backgroundColor = Colors.libraryColor, 
    textColor = Colors.backgroundColor
}: AddToLibrayProps) => {

    const db = useSQLiteContext()
    const { session } = useAuthState()

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string>()
    const [items, setItems] = useState(
        AppConstants.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    const dbValue = useRef('')

    useEffect(
        () => {
            async function init() {
                await dbGetMangaReadingStatus(db, manga.manga_id)
                .then(value => {
                    if (!value) { return }
                    dbValue.current = value
                    setValue(value)
                })
            }
            init()
        },
        [db, manga]
    )

    const onChangeValue = async (value: string | null) => {        
        if (!session) {
            Toast.show({text1: "Hey", text2: "You are not logged!", type: "info"})
            return
        }
        if (!value || value === dbValue.current) { return }
        await dbUpdateMangaReadingStatus(db, manga.manga_id, value)
        spUpdateMangaReadingStatus(session.user.id, manga.manga_id, value)
    }

    return (
        <View style={{flex: 1, height: 52}} >
            <DropDownPicker
                open={open}
                style={{height: 52, borderRadius: 4, backgroundColor, borderWidth: 0}}
                dropDownContainerStyle={{backgroundColor: Colors.gray}}
                labelStyle={{color: textColor}}
                textStyle={{fontFamily: "LeagueSpartan_400Regular", fontSize: 18, color: Colors.white}}
                showArrowIcon={false}
                placeholder='Add To Library'
                placeholderStyle={{color: textColor, fontSize: 18, fontFamily: "LeagueSpartan_400Regular"}}
                value={value as any}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                listMode='SCROLLVIEW'
                theme="DARK"                
                onChangeValue={onChangeValue}
                multiple={false}
                mode="SIMPLE"
            />
        </View>
    )
}

export default AddToLibray
