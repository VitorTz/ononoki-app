import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { hp } from '@/helpers/util';
import { spCreateUser, supabase } from '@/lib/supabase';
import { useAuthState } from '@/store/authState';
import { AppStyle } from '@/styles/AppStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
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
    bio: yup
        .string()
        .max(AppConstants.BIO_MAX_LENGTH, `Max ${AppConstants.BIO_MAX_LENGTH} characters`),
    malAccount: yup
        .string()
        .max(AppConstants.MAL_USERNAME_MAX_LENGTH, `Max ${AppConstants.MAL_USERNAME_MAX_LENGTH} characters`),
    password: yup
        .string()
        .min(AppConstants.PASSWORD_MIN_LENGTH, `Password must be at least ${AppConstants.PASSWORD_MIN_LENGTH} characters`)
        .required('Password is required'),  
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Password must be the same')
        .required('Password is required')
});

interface FormData {
    name: string
    email: string
    password: string
    confirmPassword: string
    malAccount: string
    bio: string
}


const SignUpForm = () => {  

    const { login, logout } = useAuthState()
    const [isLoading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            name: '',
            email: '',
            malAccount: '',
            password: '',
            confirmPassword: '',
            bio: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        Keyboard.dismiss()
        
        if (
            form_data.malAccount.trim() != '' && 
            form_data.malAccount.trim().length < AppConstants.MAL_USERNAME_MIN_LENGTH) {
            Toast.show({
                text1: "Invalid MyAnimeList Username",
                text2: "Must be >= 2 or <= 16 characters",
                type: "error",
                visibilityTime: 4000
            })
            return
        }
        
        setLoading(true)

            const { user, session ,error } = await spCreateUser(
                form_data.email.trim(),
                form_data.password.trim(),
                form_data.name.trim(),
                form_data.bio.trim(),
                form_data.malAccount.trim()
            )
            
            if (error) {
                console.log(error, error.code)
                switch (error.code) {
                    case "weak_password":
                        Toast.show({
                            text1: "Weak Password!",
                            text2: "Must contain at least 1 uppercase, 1 lowercase, 1 digit and 1 symbol", 
                            type: "error"                        
                        })
                        break
                    default:
                        Toast.show({text1: "Error", text2: error.message, type: "error"})
                        break
                }
                setLoading(false)
                return
            }

            if (user && session) {
                login(user, session)
                setLoading(false)
                Toast.show({
                    text1: `👋 Hello ${user.username}!`,
                    text2: "Your account is ready!",
                    type: "success"
                })
                router.replace("/(pages)/Home")
                return
            } else {
                logout()
                await supabase.auth.signOut()
            }

        setLoading(false)
    };

  return (
    <KeyboardAvoidingView style={{flex: 1, gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false} >

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
            
            {/* Password */}
            <Text style={AppStyle.inputHeaderText}>Password</Text>
            <View>
                <Controller
                    name="password"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={AppStyle.input}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}/>
                    )}
                />
                <Pressable onPress={() => setShowPassword(prev => !prev)} style={{position: 'absolute', height: '100%', alignItems: "center", justifyContent: "center", right: 10}} >
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color={Colors.accountColor} />
                </Pressable>
            </View>
            {errors.password && (<Text style={AppStyle.error}>{errors.password.message}</Text>)}

            {/* Confirm Password */}
            <Text style={AppStyle.inputHeaderText}>Confirm password</Text>
            <Controller
                name="confirmPassword"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.confirmPassword && (<Text style={AppStyle.error}>{errors.confirmPassword.message}</Text>)}
            
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
    
            {/* Sign Up Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.accountColor}]} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                    <Text style={AppStyle.formButtonText} >Register</Text>
                }
            </Pressable>

            {/* Already Have an Account? */}
            <View style={{flexDirection: "row", marginTop: 20, gap: 4}} >
                <Text style={{color: Colors.white, fontSize: 14}} >Already Have an Account?</Text> 
                <Pressable onPress={() => router.replace("/(auth)/SignIn")}  hitSlop={{left: 10, top: 10, bottom: 10, right: 10}} >
                    <Text style={{textDecorationLine: "underline", fontWeight: "bold", color: Colors.accountColor, fontSize: 14}} >
                        Sign In
                    </Text> 
                </Pressable>
            </View>
            <View style={{marginBottom: 80}} />
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignUpForm

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
