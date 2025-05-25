import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Comment, Manga } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { spCheckUserVote, spCreateComment, spGetComments, spVoteComment } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Toast from 'react-native-toast-message'


const PAGE_LIMIT = 30



interface CommentListProps {
    loading: boolean
    comments: Comment[]
}


const CommentComponent = ({comment}: {comment: Comment}) => {

    const { session } = useAuthState()

    const [numLikes, setNumLikes] = useState(comment.likes)
    const [loading, setLoading] = useState(false)

    const voteState = useRef({
        hasVoted: false,
        alredyChecked: false,
        votedUp: false
    })

    const checkVoteState = async () => {
        if (voteState.current.alredyChecked || !session) { return }
        await spCheckUserVote(session.user.id, comment.comment_id)
            .then(v => {
                voteState.current.hasVoted = v.voted; 
                voteState.current.alredyChecked = true
                voteState.current.votedUp = v.voteUp
            })
    }
    
    const vote = async (type: 'Up' | "Down") => {
        if (!session) {
            Toast.show({text1: "You are not logged!", type: 'info'})
            return
        }

        setLoading(true)
        await checkVoteState()

        if (
            voteState.current.hasVoted && 
            (type == 'Up' && voteState.current.votedUp) ||
            (type == 'Down' && !voteState.current.votedUp)
        ) {
            setLoading(false)
            return
        }

        const isUpVote = 'Up' === type
        
        const { success, newVoteCount } = await spVoteComment(
            session.user.id, 
            comment.comment_id, 
            isUpVote
        )

        if (success && newVoteCount) {
            setNumLikes(newVoteCount)
            voteState.current.hasVoted = true
            voteState.current.votedUp = isUpVote
        } else {
            Toast.show({text1: "Sorry, could not computate your vote", type: "error"})
        }

        setLoading(false)
    }

    return (
        <View style={{width: '100%', gap: 20, flexDirection: 'row', alignItems: "center", justifyContent: "flex-start"}} >            
            <Image 
                source={comment.image_url} 
                style={{width: 64, height: 64, alignSelf: "flex-start"}} 
                contentFit='cover' />
            <View style={{flex: 1, gap: 10}} >
                <Text style={AppStyle.textRegular} >{comment.username}</Text>
                <Text style={AppStyle.textRegular}>{comment.comment}</Text>
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "flex-start", gap: 20}} >
                    {
                        loading ?
                        <ActivityIndicator size={32} color={Colors.white} /> :
                        <>
                            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 10}} >
                                <Pressable onPress={() => vote("Up")} hitSlop={AppConstants.hitSlop} >
                                    <Ionicons name='arrow-up' size={18} color={Colors.green} />
                                </Pressable>
                                <Text style={AppStyle.textRegular}>{numLikes}</Text>
                                <Pressable onPress={() => vote("Down")} hitSlop={AppConstants.hitSlop} >
                                    <Ionicons name='arrow-down' size={18} color={Colors.neonRed} />
                                </Pressable>
                            </View>
                        </>
                    }
                </View>
            </View>            
        </View>
    )
}

const CommentList = ({loading, comments}: CommentListProps) => {    

    return (
        <>
        {
            loading ?
            <ActivityIndicator size={32} color={Colors.white} /> : 
            <View style={{width: '100%', gap: 30, alignItems: "center", justifyContent: "flex-start"}} >
                {
                    comments.map(item => <CommentComponent key={item.comment_id} comment={item} />)
                }
            </View>
        }
        </>
    )
}

interface UserCommentBoxProps {
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>
    manga_id: number    
}

