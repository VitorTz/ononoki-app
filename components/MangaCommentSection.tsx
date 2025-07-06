import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Comment, Manga } from '@/helpers/types'
import { hp } from '@/helpers/util'
import { spCreateComment, spDeleteComment, spGetComments, spVoteComment } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyle'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Toast from 'react-native-toast-message'
import Column from './util/Column'


const PAGE_LIMIT = 30

interface CommentComponentProps {
    comment: Comment
    deleteComment: (comment_id: number) => any
}


const CommentComponent = ({comment, deleteComment}: CommentComponentProps) => {

    const { session } = useAuthState()
    const [numLikes, setNumLikes] = useState(comment.comment_total_likes)
    const [loading, setLoading] = useState(false)
    const [userVote, setUserVote] = useState<boolean | null>(comment.user_vote_state)
    const userIsOwner = session ? session.user.id == comment.author_user_id : false
    const upColor = userVote == true ? Colors.orange : Colors.white
    const downColor = userVote == false ? Colors.orange : Colors.white
    
    
    const vote = async (type: 'Up' | "Down") => {
        if (!session) {
            Toast.show({text1: "You are not logged!", type: 'info'})
            return
        }

        setLoading(true)

        const isUpVote = 'Up' === type

        const { success, newVoteCount } = await spVoteComment(
            session.user.id, 
            comment.comment_id, 
            isUpVote
        )
        
        if (success && newVoteCount !== null) {
            setNumLikes(newVoteCount)
            setUserVote(prev => prev === isUpVote ? null : isUpVote)
        } else {
            Toast.show({text1: "Sorry, could not computate your vote", type: "error"})
        }

        setLoading(false)
    }    

    return (
        <View style={styles.commentContainer} >
            <Column style={{height: '100%'}} >
                <Image 
                    source={comment.author_avatar_url}
                    style={styles.commentImage} 
                    contentFit='cover' />
            </Column>
            <Column style={{gap: 10}} >
                <Text style={[AppStyle.textHeader, {fontSize: 20}]} >{comment.author_username}</Text>
                <Text style={[AppStyle.textRegular, {maxWidth: '80%'}]}>{comment.comment_text}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: "flex-start"}} >
                    {
                        loading ?

                        <ActivityIndicator size={32} color={Colors.white} /> :

                        <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "flex-start"}} >
                            <Pressable onPress={() => vote("Up")} hitSlop={AppConstants.hitSlop} >
                                <Ionicons name='arrow-up' size={18} color={upColor} />
                            </Pressable>
                            <Text style={AppStyle.textRegular}>{numLikes}</Text>
                            <Pressable onPress={() => vote("Down")} hitSlop={AppConstants.hitSlop} >
                                <Ionicons name='arrow-down' size={18} color={downColor} />
                            </Pressable>
                            {
                                userIsOwner &&
                                <Pressable onPress={() => deleteComment(comment.comment_id)} style={{marginLeft: 10}} hitSlop={AppConstants.hitSlop} >
                                    <Ionicons name='trash-sharp' size={18} color={Colors.white} />
                                </Pressable>
                            }
                        </View>
                    }
                </View>
            </Column>
        </View>
    )
}


interface CommentListProps {
    loading: boolean
    comments: Comment[]
    deleteComment: (comment_id: number) => any
}


