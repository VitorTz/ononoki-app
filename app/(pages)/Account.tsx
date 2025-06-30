import ReturnButton from '@/components/buttons/ReturnButton'
import ChangeProfileInfoForm from '@/components/form/ChangeProfileInfoForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { spSetUserProfileImageUrl, supabase } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import React, { useRef, useState } from 'react'
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, Pressable, SafeAreaView, StyleSheet, View } from 'react-native'
import RNFS from 'react-native-fs'
import { launchImageLibrary } from 'react-native-image-picker'
import * as mime from 'react-native-mime-types'
import Toast from 'react-native-toast-message'



const Account = () => {

  const { user, changeProfileImage } = useAuthState()
  const [loading, setLoading] = useState(false)

  const uploadingPhoto = useRef(false)

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {        
      const storageGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "Ononoki needs access to your photos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
      );

      return storageGranted === PermissionsAndroid.RESULTS.GRANTED
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handlePickPhoto = async () => {
    if (uploadingPhoto.current) { return }
    await requestPermissions();

    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      (response: any) => {
        handleResponse(response);
      }
    );
  };

  const handleResponse = async (response: any) => {
    if (response.didCancel) {
      Alert.alert('Cancelled', 'Operation was cancelled');
    } else if (response.errorCode) {
      Alert.alert('Error', response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      const uri = response.assets[0].uri;
      uploadingPhoto.current = true
      await uploadToSupabase(uri);
      uploadingPhoto.current = false
    }
  };

  const decode = (base64: any) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const uploadToSupabase = async (uri: string) => {    
    if (!user) {
      Toast.show({text1: "Error", text2: "You are not logged!", type: "error"})
      return
    }

    setLoading(true);
    
    try {
      const filename = uri.split('/').pop();
      const mimeType = mime.lookup(uri) || 'image/jpeg';
            
      const fileData = await RNFS.readFile(uri, 'base64');
      const filePath = `${Date.now()}_${filename}`;
            
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(fileData), {
          contentType: mimeType,
          upsert: false,
        });

      if (error) throw error;
      
      const publicUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl
      const profileUpdateError = await spSetUserProfileImageUrl(user!.user_id, publicUrl);
      if (profileUpdateError) {
        Toast.show({text1: "Error", text2: profileUpdateError.message, type: "error"})
      } else {
        changeProfileImage(publicUrl)
        Toast.show({text1: "Success", type: "success"})
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
    } finally {
      setLoading(false);
    }

  };
  
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' titleColor={Colors.accountColor} >
        <ReturnButton color={Colors.accountColor} />
      </TopBar>
      <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
        <View style={{marginBottom: 20}} >
          <Image
            source={user!.image_url} 
            style={{width: 256, height: 256}}
            contentFit='contain' />
          
          <Pressable onPress={handlePickPhoto} style={style.brush} >
            {
              loading ? 
              <ActivityIndicator size={28} color={Colors.backgroundColor} /> :
              <Ionicons name='brush-outline' size={20} color={Colors.backgroundColor} />
            }
          </Pressable>
        </View>
      </View>
      <ChangeProfileInfoForm/>
    </SafeAreaView>
  )
  
}

export default Account

const style = StyleSheet.create({
  brush: {
    backgroundColor: Colors.accountColor, 
    padding: 8, 
    borderRadius: 42,
    position: 'absolute', 
    right: -20,
    bottom: -20
  }
})
