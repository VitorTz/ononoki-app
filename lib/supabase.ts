import { AppConstants } from "@/constants/AppConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, createClient, PostgrestError, Session } from '@supabase/supabase-js';
import { AppRelease, Chapter, ChapterImage, Comment, DonateMethod, Manga, MangaCollection, OnonokiUser, ReadingSummary } from "../helpers/types";

// RLS
const supabaseUrl = "https://hfflwodueiqktdhmvfzd.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZmx3b2R1ZWlxa3RkaG12ZnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDk5ODMsImV4cCI6MjA2MzIyNTk4M30.aQyHEIlQUAGvxI1anhz21h_cog2rNCO6m4gOaky9ebQ"


export const supabase = createClient(supabaseUrl, supabaseKey as any, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
});


export async function spGetSession(): Promise<Session | null> {
    const { data: {session} } = await supabase.auth.getSession()
    return session
}

export async function spUpdateUserLastLogin(user_id: string) {
    const { error } = await supabase
        .from("users")
        .update({'last_login_at': 'now()'})
        .eq("user_id", user_id)
    
    if (error) {
        console.log("error spUpdateUserLastLogin", error)
    }
}


export async function spFetchUser(
    user_id: string, 
    update_login_time: boolean = true
): Promise<OnonokiUser | null> {

    const { data, error } = await supabase
        .from("users")
        .select("user_id, username, bio, profile_image_url, profile_image_width, profile_image_height")
        .eq("user_id", user_id)
        .single()

    if (error) {
        console.log("error spFetchUser", error)
        return null
    }

    if (!data) {
        console.log("no user found", user_id)
        return null
    }

    if (update_login_time) {
        spUpdateUserLastLogin(user_id)
    }

    return data
}


export async function spGetMangas(): Promise<Manga[]> {
    const { data, error } = await supabase.from("mv_mangas").select("*")
    
    if (error) {
        console.log("error spGetManhwas", error)
        return []
    }
    
    return data
}


export async function spFetchUserReadingStatus(user_id: string): Promise<{manga_id: number, status: string}[]> {
    const { data, error } = await supabase
        .from('reading_status')
        .select("manga_id, status")
        .eq("user_id", user_id)

    if (error) {
        console.log("error spFetchUserReadingStatus", error)
        return []
    }

    return data
}


export async function spUpdateMangaViews(p_manga_id: number) {
    const { error } = await supabase
        .rpc('increment_manga_views', { p_manga_id  });

    if (error) {
        console.error('error spUpdateMangaViews', error);
        return null;
    }  
}


export async function spFetchChapterList(manga_id: number): Promise<Chapter[]> {
    
    const { data, error } = await supabase
        .from("chapters")
        .select("chapter_id, manga_id, chapter_name, chapter_num, created_at")
        .eq("manga_id", manga_id)
        .order("chapter_num", {ascending: true})

    if (error) {
        console.log("error spFetchChapterList", error)
        return []
    }

    return data
}


export async function spUpdateMangaReadingStatus(
    user_id: string,
    manga_id: number, 
    status: string
) {      
    const { error } = await supabase
        .from("reading_status")
        .upsert({user_id, manga_id, status})

    if (error) {
        console.log("error spUpdateManhwaReadingStatus", error)
    }
}


export async function spReportBug(title: string, descr: string | null, bug_type: string): Promise<boolean> {
    const { error } = await supabase
        .from("bug_reports")
        .insert([{title, descr, bug_type}])
    
    if (error) {
        console.log("error spReportBug", error)
        return false
    }
    return true
}


export async function spFetchChapterImages(chapter_id: number): Promise<ChapterImage[]> {
    const { data, error } = await supabase
        .from("chapter_images")
        .select("image_url, width, height")
        .eq("chapter_id", chapter_id)
        .order('index', {ascending: true})

    if (error) {
        console.log("error spFetchChapterImages", error)
        return []
    }

    return data
}


export async function spGetReleases(): Promise<AppRelease[]> {
    const { data, error } = await supabase
        .from("releases")
        .select("release_id, version, url, descr, created_at")
        .order("created_at", {ascending: false})
        
    if (error) { 
        console.log("error spGetAllAppVersions", error)
        return [] 
    }    

    return data as AppRelease[]
}


export async function spRequestManga(manga: string, message: string | null) {
    const { error } = await supabase
        .from("manga_requests")
        .insert([{manga, message}])

    if (error) {
        console.log("error spRequestManga")
    }
}


export async function spCreateUser(
    email: string,
    password: string, 
    username: string,
    bio: string | null = null
): Promise<{
    user: OnonokiUser | null, 
    session: Session | null,
    error: AuthError | null
}> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, bio: bio != '' ? bio : null } }
    })

    if (error) {
        console.log("error spCreateUser", error)
        return {user: null, session: null, error}
    }    

    const user = await spFetchUser(data.session!.user.id)

    return {user, error, session: data.session}
}


export async function spGetDonationMethods(): Promise<DonateMethod[]> {
    const { data, error } = await supabase
        .from("donate_methods")
        .select("method, value, action")

    if (error) {
        console.log("error spGetDonationMethods", error)
        return []
    }

    return data
}