const CommentList = ({loading, comments, deleteComment}: CommentListProps) => {    
    if (loading) {
        return (
            <ActivityIndicator size={32} color={Colors.white} />
        )
    }

    return (
        <View style={styles.commentListContainer} >
            {
                comments.map(item => <CommentComponent deleteComment={deleteComment} key={item.comment_id} comment={item} />)
            }
        </View>
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
            Toast.show({text1: "Your must be logged!", type: "error", position: 'top'})
            return
        }

        setLoading(true)
            const commentText = text.trim()

            if (
                commentText.length > AppConstants.COMMENT_MAX_LENGTH || 
                commentText.length < AppConstants.COMMENT_MIN_LENGTH
            ) {
                Toast.show({
                    text1: `Max ${AppConstants.COMMENT_MAX_LENGTH} and min ${AppConstants.COMMENT_MIN_LENGTH} characters`,
                    type: "info", 
                    position: 'top'
                })
                setLoading(false)
                return
            }            

            const comment_id: number | null = await spCreateComment(
                session.user.id,
                commentText, 
                manga_id
            )

            if (!comment_id) {
                Toast.show({text1: "Could not upload comment!", type: "error", position: 'top'})
                Keyboard.dismiss()
                setLoading(false)
                return
            }

            Keyboard.dismiss()
            setText('')
            const c: Comment = {
                user_vote_state: null,
                author_username : user.username,
                author_avatar_url: user.profile_image_url,
                author_user_id: user.user_id,
                comment_id,
                comment_text: commentText,
                comment_total_likes: 0,
                manga_id,
                parent_comment_id: null,
                created_at: Date().toString()
            }
            setComments(prev => [...[c], ...prev])            
        setLoading(false)
    }

    const clearText = () => {
        setText('')
    }

    if (!user || !session) {
        return (
            <View style={{width: '100%', gap: 20, alignItems: "center", justifyContent: "flex-start"}} >
                <Text style={AppStyle.error}>Would you like to post a comment? Please login or sign up first!</Text>
            </View>    
        )
    }

    return (
        <View style={{width: '100%', gap: 20, alignItems: "center", justifyContent: "flex-start"}} >            
            <View style={{ width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
                <Image source={user.profile_image_url} style={styles.image} contentFit='cover' />
                <Text style={[AppStyle.textHeader, {alignSelf: "flex-end", fontSize: 22}]}>{user!.username}</Text>
            </View>
            <View style={{width: '100%', flex: 1, gap: 20}} >
                <TextInput
                    placeholder='Write a comment...'
                    placeholderTextColor={Colors.white}
                    style={styles.input}
                    multiline={true}
                    textAlignVertical='top'
                    value={text}
                    onChangeText={setText}
                />                
                <View style={{flexDirection: 'row', gap: 20, alignItems: "center", justifyContent: "flex-end"}} >
                    {
                        text && 
                        <Pressable onPress={clearText} hitSlop={AppConstants.hitSlop} style={styles.sendCommentButton} >
                            <Ionicons name='close-circle-sharp' size={28} color={Colors.white} />
                        </Pressable>
                    }
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
    
    const { session } = useAuthState()
    const [loading, setLoading] = useState(false)
    const [hasResults, setHasResults] = useState(true)
    const page = useRef(0)

    const load = async () => {
        if (!hasResults) { return }
        setLoading(true)
        page.current += 1
        const c = await spGetComments(
            manga_id, 
            session ? session.user.id : null, 
            page.current * PAGE_LIMIT, 
            PAGE_LIMIT
        )
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

    if (!(hasResults && numComments >= PAGE_LIMIT && !loadingFirstComments)) {
        return <></>
    }

    if (loading) {
        return (
            <ActivityIndicator size={32} color={Colors.white} style={{alignSelf: "center"}} />
        )
    }

    return (
        <Pressable onPress={load} style={{backgroundColor: Colors.gray, padding: 10, borderRadius: 4, alignSelf: "center"}} >
            <Text style={AppStyle.textRegular}>Load more comments</Text>
        </Pressable>
    )    
}

interface MangaCommentSectionProps {
    manga: Manga
}


const MangaCommenctSection = ({manga}: MangaCommentSectionProps) => {
    
    const { session } = useAuthState()
    const [comments, setComments] = useState<Comment[]>([])
    const [laodingComments, setLoadComments] = useState(false)   

    const init = async () => {
        setLoadComments(true)
        spGetComments(manga.manga_id, session ? session.user.id : null)
            .then(v => {
                setComments([...v]); 
                setLoadComments(false)
            })
            .catch(e => {
                console.log("error MangaCommenctSection init", e)
                setComments([])
                setLoadComments(false)
            })
    }

    useEffect(
        () => {
            init()
        },
        [manga.manga_id]
    )

    const deleteComment = async (comment_id: number) => {
        const success = await spDeleteComment(comment_id)
        if (success) {
            setComments(prev => [...prev.filter((comt, index, arr) => comt.comment_id != comment_id)])
            Toast.show({text1: "Deleted!", type: "success"})
        }
    }

    return (        
        <View style={{width: '100%', gap: 20, marginTop: 40}} >
            <Text style={AppStyle.textHeader}>Comments</Text>
            {!laodingComments && <UserCommentBox manga_id={manga.manga_id} setComments={setComments} />}
            <CommentList deleteComment={deleteComment} loading={laodingComments} comments={comments} />
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
        alignSelf: "flex-start",
        borderRadius: 4
    },
    input: {
        padding: 10, 
        width: '100%', 
        borderRadius: 4, 
        height: hp(20), 
        backgroundColor: Colors.gray, 
        color: Colors.white, 
        fontFamily: "LeagueSpartan_400Regular", 
        fontSize: 18
    },
    commentContainer: {
        width: '100%', 
        gap: 20, 
        flexDirection: 'row', 
        alignItems: "center", 
        justifyContent: "flex-start"
    },
    commentImage: {
        width: 96, 
        height: 96, 
        alignSelf: "flex-start", 
        borderRadius: 4
    },
    commentListContainer: {
        width: '100%', 
        gap: 30, 
        alignItems: "center", 
        justifyContent: "flex-start"
    }
})