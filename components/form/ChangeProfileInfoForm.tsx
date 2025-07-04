import { Colors } from '@/constants/Colors';
import { hp } from '@/helpers/util';
import { spChangeUsernameAndBio } from '@/lib/supabase';
import { useAuthState } from '@/store/authState';
import { AppStyle } from '@/styles/AppStyle';
import { yupResolver } from '@hookform/resolvers/yup';
import { PostgrestError } from '@supabase/supabase-js';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
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
        .required('Email is required'),
    bio: yup
        .string()
        .max(2048, "Max 2048 characters")
});

interface FormData {
    name: string
    email: string
    bio: string
}


const ChangeProfileInfoForm = () => {

    const [isLoading, setLoading] = useState(false)
    const { user, session, setUser } = useAuthState()

    const changingInfo = useRef(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            name: user ? user.username : '',
            email: session ? session.user.email! : '',
            bio: user && user.bio ? user.bio : ''
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
        Keyboard.dismiss()

        setLoading(true)
            const newBio = form_data.bio.trim() === '' ? null : form_data.bio.trim()            
            const newUsername = form_data.name.trim()

            if (newUsername != user.username || newBio != user.bio) {                
                const nameChangeError: PostgrestError | null = await spChangeUsernameAndBio(
                    user.user_id, 
                    newUsername,
                    newBio
                );
                if (nameChangeError) {
                    console.log(nameChangeError)
                    Toast.show({
                        text1: "Error", 
                        text2: nameChangeError.message,
                        type: "error"
                    })
                } else {
                    setUser(
                        {
                            user_id: user.user_id,
                            username: newUsername,
                            bio: newBio,
                            profile_image_url: user.profile_image_url,
                            profile_image_width: user.profile_image_width,
                            profile_image_height: user.profile_image_height
                        }
                    )
                    Toast.show({text1: "Success", type: "success"})
                }
            }

            // change email
            
        setLoading(false)
        changingInfo.current = false
    };

  return (
    <>
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

        {/* Bio */}
        <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
            <Text style={AppStyle.inputHeaderText}>Bio</Text>
            <Text style={[AppStyle.textRegular, {color: Colors.accountColor, marginBottom: 10, fontSize: 12}]}>optional</Text>
        </View>
        <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
                style={styles.input}
                textAlignVertical='top'
                autoCapitalize="sentences"
                multiline={true}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}/>
            )}
        />
        {errors.bio && (<Text style={AppStyle.error}>{errors.bio.message}</Text>)}

        {/* Save Changes Button */}
        <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.accountColor}]} >
            {
                isLoading ? 
                <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                <Text style={AppStyle.formButtonText} >Save</Text>
            }
        </Pressable>
        <View style={{marginBottom: 160}} />
    </>
  )
}

export default ChangeProfileInfoForm


const styles = StyleSheet.create({
    input: {
        backgroundColor: Colors.gray1,
        borderRadius: 4,
        height: hp(30),
        fontSize: 18,
        paddingHorizontal: 10,
        color: Colors.white,
        fontFamily: "LeagueSpartan_400Regular",
        marginBottom: 10
    }
})