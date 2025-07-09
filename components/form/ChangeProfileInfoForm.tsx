import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { ToastMessages } from '@/constants/Messages';
import { hp } from '@/helpers/util';
import { spChangeUserInfos } from '@/lib/supabase';
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
        .min(AppConstants.USERNAME_MIN_LENGTH, `Username must be at least ${AppConstants.USERNAME_MIN_LENGTH} characters`)        
        .max(AppConstants.USERNAME_MAX_LENGTH, `Max ${AppConstants.USERNAME_MAX_LENGTH} characters`)
        .required('Username is required'),
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    malAccount: yup
        .string()
        .max(AppConstants.MAL_USERNAME_MAX_LENGTH, `Max ${AppConstants.MAL_USERNAME_MAX_LENGTH} characters`),
    bio: yup
        .string()
        .max(AppConstants.BIO_MAX_LENGTH, `Max ${AppConstants.BIO_MAX_LENGTH} characters`)
});

interface FormData {
    name: string
    email: string
    bio: string
    malAccount: string
}


const ChangeProfileInfoForm = () => {

    const [isLoading, setLoading] = useState(false)
    const { user, session, setUser } = useAuthState()
    const changingInfo = useRef(false)

    const currentMalAccount = user && user.mal_url ? user.mal_url.split(AppConstants.MAL_PROFILE_URL)[1]: ''    

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            name: user ? user.username : '',
            email: session ? session.user.email! : '',
            bio: user && user.bio ? user.bio : '',
            malAccount: currentMalAccount
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        if (!user) {
            Toast.show(ToastMessages.EN.NOT_LOGGED_IN)
            return
        }

        if (
            form_data.malAccount.trim() != '' && 
            form_data.malAccount.trim().length < AppConstants.MAL_USERNAME_MIN_LENGTH
        ) {
            Toast.show({
                text1: "Hey",
                text2: "MyAnimeList username must be at least 2 characters",
                type: "info"
            })
            return
        }

        if (changingInfo.current) { return }

        changingInfo.current = true
        Keyboard.dismiss()

        setLoading(true)
            const newBio = form_data.bio.trim() === '' ? null : form_data.bio.trim()            
            const newUsername = form_data.name.trim()
            const newMalAccount = form_data.malAccount.trim()

            if (
                newUsername != user.username || 
                newBio != user.bio || 
                newMalAccount != currentMalAccount
            ) {
                const error: PostgrestError | null = await spChangeUserInfos(
                    user.user_id!,
                    newUsername,
                    newBio,
                    newMalAccount
                );

                if (error) {
                    console.log("error ChangeProfileInfoForm", error)
                    Toast.show({
                        text1: "Error", 
                        text2: error.message,
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
                            profile_image_height: user.profile_image_height,
                            mal_url: newMalAccount != '' ? `${AppConstants.MAL_PROFILE_URL}${newMalAccount}` : null
                        }
                    )
                    Toast.show(ToastMessages.EN.GENERIC_SUCCESS)
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

        {/* Mal Account Name */}
        <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
            <Text style={[AppStyle.inputHeaderText, {fontSize: 18}]}>MyAnimeList Account Name</Text>
            <Text style={[AppStyle.textRegular, {color: Colors.accountColor, marginBottom: 10, fontSize: 12}]}>optional</Text>
        </View>
        <Controller
            control={control}
            name="malAccount"
            render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
                style={AppStyle.input}
                autoCapitalize='none'                    
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}/>
            )}
        />
        {errors.malAccount && (<Text style={AppStyle.error}>{errors.malAccount.message}</Text>)}

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