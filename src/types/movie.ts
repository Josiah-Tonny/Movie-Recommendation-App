export interface MovieResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  original_language?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface VideoResult {
  id: string;
  name: string;
  key: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  gender?: number;
  known_for_department?: string;
  popularity?: number;
  credit_id?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  gender?: number;
  known_for_department?: string;
  popularity?: number;
  credit_id?: string;
}

export interface MovieCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface TVSeason {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_count: number;
  poster_path: string | null;
  season_number: number;
}

export interface MovieDetailResponse {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  tagline?: string;
  runtime: number;
  status: string;
  release_date: string;
  budget: number;
  revenue: number;
  original_language: string;
  genres: Genre[];
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: VideoResult[];
  };
  homepage?: string;
  keywords?: {
    keywords: {
      id: number;
      name: string;
    }[];
  };
}

export interface TVSeriesDetailResponse {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  status: string;
  first_air_date: string;
  last_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  genres: Genre[];
  seasons: TVSeason[];
  homepage?: string;
  networks: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  videos?: {
    results: VideoResult[];
  };
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
}