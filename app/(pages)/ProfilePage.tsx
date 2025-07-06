import AddFriendButton from '@/components/buttons/AddFriendButton'
import Button from '@/components/buttons/Button'
import ReturnButton from '@/components/buttons/ReturnButton'
import ProfileImageBig from '@/components/ProfileImageBig'
import ReadingSummaryComponent from '@/components/ReadingSummary'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { useAuthState } from '@/store/authState'
import { useProfileState } from '@/store/profileState'
import { AppStyle } from '@/styles/AppStyle'
import { router } from 'expo-router'
import React from 'react'
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'


const ProfilePage = () => {

    const { user } = useAuthState()
    const { profile } = useProfileState()    

    const mail = () => {

    } 

    const openMal = async () => {
        if (profile && profile.mal_url) {
            try {
                await Linking.openURL(profile.mal_url)
            } catch (error) {
              Toast.show({text1: "Unable to open the browser", type: "error"})
            }
        }
    };

    if (!profile) {
        Toast.show({text1: "Invalid Profile", type: "error"})
        router.back()
        return
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title={`${profile!.username}'s Profile`} titleColor={Colors.peopleColor} >
                <ReturnButton color={Colors.peopleColor} />
            </TopBar>
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={'always'} >
                <View style={{flex: 1, gap: 20}} >
                    <ProfileImageBig 
                        image_url={profile!.profile_image_url} 
                        width={profile!.profile_image_width} 
                        height={profile!.profile_image_height} />
                    <Row style={{width: '100%', gap: 10}} >
                        <Button 
                            iconName='mail' 
                            onPress={mail} 
                            iconColor={Colors.backgroundColor} 
                            style={styles.button}
                        />
                        {
                            profile!.mal_url && 
                            <Pressable 
                                onPress={openMal} 
                                hitSlop={AppConstants.hitSlopLarge}
                                style={styles.button}
                                >
                                    <View>
                                        <Text style={[AppStyle.textHeader, {fontSize: 18, fontFamily: 'LeagueSpartan_700Bold', color: Colors.backgroundColor}]} >MAL</Text>
                                    </View>
                            </Pressable>
                        }
                    
                        <AddFriendButton 
                            user_id={user ? user.user_id : null} 
                            friend_id={profile.user_id}
                            style={styles.button}
                        />

                    </Row>
                    <ReadingSummaryComponent user_id={profile!.user_id} />
                    {profile?.bio && <Text style={AppStyle.textRegular} >{profile?.bio}</Text>}
                    <View style={{height: 80}} />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ProfilePage

const styles = StyleSheet.create({
    button: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        borderRadius: 4,
        backgroundColor: Colors.peopleColor
    }
})