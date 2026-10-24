const TMDB_API_KEY = '8b9e104198b097fa1562fa48ba29f859';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT_MS = 8000;

export const getImageUrl = (
  path: string | null | undefined, 
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'
) => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `https://image.tmdb.org/t/p/${size}${path.startsWith('/') ? path : '/' + path}`;
};

const cache = new Map<string, any>();
let tmdbLang = 'en-US';

export const clearTmdbCache = () => cache.clear();

export const setTMDBLanguage = (lang: string) => {
  tmdbLang = lang;
};

const fetchFromTMDB = async (endpoint: string, params: Record<string, any> = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );

  const queryParams = new URLSearchParams({
    ...cleanParams,
    language: tmdbLang,
    include_video_language: `${tmdbLang},en,null`,
    api_key: TMDB_API_KEY,
  });

  const queryString = queryParams.toString();
  const primaryUrl = `${TMDB_BASE_URL}${endpoint}?${queryString}`;

  if (cache.has(primaryUrl)) {
    return cache.get(primaryUrl);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(primaryUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      console.warn(`[TMDB fetch failed] ${primaryUrl} -> ${response?.status}`);
      return { results: [] };
    }

    const data = await response.json();
    if (data && typeof data === 'object') {
      cache.set(primaryUrl, data);
      return data;
    }
    return { results: [] };
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`TMDB API Warning (${endpoint}):`, error?.message || error);
    // Graceful empty fallback so offline / poor connectivity never crashes the app
    return { results: [] };
  }
};

export const tmdbAPI = {
  getTrendingWorldwide: (page = 1) => fetchFromTMDB('/trending/all/day', { page }),
  getPopularMovies: (page = 1) => fetchFromTMDB('/movie/popular', { page }),
  getPopularSeries: (page = 1) => fetchFromTMDB('/tv/popular', { page }),
  getStreamingSeries: (page = 1) => fetchFromTMDB('/discover/tv', { 
    page,
    sort_by: 'popularity.desc',
    with_networks: '213|49|2552|2739', // Netflix, HBO, Apple TV+, Disney+
    'air_date.gte': '2023-01-01'
  }),
  getTopRated: (page = 1) => fetchFromTMDB('/movie/top_rated', { page }),
  getTrendingPeople: (page = 1) => fetchFromTMDB('/trending/person/day', { page }),
  getHeroMix: async () => {
    try {
      const res = await fetchFromTMDB('/trending/all/day');
      if (!res || !Array.isArray(res.results)) return { results: [] };
      const validResults = res.results.filter((item: any) => item && item.backdrop_path);
      return { results: validResults };
    } catch {
      return { results: [] };
    }
  },
  getMoviesByGenre: (genreId: string | number, page = 1) => fetchFromTMDB('/discover/movie', { with_genres: genreId, page, sort_by: 'popularity.desc' }),
  getTvShowsByGenre: (genreId: string | number, page = 1) => fetchFromTMDB('/discover/tv', { with_genres: genreId, page, sort_by: 'popularity.desc' }),
  searchMulti: (query: string, page = 1) => fetchFromTMDB('/search/multi', { query, page }),
  getDetails: async (id: string | number, type: 'movie' | 'tv' = 'movie') => {
    try {
      const res = await fetchFromTMDB(`/${type}/${id}`, { append_to_response: 'videos,credits,similar,images,watch/providers,reviews' });
      return res || null;
    } catch {
      return null;
    }
  },
  getSeasonDetails: async (tvId: string | number, seasonNumber: number) => {
    try {
      const res = await fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
      return res || null;
    } catch {
      return null;
    }
  },
};