import { Colors } from '@/constants/Colors';
import { spChangeUsername } from '@/lib/supabase';
import { useAuthState } from '@/store/authState';
import { AppStyle } from '@/styles/AppStyle';
import { yupResolver } from '@hookform/resolvers/yup';
import { PostgrestError } from '@supabase/supabase-js';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';


const schema = yup.object().shape({  
    name: yup
        .string()
        .min(3, 'Username must be at least 3 characters')        
        .max(30, 'Max 30 characters')
        .required('Username is required'),
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required')    
});

interface FormData {
    name: string
    email: string
}


const ChangeProfileInfoForm = () => {

    const [isLoading, setLoading] = useState(false)
    const { user, session, changeUserName } = useAuthState()

    const changingInfo = useRef(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {            
            name: user ? user.username : '',
            email: session ? session.user.email! : ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        if (!user) {
            Toast.show({
                text1: "Sorry", 
                text2: 'You are not logged!',
                type: "error"
            })
            return
        }

        if (changingInfo.current) { return }
        changingInfo.current = true
        setLoading(true)
            Keyboard.dismiss()
            console.log(form_data)
            
            // Change username
            if (form_data.name != user.username) {
                console.log(form_data.name, user.username)
                const nameChangeError: PostgrestError | null = await spChangeUsername(user.user_id, form_data.name);
                if (nameChangeError) {
                    console.log(nameChangeError)
                    Toast.show({
                        text1: "Error", 
                        text2: nameChangeError.message,
                        type: "error"
                    })
                } else {
                    changeUserName(form_data.name)
                    Toast.show({
                        text1: "Success", 
                        type: "success"
                    })
                }
            }

            // change email
            
        setLoading(false)
        changingInfo.current = false
    };

  return (
    <KeyboardAvoidingView style={{width: '100%', gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{width: '100%'}} keyboardShouldPersistTaps={'always'} >

            {/* Username */}
            <Text style={AppStyle.inputHeaderText}>Username</Text>
            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}                    
                    autoComplete='name'
                    autoCapitalize='none'                    
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.name && (<Text style={AppStyle.error}>{errors.name.message}</Text>)}

            {/* Email */}
            <Text style={AppStyle.inputHeaderText}>Email</Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}                    
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.email && (<Text style={AppStyle.error}>{errors.email.message}</Text>)}
        
            {/* Save Changes Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.accountColor}]} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                    <Text style={AppStyle.formButtonText} >Save</Text>
                }
            </Pressable>

        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default ChangeProfileInfoForm
