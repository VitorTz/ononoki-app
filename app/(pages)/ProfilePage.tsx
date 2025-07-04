import Button from '@/components/buttons/Button'
import ReturnButton from '@/components/buttons/ReturnButton'
import ProfileImageBig from '@/components/ProfileImageBig'
import ReadingSummaryComponent from '@/components/ReadingSummary'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import { Colors } from '@/constants/Colors'
import { useProfileState } from '@/store/profileState'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'


const ProfilePage = () => {

    const { profile } = useProfileState()    

    const mail = () => {

    }

    const addFriend = () => {

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
                        <Button 
                            iconName='person-add' 
                            onPress={addFriend} 
                            iconColor={Colors.backgroundColor} 
                            style={styles.button}
                        />
                    </Row>
                    {profile?.bio && <Text style={AppStyle.textRegular} >{profile?.bio}</Text>}
                    <ReadingSummaryComponent user_id={profile!.user_id} />
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