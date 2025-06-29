import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import Column from '@/components/util/Column'
import { Colors } from '@/constants/Colors'
import { DonateMethod } from '@/helpers/types'
import { spGetDonationMethods } from '@/lib/supabase'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Clipboard from 'expo-clipboard'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  Text,
  View
} from 'react-native'
import Toast from 'react-native-toast-message'


const DonateMethodComponent = ({donateMethod}: {donateMethod: DonateMethod}) => {

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(donateMethod.value);
    Toast.show({text1: "Copied to clipboard!", type: "success"})
  }

  const iconName = donateMethod.action == "copy" ? "copy-outline" : "globe-outline"

  const openUrl = async () => {
    try {
        await Linking.openURL(donateMethod.value)
    } catch (error) {
      Toast.show({text1: "Unable to open the browser", type: "error"})
    }
  };

  const onPress = async () => {
    switch (donateMethod.action) {
      case "copy":
        await copyToClipboard()
        break
      case "link":
        await openUrl()
        break
      default:
        break
    }
  }

  return (
    <Pressable onPress={onPress} style={{maxWidth: '100%', padding: 10, borderRadius: 4, backgroundColor: Colors.donateColor, gap: 10}} >
      <Column style={{width: "100%", flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "space-between"}} >
        <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]}>{donateMethod.method}</Text>
        <Ionicons name={iconName as any} size={28} color={Colors.backgroundColor} />
      </Column>
      <Text adjustsFontSizeToFit={true} style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{donateMethod.value}</Text>
    </Pressable>
  )
}


const Donate = () => {  

  const [donateMethods, setDonateMethods] = useState<DonateMethod[]>([])
  const [loading, setLoading] = useState(false)

  const init = useCallback(async () => {
    setLoading(true)
    await spGetDonationMethods().then(values => setDonateMethods(values))
    setLoading(false)
  }, [])

  useEffect(() => {
    init()
  }, [])

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate' titleColor={Colors.donateColor} >
            <ReturnButton color={Colors.donateColor} />
        </TopBar>

        {
          loading ?
          
          <ActivityIndicator size={32} color={Colors.white} /> 
          
          :

          <View style={{flex: 1, gap: 20}} >
            {
              donateMethods.map((item, index) => <DonateMethodComponent key={index} donateMethod={item} />)
            }
          </View>
        }

    </SafeAreaView>
  )
}

export default Donate
