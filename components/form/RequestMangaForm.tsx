import { Colors } from '@/constants/Colors';
import { hp } from '@/helpers/util';
import { spRequestManga } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyle';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';


const schema = yup.object().shape({  
    manga_title: yup
        .string()
        .min(3, 'Min 3 characters')
        .max(256, 'Max 256 characters')
        .required('Manga name is required'),
    descr: yup
        .string()
        .max(1024)    
});


interface FormData {
    manga_title: string
    descr: string
}


const RequestMangaForm = () => {
        
    const [isLoading, setLoading] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            manga_title: '',
            descr: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
            const m = form_data.descr.trim() == '' ? null : form_data.descr.trim()
            await spRequestManga(form_data.manga_title, m)
            Keyboard.dismiss()
            Toast.show({text1: "Thanks!", type: 'success'})
            router.back()
        setLoading(false)
    };

  return (
    <KeyboardAvoidingView style={{flex: 1, gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{flex: 1}} keyboardShouldPersistTaps='always' >
            
            {/* Manga Name */}
            <Text style={AppStyle.inputHeaderText}>Name</Text>
            <Controller
                control={control}
                name="manga_title"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.manga_title && (<Text style={AppStyle.error}>{errors.manga_title.message}</Text>)}

            {/* Description */}
            <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                <Text style={AppStyle.inputHeaderText}>Message</Text>
                <Text style={[AppStyle.textRegular, {fontSize: 12, color: Colors.requestMangaColor}]}>optional</Text>
            </View>
            <Controller
                name="descr"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={[AppStyle.input, {height: hp(25), paddingVertical: 10, textAlignVertical: 'top'}]}                    
                    multiline={true}
                    autoCapitalize="sentences"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.descr && (<Text style={AppStyle.error}>{errors.descr.message}</Text>)}            
    
            {/* Request Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.requestMangaColor}]} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                    <Text style={AppStyle.formButtonText} >Request</Text>
                }
            </Pressable>
            
            <View style={{width: '100%', height: 60}} />

        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RequestMangaForm
