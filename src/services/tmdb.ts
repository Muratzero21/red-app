const TMDB_API_KEY = '8b9e104198b097fa1562fa48ba29f859';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const getImageUrl = (path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `https://image.tmdb.org/t/p/${size}${path.startsWith('/') ? path : '/' + path}`;
};

const cache = new Map();
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

  const options = { method: 'GET' };

  try {
    const response = await fetch(primaryUrl, options);

    if (!response || !response.ok) {
      const text = await response.text();
      console.error(`[TMDB fetch failed] ${primaryUrl} -> ${response.status} ${text}`);
      throw new Error(`TMDB fetch failed for ${endpoint}`);
    }

    const data = await response.json();
    cache.set(primaryUrl, data);
    return data;
  } catch (error) {
    console.error('TMDB API Error:', error);
    throw error;
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
    'air_date.gte': '2023-01-01' // Güncel
  }),
  getTopRated: (page = 1) => fetchFromTMDB('/movie/top_rated', { page }),
  getTrendingPeople: (page = 1) => fetchFromTMDB('/trending/person/day', { page }),
  getHeroMix: async () => {
    // Fetch top 20 trending items of the day for the hero banner
    const res = await fetchFromTMDB('/trending/all/day');
    if (!res || !res.results) return { results: [] };
    
    // Filter items that have high quality backdrops and format them
    const validResults = res.results.filter((item: any) => item.backdrop_path);
    return { results: validResults };
  },
  getMoviesByGenre: (genreId: string | number, page = 1) => fetchFromTMDB('/discover/movie', { with_genres: genreId, page, sort_by: 'popularity.desc' }),
  getTvShowsByGenre: (genreId: string | number, page = 1) => fetchFromTMDB('/discover/tv', { with_genres: genreId, page, sort_by: 'popularity.desc' }),
  searchMulti: (query: string, page = 1) => fetchFromTMDB('/search/multi', { query, page }),
  getDetails: (id: string | number, type: 'movie' | 'tv' = 'movie') => fetchFromTMDB(`/${type}/${id}`, { append_to_response: 'videos,credits,similar,images,watch/providers,reviews' }),
};