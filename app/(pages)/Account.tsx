import ReturnButton from '@/components/buttons/ReturnButton'
import ChangeProfileInfoForm from '@/components/form/ChangeProfileInfoForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { uploadImageToSupabase } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { decode } from 'base64-arraybuffer'
import { Image } from 'expo-image'
import React from 'react'
import { Alert, PermissionsAndroid, Platform, Pressable, SafeAreaView, StyleSheet, View } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'



const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const grantedReadMediaImages = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: "Permissão de Galeria",
          message: "Este aplicativo precisa de acesso à sua galeria para selecionar fotos.",
          buttonNeutral: "Perguntar Depois",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      const grantedReadExternalStorage = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Permissão de Galeria",
          message: "Este aplicativo precisa de acesso à sua galeria para selecionar fotos.",
          buttonNeutral: "Perguntar Depois",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      if (
        grantedReadExternalStorage === PermissionsAndroid.RESULTS.GRANTED &&
        grantedReadMediaImages === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("Permissão concedida");
        return true;
      } else {
        console.log("Permissão negada");
        Alert.alert("Permissão Necessária", "Por favor, conceda acesso à galeria nas configurações do seu dispositivo para selecionar uma imagem.");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS permissions are handled via Info.plist and typically prompt automatically
};


const selectAndCropImage = async () => {
  if (!(await requestGalleryPermission())) {
    return null;
  }

  try {
    const image = await ImagePicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: 256,
      height: 256,
      forceJpg: true,           // Garante que a saída seja JPG para uploads consistentes
      includeBase64: true,      // CRUCIAL para upload no Supabase
      compressImageQuality: 0.8, // Opcional: comprime a qualidade da imagem (0 a 1)
      writeTempFile: false      // Otimização: não escreve arquivo temporário no disco se base64 for incluído
    });

    console.log('Imagem selecionada e cortada:', image);
    return image; // Este objeto conterá path, mime, e data (base64)
  } catch (error: any) {
    if (error.message.includes('User cancelled') || error.message.includes('cancelled')) {
      console.log('Seleção de imagem cancelada pelo usuário.');
    } else if (error.message.includes('permission')) {
      Alert.alert("Erro de Permissão", "O aplicativo não tem acesso às suas fotos. Por favor, vá para as configurações e permita o acesso."); [7]
    } else {
      console.error('Erro ao selecionar ou cortar imagem:', error);
      Alert.alert("Erro", "Ocorreu um erro ao processar a imagem. Tente novamente.");
    }
    return null;
  }
};


const handleUpload = async (image: any, user_id: string) => {
  if (!image ||!image.data ||!image.mime) {
    console.warn('Dados da imagem inválidos.');
    return;
  }

  const filename = `avatars/${user_id}-${Date.now()}.jpeg`;
  const mimeType = image.mime;
  const base64Data = image.data;
  const arrayBuffer = decode(base64Data);

  try {
    const uploadResult = await uploadImageToSupabase(arrayBuffer, filename, 'profile-pictures', mimeType);
    console.log(uploadResult)
  } catch (error) {
    console.log(error)
  }
};

const Account = () => {

  const { user } = useAuthState()
  
  const changeUserProfileImage = async () => {
    if (!user) { return }
    const image: any = await selectAndCropImage()
    await handleUpload(image, user.user_id)
  }
  
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' titleColor={Colors.accountColor} >
        <ReturnButton color={Colors.accountColor} />
      </TopBar>
      <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
        <View style={{marginBottom: 20}} >
          <Image
            source={user!.image_url} 
            style={{width: 128, height: 128}}
            contentFit='cover' />
          <Pressable onPress={changeUserProfileImage} style={style.brush} >
            <Ionicons name='brush-outline' size={20} color={Colors.backgroundColor} />
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
