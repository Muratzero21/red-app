export interface CartoonEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  overview: string;
  duration: string;
  thumbnailUrl: string;
  youtubeId: string;
}

export interface CartoonSeason {
  seasonNumber: number;
  title: string;
  episodes: CartoonEpisode[];
}

export interface CartoonItem {
  id: string;
  title: string;
  name: string;
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  mediaType: 'cartoon';
  genre: string;
  badge?: string;
  seasons: CartoonSeason[];
}

export const KIDS_CARTOONS: CartoonItem[] = [
  {
    id: 'tadc',
    title: 'The Amazing Digital Circus',
    name: 'The Amazing Digital Circus',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lpfrgfomX8uNFxv4VaEzvJGs9TK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/vPVdWiLUNQyaGMazyZGVAyRcYBG.jpg',
    overview: 'A woman gets trapped in a wacky virtual world along with five other humans and is now subjected to the whims of wacky AI and their own personal traumas.',
    releaseDate: '2023 - 2024',
    voteAverage: 8.9,
    mediaType: 'cartoon',
    genre: 'Animation, Comedy, Adventure',
    badge: '350M+ VIEWS',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'tadc-s1e1',
            episodeNumber: 1,
            title: 'PILOT: Welcome to the Circus',
            overview: 'Pomni finds herself trapped in the Digital Circus and must adjust to her new bizarre reality alongside Jax, Ragatha, and Caine.',
            duration: '25m',
            thumbnailUrl: 'https://img.youtube.com/vi/HwAPLk_sQ3w/hqdefault.jpg',
            youtubeId: 'HwAPLk_sQ3w',
          },
          {
            id: 'tadc-s1e2',
            episodeNumber: 2,
            title: 'Candy Carrier Chaos!',
            overview: 'Caine sends the crew on a high-stakes adventure in the Candy Canyon Kingdom to retrieve a stolen maple syrup tanker.',
            duration: '24m',
            thumbnailUrl: 'https://img.youtube.com/vi/4ofJpOEXrZs/hqdefault.jpg',
            youtubeId: '4ofJpOEXrZs',
          },
          {
            id: 'tadc-s1e3',
            episodeNumber: 3,
            title: 'The Mystery of Mildenhall Manor',
            overview: 'Kinger and Pomni venture into an eerie haunted mansion while the rest of the gang face bizarre psychological challenges.',
            duration: '26m',
            thumbnailUrl: 'https://img.youtube.com/vi/bKjfw77cxeQ/hqdefault.jpg',
            youtubeId: 'bKjfw77cxeQ',
          },
        ],
      },
    ],
  },
  {
    id: 'tom-and-jerry',
    title: 'The Tom and Jerry Show',
    name: 'The Tom and Jerry Show',
    posterUrl: 'https://image.tmdb.org/t/p/w500/41EWXLXTZO4MLb2BL28mWZuydyq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/utqCOvMmjjMTlXNZz6PHOzRM5QP.jpg',
    overview: 'The iconic cat-and-mouse duo in their timeless slapstick rivalries, full of hilarious chases, musical orchestrations, and legendary tricks.',
    releaseDate: 'Warner Bros Animation',
    voteAverage: 9.3,
    mediaType: 'cartoon',
    genre: 'Animation, Comedy, Family',
    badge: 'LEGENDARY',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Classic Marathons',
        episodes: [
          {
            id: 'tj-s1e1',
            episodeNumber: 1,
            title: 'Terrifying Tales & Classic Chases',
            overview: 'A nonstop compilation of classic chases, backyard showdowns, and comical rivalries between Tom and Jerry.',
            duration: '30m',
            thumbnailUrl: 'https://img.youtube.com/vi/ugZMQUnfqss/hqdefault.jpg',
            youtubeId: 'ugZMQUnfqss',
          },
          {
            id: 'tj-s1e2',
            episodeNumber: 2,
            title: 'Golden Slapstick Collection',
            overview: 'Classic cartoon highlights and wild inventions as Tom tries to catch Jerry in hilarious animated shorts.',
            duration: '28m',
            thumbnailUrl: 'https://img.youtube.com/vi/HwAPLk_sQ3w/hqdefault.jpg',
            youtubeId: 'ugZMQUnfqss',
          },
        ],
      },
    ],
  },
  {
    id: 'shaun-the-sheep',
    title: 'Shaun the Sheep',
    name: 'Shaun the Sheep',
    posterUrl: 'https://image.tmdb.org/t/p/w500/z2gPfTQd3I0JLWOAEdKYMQRLoun.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/onwny8s0VTTN7te9TJnItgvyWHy.jpg',
    overview: 'Shaun is a clever, rather unusual sheep who leads his flock into hilarious capers on Mossy Bottom Farm, constantly dodging Bitzer the dog.',
    releaseDate: 'Aardman Animations',
    voteAverage: 8.8,
    mediaType: 'cartoon',
    genre: 'Animation, Comedy, Slapstick',
    badge: 'CLAYMATION',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'shaun-s1e1',
            episodeNumber: 1,
            title: 'Off the Baa! & Bathtime Fun',
            overview: 'A football match between the sheep gets wild, followed by Shaun trying to escape a shearing bath.',
            duration: '16m',
            thumbnailUrl: 'https://img.youtube.com/vi/HwAPLk_sQ3w/hqdefault.jpg',
            youtubeId: 'HwAPLk_sQ3w',
          },
        ],
      },
    ],
  },
  {
    id: 'gravity-falls',
    title: 'Gravity Falls',
    name: 'Gravity Falls',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qwi3p6PzKfQZ4YXBzv3CP5pO2dE.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/lhg7eA6CTOCL10QNVdKiyxkgPsL.jpg',
    overview: 'Twin siblings Dipper and Mabel Pines spend the summer at their great-uncle Stan\'s tourist trap in Gravity Falls, uncovering supernatural mysteries.',
    releaseDate: 'Disney Television Animation',
    voteAverage: 8.7,
    mediaType: 'cartoon',
    genre: 'Animation, Mystery, Adventure',
    badge: 'DISNEY HIT',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'gf-s1e1',
            episodeNumber: 1,
            title: 'Tourist Trapped',
            overview: 'Dipper and Mabel arrive at the Mystery Shack and uncover a secret journal describing supernatural phenomena in Gravity Falls.',
            duration: '22m',
            thumbnailUrl: 'https://img.youtube.com/vi/4ofJpOEXrZs/hqdefault.jpg',
            youtubeId: '4ofJpOEXrZs',
          },
        ],
      },
    ],
  },
  {
    id: 'avatar-the-last-airbender',
    title: 'Avatar: The Last Airbender',
    name: 'Avatar: The Last Airbender',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lzZpWEaqzP0qVA5nkCc5ASbNcSy.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/aVvRQJ2Ckhlym4uh0YGc166CUoP.jpg',
    overview: 'In a war-torn world of elemental magic, a young boy reawakens to undertake a dangerous mystic quest to fulfill his destiny as the Avatar.',
    releaseDate: 'Nickelodeon Animation',
    voteAverage: 8.9,
    mediaType: 'cartoon',
    genre: 'Animation, Action, Fantasy',
    badge: 'MASTERPIECE',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Book 1: Water',
        episodes: [
          {
            id: 'atla-s1e1',
            episodeNumber: 1,
            title: 'The Boy in the Iceberg',
            overview: 'Katara and Sokka discover Aang, the lost Avatar, frozen in an iceberg in the South Pole.',
            duration: '24m',
            thumbnailUrl: 'https://img.youtube.com/vi/bKjfw77cxeQ/hqdefault.jpg',
            youtubeId: 'bKjfw77cxeQ',
          },
        ],
      },
    ],
  },
];

export const getCartoonById = (id: string): CartoonItem | undefined => {
  return KIDS_CARTOONS.find((c) => c.id === id);
};

export const getAllCartoons = (): CartoonItem[] => {
  return KIDS_CARTOONS;
};
