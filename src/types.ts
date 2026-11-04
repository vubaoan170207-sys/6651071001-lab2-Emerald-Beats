export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSeconds: number;
  coverUrl: string;
  genre: string;
  plays: number;
  price: number;
  releaseDate: string;
  description: string;
  lyricsExcerpt?: string;
  lyrics?: string;
}

export type SortField = 'default' | 'title' | 'duration' | 'plays';
export type SortOrder = 'asc' | 'desc';
export type FilterGenre = string;