export async function spCreateComment(
    user_id: string, 
    comment: string,
    manga_id: number, 
    parent_comment_id: string | null = null
): Promise<number | null> {
    
    const { data, error } = await supabase
        .from("comments")
        .insert([{user_id, comment, manga_id, parent_comment_id}])
        .select("comment_id")
        .single()

    if (error) {
        console.log("error spCreateComment", error)
        return null
    }

    return data.comment_id
}


export async function spGetComments(
    p_manga_id: number, 
    p_requesting_user_id: string | null = null,
    p_offset: number = 0,
    p_limit: number = 30
): Promise<Comment[]> {
    const { data, error } = await supabase
        .rpc(
            "get_manga_comments_with_user_votes", 
            { p_manga_id, p_requesting_user_id, p_offset,p_limit }
        )
    
    if (error) {
        console.log("error spGetComments", error)
        return []
    }

    return data as Comment[]    

}


export async function spCheckUserVote(
    user_id: string, 
    comment_id: number
): Promise<{voted: boolean, voteUp: boolean}> {
    const { data, error } = await supabase
        .from("comment_likes")
        .select("vote_up")
        .eq("user_id", user_id)
        .eq("comment_id", comment_id)
        
    if (error) {
        console.log("error spCheckUserVote", error)
        return {voted: false, voteUp: false}
    }    

    return {
        voted: data && data.length != 0, 
        voteUp: data && data.length > 0 && data[0].vote_up
    }
}


export async function spVoteComment(
    p_user_id: string,
    p_comment_id: number,
    p_vote: boolean
): Promise<{success: boolean, newVoteCount: number | null}> {
    const { data, error } = await supabase
        .rpc("handle_comment_vote", { p_user_id, p_comment_id, p_vote })

    if (error) {
        console.log("error dbVoteComment", error)
        return {success: false, newVoteCount: null}
    }    

    return {success: true, newVoteCount: data}
}


export async function spSearchManga(
    p_search_text: string,
    p_min_score: number = 0.30,
    p_offset: number = 0,
    p_limit: number=  30
): Promise<Manga[]> {
    const { data, error } = await supabase
        .rpc("search_mangas", {p_search_text, p_min_score, p_offset, p_limit})

    if (error) {
        console.log("error spSearchManga", error)
        return []
    }

    return data as Manga[]
}


export async function spDeleteComment(comment_id: number): Promise<boolean> {
    const { error } = await supabase
        .from("comments")
        .delete()
        .eq("comment_id", comment_id)

    if (error) {
        console.log("error spDeleteComment", error)
        return false
    }
    return true
}


export async function spChangeUsername(user_id: string, username: string): Promise<PostgrestError | null> {
    const { error } = await supabase
        .from("users")
        .update({username})
        .eq("user_id", user_id)
    return error
}


export async function spChangeUsernameAndBio(
    user_id: string, 
    username: string, 
    bio: string | null
): Promise<PostgrestError | null> {
    const { error } = await supabase
        .from("users")
        .update({username, bio})
        .eq("user_id", user_id)
    return error
}


export async function spSetUserProfileImageUrl(
    user_id: string, 
    profile_image_url: string,
    profile_image_width: number,
    profile_image_height: number
): Promise<PostgrestError | null> {
    const { error } = await supabase
        .from("users")
        .update({profile_image_url, profile_image_width, profile_image_height})
        .eq("user_id", user_id)
    return error
}


export async function spFetchMangaCollections(p_offset: number = 0, p_limit: number | null = 30): Promise<MangaCollection[]> {
    let q = supabase
        .from("collections")
        .select("*")
        .order("created_at", {ascending: false})
    
    if (p_limit) {
        q = q.range(p_offset * p_limit, (p_offset + 1) * p_limit)
    }

    const { data, error } = await q
    
    if (error) {
        console.log(error)
        return []
    }
        
    return data as MangaCollection[]
}


export async function spFetchMangasByCollection(p_collection_id: number): Promise<Manga[]> {
    const { data, error } = await supabase
        .rpc("get_mangas_by_collection", {p_collection_id})

    if (error) {
        console.log("error spFetchMangasByCollection", error)
        return []
    }

    return data as Manga[]
}


export async function spUpdateCollectionViews(p_collection_id: number) {
    const { error } = await supabase
        .rpc('increment_collection_views', {p_collection_id})

    if (error) {
        console.log("error spUpdateCollectionViews", error)
    }
}


export async function spFetchUsers(
    p_ignore_user: string | null, 
    p_username: string | null = null,
    p_offset: number = 0, 
    p_limit: number = 30
): Promise<OnonokiUser[]> {
    const { data, error } = await supabase
        .rpc("get_users", {p_ignore_user, p_username, p_offset, p_limit})

    if (error) {
        console.log("error spFetchUsers", error)
        return []
    }

    return data
}


export async function spFetchUserReadingStatusSummary(
    p_user_id: string
): Promise<ReadingSummary[]> {

    const { data, error } = await supabase
        .rpc("get_user_reading_status_summary", {p_user_id})

    if (error) {
        console.log("error spFetchUserReadingStatusSummary", error)
        return AppConstants.READING_STATUS_ORDER.map(i => {return {status: i, total: 0}})
    }

    return data
}