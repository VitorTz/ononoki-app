import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, Session } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import Config from 'react-native-config';
import { Chapter, ChapterImage, Manga } from "../helpers/types";


const supabaseUrl = Config.SUPABASE_URL as any
const supabaseKey = Config.SUPABASE_ANON as any


export const supabase = createClient(supabaseUrl, supabaseKey as any, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
});


AppState.addEventListener(
    'change', (state) => {  
        if (state === 'active') {    
            supabase.auth.startAutoRefresh()  
        } else {    
            supabase.auth.stopAutoRefresh()
        }
    }
)


export async function spGetSession(): Promise<Session | null> {
    const { data: {session} } = await supabase.auth.getSession()
    return session
}


export async function spGetMangas(): Promise<Manga[]> {
    const { data, error } = await supabase
        .from("mv_mangas")
        .select("*")
    
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
        .select("chapter_id, manga_id, chapter_num, created_at")
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