const UserCommentBox = ({setComments, manga_id}: UserCommentBoxProps) => {

    const { user, session } = useAuthState()
    const [loading, setLoading] = useState(false)
    const [text, setText] = useState('')

    const sendComment = async () => {
        if (!user || !session) {
            Toast.show({text1: "Your must be logged!", type: "error"})
            return
        }

        setLoading(true)
            const t = text.trim()

            if (t.length > 1024 || t.length < 3) {
                Toast.show({text1: "Max 1024 characters and min 3 characters", type: "info"})
                setLoading(false)
                return
            }            

            const comment_id: number | null = await spCreateComment(session.user.id, t, manga_id)

            if (!comment_id) {
                Toast.show({text1: "Could not upload comment!", type: "error"})
                setLoading(false)
                return
            }

            setText('')
            Toast.show({text1: "Your comment has created!", type: "success"})
            const c: Comment = {
                username: user.username,
                image_url: user.image_url,
                comment_id,
                user_id: user.user_id,
                comment: t,
                likes: 1,
                manga_id,
                parent_comment_id: null,
                thread: []
            }
            setComments(prev => [...[c], ...prev])

            Keyboard.dismiss()
        setLoading(false)
    }

    const clearText = () => {
        setText('')
    }

    return (
        <View style={{width: '100%', gap: 20, alignItems: "center", justifyContent: "flex-start"}} >
            {
                user ? 
                <>
                    <View style={{ width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
                        <Image source={user.image_url} style={styles.image} contentFit='cover' />
                        <Text style={[AppStyle.textHeader, {alignSelf: "flex-end", fontSize: 22}]}>{user!.username}</Text>
                    </View>
                    <View style={{width: '100%', flex: 1, gap: 20}} >
                        <TextInput
                            placeholder='Write a comment...'
                            placeholderTextColor={Colors.white}
                            style={{padding: 10, width: '100%', borderRadius: 4, height: hp(20), backgroundColor: Colors.gray, color: Colors.white, fontFamily: "LeagueSpartan_400Regular", fontSize: 18}}
                            multiline={true}
                            textAlignVertical='top'
                            value={text}
                            onChangeText={setText}
                        />                
                        <View style={{flexDirection: 'row', gap: 20, alignItems: "center", justifyContent: "flex-end"}} >
                            <Pressable onPress={clearText} hitSlop={AppConstants.hitSlop} style={styles.sendCommentButton} >
                                <Ionicons name='close-circle-sharp' size={28} color={Colors.white} />
                            </Pressable>
                            {
                                loading ?
                                <View style={styles.sendCommentButton} >
                                    <ActivityIndicator size={28} color={Colors.white} />
                                </View> :
                                <Pressable onPress={sendComment} style={styles.sendCommentButton} hitSlop={AppConstants.hitSlop} >
                                    <Ionicons name='send-sharp' size={28} color={Colors.white} />
                                </Pressable>
                            }
                        </View>
                    </View>
                </> :

                <View style={{alignSelf: "flex-start"}} >
                    <Text style={AppStyle.error}>You need to be logged to comment</Text>
                </View>
            }
        </View>
    )
}


interface LoadMoreCommentsComponentProps {
    manga_id: number
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>
    loadingFirstComments: boolean
    numComments: number
}

const LoadMoreCommentsComponent = ({
    manga_id, 
    numComments, 
    loadingFirstComments, 
    setComments
}: LoadMoreCommentsComponentProps) => {
    
    const [loading, setLoading] = useState(false)
    const [hasResults, setHasResults] = useState(true)
    const page = useRef(0)

    const load = async () => {
        if (!hasResults) { return }
        setLoading(true)
        page.current += 1
        const c = await spGetComments(manga_id, page.current * PAGE_LIMIT, PAGE_LIMIT)
        if (c.length > 0) {
            setHasResults(true)
            setComments(prev => [...prev, ...c])
        } else {
            setHasResults(false)
        }
        if (c.length == 0) {
            Toast.show({text1: "No more comments", type: "info"})
        }
        setLoading(false)
    }

    return (
        <>
        {   
            hasResults && numComments >= PAGE_LIMIT && !loadingFirstComments &&
            <>
                {
                    loading ?
                    <ActivityIndicator size={32} color={Colors.white} style={{alignSelf: "center"}} /> :
                    <Pressable onPress={load} style={{backgroundColor: Colors.gray, padding: 10, borderRadius: 4, alignSelf: "center"}} >
                        <Text style={AppStyle.textRegular}>Load more comments</Text>
                    </Pressable>
                }
            </>
        }
        </>
    )
}

interface MangaCommentSectionProps {
    manga: Manga
}


const MangaCommenctSection = ({manga}: MangaCommentSectionProps) => {
    
    const [comments, setComments] = useState<Comment[]>([])
    const [laodingComments, setLoadComments] = useState(false)   

    const init = async () => {
        setLoadComments(true)
        spGetComments(manga.manga_id)
            .then(v => setComments([...v]))
            .then(v => setLoadComments(false))
    }

    useEffect(
        () => {
            init()
        },
        [manga.manga_id]
    )

    return (        
        <View style={{width: '100%', gap: 20, marginTop: 40}} >
            <Text style={AppStyle.textHeader}>Comments</Text>
            {!laodingComments && <UserCommentBox manga_id={manga.manga_id} setComments={setComments} />}
            <CommentList loading={laodingComments} comments={comments} />
            <LoadMoreCommentsComponent 
                loadingFirstComments={laodingComments} 
                numComments={comments.length} 
                manga_id={manga.manga_id} 
                setComments={setComments} />
            <View style={{width: '100%', height: hp(50)}} />
        </View>
    )
}

export default MangaCommenctSection

const styles = StyleSheet.create({
    sendCommentButton: {
        alignSelf: "flex-end"
    },
    image: {
        width: 32, 
        height: 32, 
        alignSelf: "flex-start"
    }
})