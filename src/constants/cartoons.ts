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
    posterUrl: 'https://image.tmdb.org/t/p/w500/15eN64qgKk3Uf95n4hZk0kK9g9l.jpg',
    backdropUrl: 'https://img.youtube.com/vi/HwAPLk_sQ3w/maxresdefault.jpg',
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
    id: 'murder-drones',
    title: 'Murder Drones',
    name: 'Murder Drones',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mImFz85NO44v8pQ2rV4sN7kL9mK.jpg',
    backdropUrl: 'https://img.youtube.com/vi/mImFz85NO44/maxresdefault.jpg',
    overview: 'In a frozen post-apocalyptic exoplanet, worker drones fight for survival against rogue disassembly murder drones sent by humanity.',
    releaseDate: '2021 - 2024',
    voteAverage: 9.1,
    mediaType: 'cartoon',
    genre: 'Animation, Sci-Fi, Action',
    badge: 'HIT SERIES',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'md-s1e1',
            episodeNumber: 1,
            title: 'PILOT: Meet Uzi & Serial Designation N',
            overview: 'Uzi, a rebellious worker drone, accidentally forms an unlikely alliance with a defecting murder drone named N.',
            duration: '27m',
            thumbnailUrl: 'https://img.youtube.com/vi/mImFz85NO44/hqdefault.jpg',
            youtubeId: 'mImFz85NO44',
          },
          {
            id: 'md-s1e2',
            episodeNumber: 2,
            title: 'Heartbeat: The Absolute Solver',
            overview: 'The bunker comes under attack from an eerie biological horror created by the corrupted Absolute Solver program.',
            duration: '19m',
            thumbnailUrl: 'https://img.youtube.com/vi/dZ4O5L_D9W8/hqdefault.jpg',
            youtubeId: 'dZ4O5L_D9W8',
          },
        ],
      },
    ],
  },
  {
    id: 'tom-and-jerry',
    title: 'Tom and Jerry Classics',
    name: 'Tom and Jerry Classics',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mXp0Zf6sV1h7gVlP8r9wQo6sV8r.jpg',
    backdropUrl: 'https://img.youtube.com/vi/ugZMQUnfqss/maxresdefault.jpg',
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
            thumbnailUrl: 'https://img.youtube.com/vi/t0Q2otsqC4I/hqdefault.jpg',
            youtubeId: 't0Q2otsqC4I',
          },
        ],
      },
    ],
  },
  {
    id: 'mr-bean-animated',
    title: 'Mr. Bean: The Animated Series',
    name: 'Mr. Bean: The Animated Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9k8xY1pL2wQ8rV4sN7kL9mK8pQ2.jpg',
    backdropUrl: 'https://img.youtube.com/vi/9U1zP79e5K8/maxresdefault.jpg',
    overview: 'The animated adventures of eccentric bumbler Mr. Bean, his best friend Teddy, and his long-suffering landlady Mrs. Wicket.',
    releaseDate: '2002 - 2024',
    voteAverage: 8.5,
    mediaType: 'cartoon',
    genre: 'Animation, Comedy, Kids',
    badge: 'FULL SEASONS',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'bean-s1e1',
            episodeNumber: 1,
            title: 'In the Wild & Missing Teddy',
            overview: 'Mr. Bean goes bird watching in nature and later turns the whole apartment upside down looking for Teddy.',
            duration: '22m',
            thumbnailUrl: 'https://img.youtube.com/vi/9U1zP79e5K8/hqdefault.jpg',
            youtubeId: '9U1zP79e5K8',
          },
          {
            id: 'bean-s1e2',
            episodeNumber: 2,
            title: 'No Parking & Cinema Chaos',
            overview: 'Mr. Bean faces a relentless traffic warden and brings chaos to the local cinema hall.',
            duration: '21m',
            thumbnailUrl: 'https://img.youtube.com/vi/pP1rQ033o0g/hqdefault.jpg',
            youtubeId: 'pP1rQ033o0g',
          },
        ],
      },
    ],
  },
  {
    id: 'shaun-the-sheep',
    title: 'Shaun the Sheep',
    name: 'Shaun the Sheep',
    posterUrl: 'https://image.tmdb.org/t/p/w500/uF5jZ8hB5oQ8yL2rV9sK4wL3p1Q.jpg',
    backdropUrl: 'https://img.youtube.com/vi/f0QkG22iW3o/maxresdefault.jpg',
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
            thumbnailUrl: 'https://img.youtube.com/vi/f0QkG22iW3o/hqdefault.jpg',
            youtubeId: 'f0QkG22iW3o',
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
