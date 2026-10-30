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
    return {
      results: [
        {
          id: 1236045,
          title: 'Animals',
          name: 'Animals',
          media_type: 'movie',
          poster_path: '/iISM36voS1E8gX9BM0DVK0kgi3E.jpg',
          backdrop_path: '/tzoarEu7TsG959upiELyYPm5kO9.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/dl6aDoFDDjTgNMI4Cui2GmKZUpR.png',
          trailerId: 'ZkN2M4ODdys',
          release_date: '2026-10-09',
          vote_average: 7.0,
          overview:
            'When the son of an L.A. mayoral candidate is kidnapped, he and his wife have a few hours to come up with the ransom payment. With most of their money spent on his political campaign, they have to get their hands dirty and expose a side of their lives they never intended to see the light of day.',
        },
        {
          id: 1802674,
          title: "Hot Wheels Let's Race: Attack of the T-Rex",
          name: "Hot Wheels Let's Race: Attack of the T-Rex",
          media_type: 'movie',
          poster_path: '/iIc0OkYnf06kv5Zp0IYVwuvffgh.jpg',
          backdrop_path: '/dK69ml1Y34MrEovK4ZyizRiWbEH.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/nqMFwyj6duePmukKry4fTMOurR9.png',
          trailerId: 'rn4vi89-cNM',
          release_date: '2026-10-20',
          vote_average: 7.5,
          overview:
            "When a giant T-Rex threatens Hot Wheels City, it's up to Coop and his friends to race to the rescue and save the day.",
        },
        {
          id: 4597,
          title: 'Armored',
          name: 'Armored',
          media_type: 'movie',
          poster_path: '/oQrAXGkBy84FyGpWrY71ptqs7zD.jpg',
          backdrop_path: '/EOAv4NeWOxB5rfGmDJTofX3j3Z.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/ajE0EgmhhE0cdw5kRzjHhL7NaQa.png',
          trailerId: '5c2UWHeknkM',
          release_date: '2009-12-04',
          vote_average: 5.8,
          overview:
            'A crew of officers at an armored transport security firm risk their lives when they embark on the ultimate heist against their own company. Armed with a seemingly fool-proof plan, the men plan on making off with a fortune with harm to none. But when an unexpected witness interferes, the plan quickly unravels and all bets are off.',
        },
        {
          id: 278154,
          title: 'Ice Age 5: Collision Course',
          name: 'Ice Age 5: Collision Course',
          media_type: 'movie',
          poster_path: '/tFzUkdhPOForVrEfvxydXfPLrZR.jpg',
          backdrop_path: '/rBEH34dgPMy1WuqZ0AFXR2ThmNo.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/yrhFfnaTjEl3vfUl6MJNmwSL86Q.png',
          trailerId: 'Ohq6NmKMja8',
          release_date: '2016-06-23',
          vote_average: 6.1,
          overview:
            "Set after the events of Continental Drift, Scrat's epic pursuit of his elusive acorn catapults him outside of Earth, where he accidentally sets off a series of cosmic events that transform and threaten the planet.",
        },
        {
          id: 8355,
          title: 'Ice Age: Dawn of the Dinosaurs',
          name: 'Ice Age: Dawn of the Dinosaurs',
          media_type: 'movie',
          poster_path: '/cXOLaxcNjNAYmEx1trZxOTKhK3Q.jpg',
          backdrop_path: '/6Ybbh8TrO8bkEfQXDedekLwVDfA.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/Ah3FPcKZKe8jMU4G58fuVrxIz7m.png',
          trailerId: 'byUCa2vjDik',
          release_date: '2009-06-26',
          vote_average: 6.8,
          overview:
            'Times are changing for Manny the moody mammoth, Sid the motor mouthed sloth and Diego the crafty saber-toothed tiger. Life heats up for our heroes when they meet some new and none-too-friendly neighbors – the mighty dinosaurs.',
        },
        {
          id: 759507,
          title: 'Blackout',
          name: 'Blackout',
          media_type: 'movie',
          poster_path: '/xDgnmbdWS59NtTPdzujdZGuPUPZ.jpg',
          backdrop_path: '/mjV9gpXO2R2SOYI4ChJZiu6F1OE.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/biwbEArBvuLAYAIkW6sOfsDsDZu.png',
          trailerId: 'QP3sxps6k0s',
          release_date: '2022-10-12',
          vote_average: 5.1,
          overview:
            'A man wakes in a hospital with no memory, and quickly finds himself on the run in a locked down hospital with the Cartel on his tail.',
        },
        {
          id: 1315303,
          title: 'Primate',
          name: 'Primate',
          media_type: 'movie',
          poster_path: '/rKleYiEj4pFqxedTRWfujLooi84.jpg',
          backdrop_path: '/d5C5Wsx4fnMRA0tj9BK1kTPcgQe.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/3lrUfCP2ftPb3TKIX2SNSISFXq3.png',
          trailerId: 'wo87F-va410',
          release_date: '2026-01-01',
          vote_average: 6.4,
          overview:
            "College student Lucy and her friends spend their vacation at her family's home in Hawaii, which includes her pet chimpanzee, Ben. However, when Ben contracts rabies after being bitten by a rabid animal, the group must fight for their lives in order to avoid the now-violent chimp.",
        },
        {
          id: 1458857,
          title: 'Doing Life',
          name: 'Doing Life',
          media_type: 'movie',
          poster_path: '/5nZVjsCk5tWyyhLGt5U2TxsR85w.jpg',
          backdrop_path: '/nDScZ6YR2nfNCeK5bmJ1ujb355b.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/zMSLBsrkEnP2BbNSd2725MCaXvJ.png',
          trailerId: 'zrOtmDQawas',
          release_date: '2026-10-02',
          vote_average: 7.8,
          overview:
            'A single mother and an incarcerated man forge an unlikely bond through heartfelt letters, unlocking a door to redemption, hope and love against all odds.',
        },
        {
          id: 558449,
          title: 'Gladiator II',
          name: 'Gladiator II',
          media_type: 'movie',
          poster_path: '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
          backdrop_path: '/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/jwXk1c2esVoEzVLplPiQubNVyFC.png',
          trailerId: 'TQwSz88ITAE',
          release_date: '2024-11-13',
          vote_average: 6.6,
          overview:
            'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
        },
        {
          id: 425,
          title: 'Ice Age',
          name: 'Ice Age',
          media_type: 'movie',
          poster_path: '/gLhHHZUzeseRXShoDyC4VqLgsNv.jpg',
          backdrop_path: '/tyVAGH1vw9JDgxPyTUQPn91nIYc.jpg',
          logoUrl: 'https://image.tmdb.org/t/p/w780/o2dJGLPODV3jz9rWsX1hERFAh7X.png',
          trailerId: 'i4noiCRJRoE',
          release_date: '2002-03-14',
          vote_average: 7.4,
          overview:
            'Manny the mammoth, Sid the loquacious sloth, and Diego the sabre-toothed tiger go on a comical quest to return a human baby back to his father, across a world on the brink of an ice age.',
        },
      ],
    };
  },
  getMoviesByGenre: (genreId: string | number, page = 1) => fetchFromTMDB('/discover/movie', { with_genres: genreId, page, sort_by: 'popularity.desc' }),
  getTvShowsByGenre: (genreId: string | number, page = 1) => fetchFromTMDB('/discover/tv', { with_genres: genreId, page, sort_by: 'popularity.desc' }),
  searchMulti: (query: string, page = 1) => fetchFromTMDB('/search/multi', { query, page }),
  getTrailersFeedData: async (id: string | number) => {
    try {
      const res = await fetchFromTMDB(`/movie/${id}`, { append_to_response: 'videos,images' });
      return res || null;
    } catch {
      return null;
    }
  },
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