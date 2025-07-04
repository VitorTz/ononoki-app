import { convertStringListToSet, secondsSince } from '@/helpers/util';
import * as SQLite from 'expo-sqlite';
import { AppRelease, Author, Chapter, ChapterReadLog, Genre, Manga, MangaAuthor, MangaGenre } from '../helpers/types';
import { spFetchUserReadingStatus, spGetMangas, spGetReleases } from "./supabase";


export async function dbMigrate(db: SQLite.SQLiteDatabase) {
    console.log("[DATABASE MIGRATION START]")
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;      

      CREATE TABLE IF NOT EXISTS app_info (
          name TEXT NOT NULL PRIMARY KEY,
          value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS update_history (
          name TEXT NOT NULL PRIMARY KEY,
          refresh_cycle INTEGER,
          last_refreshed_at TIMESTAMP DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS genres (
          genre_id INTEGER PRIMARY KEY,
          genre TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS authors (
          author_id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS mangas (
          manga_id INTEGER PRIMARY KEY,
          title TEXT NOT NULL UNIQUE,
          descr TEXT NOT NULL,
          cover_image_url TEXT NOT NULL,
          status TEXT NOT NULL,
          color TEXT NOT NULL,
          rating DECIMAL(2, 1) DEFAULT NULL,
          views INTEGER NOT NULL DEFAULT 0,
          mal_url TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS manga_authors (
          manga_author_id INTEGER AUTO_INCREMENT,
          author_id INTEGER NOT NULL,
          manga_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          CONSTRAINT manga_authors_pkey PRIMARY KEY (manga_id, author_id, role),          
          CONSTRAINT manga_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES authors (author_id) ON UPDATE CASCADE ON DELETE CASCADE,
          CONSTRAINT manga_authors_manga_id_fkey FOREIGN KEY (manga_id) REFERENCES mangas (manga_id) ON UPDATE CASCADE ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS manga_genres (
          genre_id INTEGER NOT NULL,
          manga_id INTEGER NOT NULL,
          CONSTRAINT manga_genres_pkey PRIMARY KEY (manga_id, genre_id),
          CONSTRAINT manga_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES genres (genre_id) ON UPDATE CASCADE ON DELETE CASCADE,        
          CONSTRAINT manga_genres_manga_id_fkey FOREIGN KEY (manga_id) REFERENCES mangas (manga_id) ON UPDATE CASCADE ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS chapters (
          chapter_id INTEGER PRIMARY KEY,
          manga_id INTEGER,
          chapter_num INTEGER NOT NULL,
          chapter_name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (manga_id) REFERENCES mangas(manga_id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reading_status (        
          manga_id INTEGER NOT NULL PRIMARY KEY,
          status TEXT NOT NULL,
          updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_reading_status_manga FOREIGN KEY (manga_id) REFERENCES mangas (manga_id) ON UPDATE CASCADE ON DELETE CASCADE
      );    

      CREATE TABLE IF NOT EXISTS reading_history (
          manga_id    INTEGER NOT NULL,      
          chapter_id   INTEGER NOT NULL,
          chapter_num  INTEGER NOT NULL,
          readed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY  (manga_id, chapter_id),              
          FOREIGN KEY  (manga_id) REFERENCES mangas (manga_id) ON UPDATE CASCADE ON DELETE CASCADE,
          FOREIGN KEY  (chapter_id) REFERENCES chapters (chapter_id) ON UPDATE CASCADE ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS app_releases (
        release_id INTEGER PRIMARY KEY,
        version TEXT NOT NULL,
        url TEXT NOT NULL,
        descr TEXT,
        created_at TIMESTAMP NOT NULL
      );      

      CREATE INDEX IF NOT EXISTS idx_chapters_manga_id ON chapters(manga_id);
      CREATE INDEX IF NOT EXISTS idx_ma_manga_id ON manga_authors(manga_id);
      CREATE INDEX IF NOT EXISTS idx_mangas_status ON mangas(status);
      CREATE INDEX IF NOT EXISTS idx_mangas_rating ON mangas(rating);
      CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
      CREATE INDEX IF NOT EXISTS idx_chapters_manga_num ON chapters(manga_id, chapter_num DESC);
      CREATE INDEX IF NOT EXISTS idx_reading_status_manga_id_status ON reading_status (manga_id, status);
      CREATE INDEX IF NOT EXISTS idx_reading_history_updated ON reading_history(manga_id, chapter_num, readed_at DESC);

      INSERT OR REPLACE INTO 
        app_info (name, value)
      VALUES 
        ('version', 'v1.0.0');
      
      INSERT INTO
        app_info (name, value)
      VALUES
        ('read_mode', 'List')        
      ON CONFLICT (name)
      DO NOTHING;

      INSERT INTO
          update_history (name, refresh_cycle)
      VALUES
        ('server', 60 * 60 * 2),
        ('client', 42)
      ON CONFLICT 
        (name)
      DO UPDATE SET 
        refresh_cycle = EXCLUDED.refresh_cycle;
    `
    ).catch(error => console.log("DATABASE MIGRATION ERROR", error));
    console.log("[DATABASE MIGRATION END]")
}


export async function dbClearTable(db: SQLite.SQLiteDatabase, name: string) {
    await db.runAsync(
      `DELETE FROM ${name};`,
      [name]
    ).catch(error => console.log("error dbClearTablError", name, error))
}


export async function dbClearDatabase(db: SQLite.SQLiteDatabase) {
    await db.runAsync('DELETE FROM mangas;').catch(error => console.log("error dbClearDatabase mangas", error))
    await db.runAsync('DELETE FROM chapters;').catch(error => console.log("error dbClearDatabase chapters", error))
    await db.runAsync('DELETE FROM genres;').catch(error => console.log("error dbClearDatabase genres", error))
    await db.runAsync('DELETE FROM app_releases;').catch(error => console.log("error dbClearDatabase app_releases", error))
    console.log("[DATABASE CLEARED]")
}


export async function dbListTables(db: SQLite.SQLiteDatabase) {
    const rows = await db.getAllAsync(`
        SELECT 
            name 
        FROM 
            sqlite_master 
        WHERE 
            type='table' AND name NOT LIKE 'sqlite_%';`
    ).catch(error => console.log("error dbListTables", error));

    if (rows) {
        rows.forEach(item => console.log(item))
    }
}


export async function dbReadlAll<T>(db: SQLite.SQLiteDatabase, name: string): Promise<T[]> {
    const rows = await db
        .getAllAsync(`SELECT * FROM ${name};`)
        .catch(error => console.log(`error dbReadlAll ${name}`, error));

    return rows ? rows as T[] : []  
}


export async function dbListTable(db: SQLite.SQLiteDatabase, name: string) {
    const rows = await db
        .getAllAsync(`SELECT * FROM ${name};`, [name])
        .catch(error => console.log(`error dbListTable ${name}`, error));

    if (rows) {
        rows.forEach(item => console.log(item))
    }
}


export async function dbCheckSecondsSinceLastRefresh(
  db: SQLite.SQLiteDatabase, 
  name: string
): Promise<number> {
    const row = await db.getFirstAsync<{
        last_refreshed_at: string,
        refresh_cycle: number
    }>(`
        SELECT
            refresh_cycle,
            last_refreshed_at
        FROM
            update_history
        WHERE
            name = ?;
        `,
        [name]
    ).catch(error => console.log(`error dbCheckSecondsSinceLastRefresh ${name}`, error));

    if (!row) { 
        console.log(`could not read updated_history of ${name}`)
        return -1
    }

    const seconds = secondsSince(row.last_refreshed_at)
    return row.refresh_cycle - seconds
}


export async function dbSetLastRefresh(db: SQLite.SQLiteDatabase, name: string) {    
    await db.runAsync(
      `
        UPDATE 
            update_history 
        SET 
            last_refreshed_at = ?
        WHERE name = ?;
      `,
      [new Date().toString(), name]
    ).catch(error => console.log("error dbSetLastRefresh", name, error));
}

export async function dbShouldUpdate(db: SQLite.SQLiteDatabase, name: string): Promise<boolean> {
    const row = await db.getFirstAsync<{
        name: string,
        refresh_cycle: number,
        last_refreshed_at: string
    }>(
    `
        SELECT
            name,
            refresh_cycle,
            last_refreshed_at
        FROM
            update_history
        WHERE
            name = ?;
    `, [name]
    ).catch(error => console.log(`error dbShouldUpdate ${name}`, error));

    if (!row) { 
        console.log(`could not read updated_history of ${name}`)
        return false 
    }
    
    const seconds = row.last_refreshed_at ? secondsSince(row.last_refreshed_at) : -1
    const shouldUpdate = seconds < 0 || seconds >= row.refresh_cycle

    if (shouldUpdate) {
        const current_time = new Date().toString()
        await db.runAsync(
          `
            UPDATE 
                update_history 
            SET 
                last_refreshed_at = ?
            WHERE name = ?;
          `,
          [current_time, name]
        ).catch(error => console.log("error dbShouldUpdate update_historyerror", name, error));
        return true
    }

    return false
}


async function dbUpsertMangas(db: SQLite.SQLiteDatabase, mangas: Manga[]) {
  const placeholders = mangas.map(() => '(?,?,?, ?,?,?, ?, ?,?,?)').join(',');  
  const params = mangas.flatMap(i => [
    i.manga_id, 
    i.title, 
    i.descr,
    i.cover_image_url,
    i.status,
    i.color,
    i.views,
    i.rating,
    i.mal_url,
    i.updated_at,
  ]);  
  await db.runAsync(`    
    INSERT OR REPLACE INTO mangas (
        manga_id, 
        title,
        descr,
        cover_image_url,
        status,
        color,
        views,
        rating,
        mal_url,
        updated_at
    )
    VALUES ${placeholders};`, 
    params
  ).catch(error => console.log("error dbUpsertMangas", error));
}

async function dbUpsertReleases(db: SQLite.SQLiteDatabase, releases: AppRelease[]) {
  if (releases.length == 0) { return }
  const placeholders = releases.map(() => '(?,?,?,?,?)').join(',');
  const params = releases.flatMap(i => [
      i.release_id, 
      i.version, 
      i.url,
      i.descr,
      i.created_at
  ]);
  await db.runAsync(
    `
        INSERT OR REPLACE INTO app_releases (
            release_id, 
            version, 
            url,
            descr,
            created_at
        )
        VALUES ${placeholders};
    `, params
    ).catch(error => console.log("error dbUpsertReleases", error));
}

async function dbUpsertChapter(db: SQLite.SQLiteDatabase, chapters: Chapter[]) {
    const placeholders = chapters.map(() => '(?,?,?,?,?)').join(',');  
    const params = chapters.flatMap(i => [
        i.chapter_id, 
        i.manga_id, 
        i.chapter_num,
        i.created_at,
        i.chapter_name
    ]);
    await db.runAsync(
    `
        INSERT OR REPLACE INTO chapters (
            chapter_id, 
            manga_id, 
            chapter_num,
            created_at,
            chapter_name
        )
        VALUES ${placeholders};        
    `, params
    ).catch(error => console.log("error dbUpsertChapter", error));
}


async function dbUpsertGenres(db: SQLite.SQLiteDatabase, genres: Genre[]) {
  const placeholders = genres.map(() => '(?,?)').join(',');  
  const params = genres.flatMap(i => [
    i.genre_id, 
    i.genre    
  ]);
  await db.runAsync(
    `
      INSERT OR REPLACE INTO genres (
        genre_id, 
        genre
      ) 
      VALUES ${placeholders};
    `, 
    params
  ).catch(error => console.log("error dbUpsertGenres", error));
}


async function dbUpsertMangaGenres(db: SQLite.SQLiteDatabase, mangaGenres: MangaGenre[]) {
    const placeholders = mangaGenres.map(() => '(?,?)').join(',');  
    const params = mangaGenres.flatMap(i => [
        i.genre_id,
        i.manga_id
    ]);
    await db.runAsync(
    `
        INSERT OR REPLACE INTO manga_genres (
            genre_id,
            manga_id
        ) 
        VALUES ${placeholders};        
    `, params
    ).catch(error => console.log("error dbUpsertMangaGenres", error));
}


async function dbUpsertAuthors(db: SQLite.SQLiteDatabase, authors: Author[]) {
    const placeholders = authors.map(() => '(?,?,?)').join(',');  
    const params = authors.flatMap(i => [
        i.author_id,
        i.name,
        i.role
    ]);
    await db.runAsync(
      `
      INSERT OR REPLACE INTO authors (
          author_id, 
          name,
          role
      ) 
      VALUES ${placeholders};      
      `, 
      params
    ).catch(error => console.log("error dbUpsertAuthors", error));
}


async function dbUpsertMangaAuthors(db: SQLite.SQLiteDatabase, mangaAuthor: MangaAuthor[]) {
    const placeholders = mangaAuthor.map(() => '(?,?,?)').join(',');  
    const params = mangaAuthor.flatMap(i => [
        i.author_id,
        i.manga_id,
        i.role
    ]);
    await db.runAsync(
      `
        INSERT OR REPLACE INTO manga_authors (
            author_id, 
            manga_id,
            role
        ) 
        VALUES ${placeholders};
      `, 
      params
    ).catch(error => console.log("error dbUpsertMangaAuthors", error));
}


export async function dbUpdateDatabase(db: SQLite.SQLiteDatabase) {
    console.log('[UPDATING DATABASE]')
    const start = Date.now()

    const mangas: Manga[] = await spGetMangas()

    if (mangas.length == 0) { 
      return 
    }
    
    const releases: AppRelease[] = await spGetReleases()

    await dbClearDatabase(db)
    await dbUpsertMangas(db, mangas)    

    const chapters: Chapter[] = []
    const authors: Author[] = []
    const mangaAuthors: MangaAuthor[] = []
    const genres: Genre[] = []
    const mangaGenres: MangaGenre[] = []

    mangas.forEach(i => {
        i.chapters.forEach(c => chapters.push(c)); 
        i.genres.forEach(g => {genres.push(g); mangaGenres.push({...g, manga_id: i.manga_id})});
        i.authors.forEach(a => {authors.push(a); mangaAuthors.push({...a, manga_id: i.manga_id})});    
    })
  
    await dbUpsertReleases(db, releases)
    await dbUpsertChapter(db, chapters)
    await dbUpsertGenres(db, genres)
    await dbUpsertMangaGenres(db, mangaGenres)
    await dbUpsertAuthors(db, authors)
    await dbUpsertMangaAuthors(db, mangaAuthors)

    const end = Date.now()
    console.log("[DATABASE UPDATED]", (end - start) / 1000)
}


export async function dbGetUserReadHistory(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<ChapterReadLog[]> {
    const rows = await db.getAllAsync(
    `
        SELECT
            m.manga_id,
            m.title,
            m.cover_image_url,
            m.color,
            GROUP_CONCAT(rh.chapter_num, ', ') AS chapters,
            MAX(rh.readed_at) AS last_readed_at
        FROM 
            reading_history AS rh
        JOIN 
            mangas AS m
        ON 
            m.manga_id = rh.manga_id
        GROUP BY
            m.manga_id,
            m.title
        ORDER BY
            last_readed_at DESC
        LIMIT ?
        OFFSET ?;
    `, [p_limit, p_offset]
    ).catch(error => console.log("error dbUserReadHistory", error));

    return rows ? rows.map(
        (item: any) => {
            return {...item, chapters: convertStringListToSet(item.chapters)}
    }) : []
}


export async function dbGetMangaReadChapters(db: SQLite.SQLiteDatabase, manga_id: number): Promise<Set<number>> {
    const rows = await db.getAllAsync(
    `
      SELECT
        chapter_id
      FROM 
        reading_history
      WHERE 
        manga_id = ?;
    `,
    [manga_id]
  ).catch(error => console.log("error dbGetMangaReadChapters", error));

  
  if (!rows) {
    return new Set<number>()
  }
  
  return new Set<number>(rows.map((item: any) => item.chapter_id))
}


export async function dbReadRandomManga(
    db: SQLite.SQLiteDatabase, 
    p_limit: number = 1
): Promise<Manga[]> {
  const rows = await db.getAllAsync(
    'SELECT * FROM mangas ORDER BY RANDOM() LIMIT ?',
    [p_limit]
  ).catch(error => console.log("error dbReadRandomManhwa", error));
  
  return rows ? rows as Manga[]  : []
}

export async function dbGetRandomMangaId(db: SQLite.SQLiteDatabase): Promise<number | null> {
  const row = await db.getFirstAsync<{manga_id: number}>(
    'SELECT manga_id FROM mangas ORDER BY RANDOM() LIMIT 1'
  ).catch(error => console.log("error dbGetRandomMangaId", error));
  
  return row ? row.manga_id : null
}


export async function dbReadMangasByGenreName(
  db: SQLite.SQLiteDatabase,
  genre: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manga[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.*
      FROM 
        mangas m
      JOIN 
        manga_genres mg ON m.manga_id = mg.manga_id
      JOIN 
        genres g ON mg.genre_id = g.genre_id
      WHERE 
        g.genre = ?
      ORDER BY 
        m.views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [genre, p_limit, p_offset]
  ).catch(error => console.log("error dbReadMangasByGenreName", genre, error));

  return rows ? rows as Manga[]  : []
}


export async function dbReadMangasByGenreId(
  db: SQLite.SQLiteDatabase,
  genre_id: number,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manga[]> {  
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.*
      FROM 
        mangas m
      JOIN 
        manga_genres mg ON m.manga_id = mg.manga_id
      JOIN 
        genres g ON mg.genre_id = g.genre_id
      WHERE 
        g.genre_id = ?
      ORDER BY 
        m.views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [genre_id, p_limit, p_offset]
  ).catch(error => console.log("error dbReadMangasByGenreId", genre_id, error));

  return rows ? rows as Manga[]  : []
}


export async function dbReadManhwaGenres(
  db: SQLite.SQLiteDatabase,
  manga_id: number
): Promise<Genre[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        g.*
      FROM 
        genres g
      JOIN 
        manga_genres mg ON mg.genre_id = g.genre_id      
      WHERE 
        mg.manga_id = ?
      ORDER BY 
        g.genre;
    `,
    [manga_id]
  ).catch(error => console.log("error dbReadManhwaGenres", manga_id, error));

  return rows ? rows as Genre[] : []
}


export async function dbReadMangasByAuthorId(
  db: SQLite.SQLiteDatabase,
  author_id: number
): Promise<Manga[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.*
      FROM 
        mangas m
      JOIN 
        manga_authors ma ON m.manga_id = ma.manga_id
      WHERE 
        ma.author_id = ?
      ORDER BY 
        m.views DESC;
    `,
    [author_id]
  ).catch(error => console.log("error dbReadMangasByAuthorId", author_id, error));

  return rows ? rows as Manga[]  : []
}


export async function dbReadMangaAuthors(
  db: SQLite.SQLiteDatabase,
  manga_id: number
): Promise<MangaAuthor[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        a.*
      FROM 
        authors a
      JOIN 
        manga_authors ma ON a.author_id = ma.author_id
      WHERE 
        ma.manga_id = ?;
    `,
    [manga_id]
  ).catch(error => console.log("error dbReadMangaAuthors", manga_id, error));

  return rows ? rows as MangaAuthor[] : []
}


export async function dbReadMangaById(
  db: SQLite.SQLiteDatabase,
  manga_id: number
): Promise<Manga | null> {
  const row = await db.getFirstAsync(
    'SELECT * FROM mangas WHERE manga_id = ?;',
    [manga_id]
  ).catch(error => console.log("error dbReadMangaById", manga_id, error));

  return row ? row as Manga : null
}


export async function dbReadMangasOrderedByUpdateAt(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manga[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        * 
      FROM 
        mangas
      ORDER BY 
        updated_at DESC
      LIMIT ?
      OFFSET ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log("error dbReadMangasOrderedByUpdateAt", error));

  return rows ? rows as Manga[]  : []
}


export async function dbReadMangasOrderedByViews(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manga[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        *
      FROM
        mangas
      ORDER BY 
        views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log("error dbReadMangasOrderedByViews", error));

  return rows ? rows as Manga[]  : []
}


export async function dbReadLast3Chapters(
  db: SQLite.SQLiteDatabase,
  manga_id: number
): Promise<Chapter[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        *
      FROM
        chapters
      WHERE
        manga_id = ?
      ORDER BY 
        chapter_num DESC
      LIMIT 3;
    `,
    [manga_id]
  ).catch(error => console.log("error dbReadLast3Chapters", manga_id, error));

  return rows ? rows as Chapter[] : []
}


export async function dbReadGenres(db: SQLite.SQLiteDatabase): Promise<Genre[]> {
  const rows = await db.getAllAsync(
    'SELECT * FROM genres ORDER BY genre;'    
  ).catch(error => console.log("error dbReadGenres", error));
  return rows ? rows as Genre[] : []
}


export async function dbUpdateMangaViews(
  db: SQLite.SQLiteDatabase,
  manga_id: number
) {
  await db.runAsync(
    `
      UPDATE 
        mangas
      SET
        views = views + 1
      WHERE
        manga_id = ?
    `,
    [manga_id]
  ).catch(error => console.log("error dbUpdateMangaViews", manga_id, error))
}


export async function dbUpdateMangaReadingStatus(
  db: SQLite.SQLiteDatabase,
  manga_id: number, 
  status: string
) {  
  await db.runAsync(
    `
      INSERT INTO reading_status (
        manga_id,
        status
      )
      VALUES (?, ?)
      ON CONFLICT
        (manga_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP;
    `,
    [manga_id, status]
  ).catch(error => console.log("error dbUpdateManhwaReadingStatus", manga_id, status, error))
}


export async function dbPopulateReadingStatusTable(
  db: SQLite.SQLiteDatabase,
  user_id: string
) {
    const sts: {manga_id: number, status: string}[] = await spFetchUserReadingStatus(user_id)
    if (sts.length === 0) { return }

    const placeholders = sts.map(() => '(?,?)').join(',');  
    const params = sts.flatMap(i => [
        i.manga_id,
        i.status
    ]);

    await db.runAsync(
    `
        INSERT OR REPLACE INTO reading_status (
            manga_id, 
            status
        )
        VALUES ${placeholders};
    `, params
    ).catch(error => console.log("error dbPopulateReadingStatusTable", error));
}


export async function dbGetMangasByReadingStatus(
  db: SQLite.SQLiteDatabase,
  status: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manga[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        m.*
      FROM
        mangas m
      JOIN
        reading_status r
        on r.manga_id = m.manga_id
      WHERE
        r.status = ?
      ORDER BY 
        r.updated_at DESC
      LIMIT ?
      OFFSET ?;
    `,
    [status, p_limit, p_offset]
  ).catch(error => console.log("error dbGetMangasByReadingStatus", status, error));

  return rows ? rows as Manga[]  : []
}


export async function dbGetMangaReadingStatus(
  db: SQLite.SQLiteDatabase,
  manga_id: number
): Promise<string | null> {
  const row = await db.getFirstAsync<{status: string}>(
    "SELECT status FROM reading_status WHERE manga_id = ?", 
    [manga_id]
  ).catch(error => console.log("error dbGetMangaReadingStatus", manga_id, error));

  return row ? row.status : null
}


export async function dbUpsertReadingHistory(
  db: SQLite.SQLiteDatabase,
  manga_id: number, 
  chapter_id: number,
  chapter_num: number
) {
  await db.runAsync(
    `
      INSERT INTO reading_history (
        manga_id,
        chapter_id,
        chapter_num,
        readed_at
      )
      VALUES 
        (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT 
        (manga_id, chapter_id)
      DO UPDATE SET 
        readed_at = CURRENT_TIMESTAMP;
    `,
    [manga_id, chapter_id, chapter_num]
  ).catch(error => console.log("error dbUpsertReadingHistory", manga_id, chapter_id, chapter_num, error))
}


export async function dbSearchMangas(
  db: SQLite.SQLiteDatabase, 
  searchTerm: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manga[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        *
      FROM 
        mangas
      WHERE 
        title LIKE ? COLLATE NOCASE
      LIMIT ?
      OFFSET ?;
    `,
    [`%${searchTerm}%`, p_limit, p_offset]
  ).catch(error => console.log("error dbSearchMangas", searchTerm, error))
  return rows ? rows as Manga[] : []
}


export async function dbHasMangas(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{manga_id: number}>(
    `
      SELECT
        manga_id
      FROM
        mangas
      LIMIT 1
      OFFSET 0;
    `    
  ).catch(error => console.log('dbHasMangas', error)); 
  return row != null
}


export async function dbGetAppVersion(db: SQLite.SQLiteDatabase): Promise<string> {
  const row = await db.getFirstAsync<{value: string}>(
    `
      SELECT
        value
      FROM
        app_info
      WHERE
        name = 'version';
    `    
  ).catch(error => console.log('dbGetAppVersion', error)); 

  return row!.value
}


export async function dbReadAppInfo(db: SQLite.SQLiteDatabase, info: string): Promise<any> {
  const row = await db.getFirstAsync<{value: string}>(
    `
      SELECT
        value
      FROM
        app_info
      WHERE
        name = ?;
    `,
    [info]
  ).catch(error => console.log('dbGetAppVersion', error)); 

  return row!.value
}


export async function dbSetAppInfo(db: SQLite.SQLiteDatabase, name: string, value: any) {
  await db.runAsync(
    `
      INSERT OR REPLACE INTO app_info (name, value)
      VALUES (?, ?);
    `,
    [name, value]
  ).catch(error => console.log("error dbSetAppInfo"))
}


export async function dbGetAllReleases(db: SQLite.SQLiteDatabase): Promise<AppRelease[]> {
 const rows = await db.getAllAsync(
    `
      SELECT 
        *
      FROM 
        app_releases
      ORDER BY created_at DESC;
    `    
  ).catch(error => console.log("error dbGetAllReleases", error))

  return rows ? rows as AppRelease[] : [] 
}