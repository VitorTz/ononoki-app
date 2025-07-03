

export type Manga = {
    manga_id: number
    title: string
    descr: string
    cover_image_url: string
    status: "OnGoing" | "Completed"
    color: string
    updated_at: string
    views: number
    rating: number | null        
    genres: Genre[]
    authors: MangaAuthor[]
    chapters: Chapter[]
    mal_url: string
}

export type RatingRegister = {
    rating: number
    totalRatings: number
    userRating: number | null
}


export type ChapterImage = {
    image_url: string
    width: number
    height: number
}


export type MangaGenre = {
    manga_id: number
    genre_id: number
    genre: string
}

export type Author = {
    author_id: number
    name: string
    role: string
}

export type MangaAuthor = {
    author_id: number
    manga_id: number
    role: string
    name: string
}


export type Genre = {
    genre: string
    genre_id: number
}

export type OnonokiUser = {
    username: string
    user_id: string
    bio: string | null
    profile_image_url: string
    profile_image_width: number
    profile_image_height: number
}


export type ChapterReadLog = {
  chapters: Set<number>,
  cover_image_url: string,
  manga_id: number,
  title: string,
  last_readed_at: Date
  color: string
}


export type DonateMethod = {
    method: string
    value: string
    action: string
}


export type AppRelease = {
    release_id: number
    version: string
    url: string
    descr: string | null
    created_at: string
}


export type Chapter = {
    chapter_id: number
    manga_id: number
    chapter_name: string
    chapter_num: number
    created_at: string
}


export type Comment = {
    comment_id: number
    manga_id: number
    parent_comment_id: number | null
    comment_text: string
    created_at: string
    author_user_id: string
    author_username: string
    author_avatar_url: string
    comment_total_likes: number
    user_vote_state: boolean | null
}

export type MangaCollection = {
    collection_id: number
    title: string
    descr: string | null
}

export type ReadingSummary = {
    status: string
    total: number
}