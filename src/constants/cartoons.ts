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
    backdropUrl: 'https://image.tmdb.org/t/p/original/j1tXFp4tJ7xR4Z1P2qO5vP8yP9k.jpg',
    overview: 'A woman gets trapped in a wacky virtual world along with five other humans and is now subjected to the whims of wacky AI and their own personal traumas.',
    releaseDate: '2023',
    voteAverage: 8.9,
    mediaType: 'cartoon',
    genre: 'Animation, Comedy, Adventure',
    badge: 'TRENDING #1',
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
            thumbnailUrl: 'https://img.youtube.com/vi/v5QyWwY782E/hqdefault.jpg',
            youtubeId: 'v5QyWwY782E',
          },
        ],
      },
    ],
  },
  {
    id: 'mocas-monster-cars',
    title: 'Mocas: Little Monster Cars',
    name: 'Mocas: Little Monster Cars',
    posterUrl: 'https://img.youtube.com/vi/5gZ5k_L1p0Y/maxresdefault.jpg',
    backdropUrl: 'https://img.youtube.com/vi/5gZ5k_L1p0Y/maxresdefault.jpg',
    overview: 'Meet Mocas! Five fun and colorful mini monster cars exploring the world, racing, and overcoming challenges together.',
    releaseDate: '2022',
    voteAverage: 8.4,
    mediaType: 'cartoon',
    genre: 'Animation, Kids, Cars',
    badge: 'MOCCA STUDIO',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'mocas-s1e1',
            episodeNumber: 1,
            title: 'The Great Ramp Jump & Obstacle Race',
            overview: 'The monster cars build high ramps and test their suspension on a thrilling outdoor adventure track.',
            duration: '15m',
            thumbnailUrl: 'https://img.youtube.com/vi/5gZ5k_L1p0Y/hqdefault.jpg',
            youtubeId: '5gZ5k_L1p0Y',
          },
          {
            id: 'mocas-s1e2',
            episodeNumber: 2,
            title: 'Giant Mud Puddle & Car Wash Party',
            overview: 'After a stormy race through muddy tracks, the Mocas team heads to the super foam car wash.',
            duration: '18m',
            thumbnailUrl: 'https://img.youtube.com/vi/9xG8wP0l1vE/hqdefault.jpg',
            youtubeId: '9xG8wP0l1vE',
          },
          {
            id: 'mocas-s1e3',
            episodeNumber: 3,
            title: 'Monster Truck Rescue Mission',
            overview: 'When one of the mini cars gets stuck in the sand pit, the team combines their gadgets to pull them out.',
            duration: '20m',
            thumbnailUrl: 'https://img.youtube.com/vi/X1y9pL4vQ7E/hqdefault.jpg',
            youtubeId: 'X1y9pL4vQ7E',
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
    backdropUrl: 'https://image.tmdb.org/t/p/original/7X8mJ5L1Q6P7kQ8V2vR9sK4wL3p.jpg',
    overview: 'The iconic cat-and-mouse duo in their timeless slapstick rivalries, full of hilarious chases, musical orchestrations, and legendary tricks.',
    releaseDate: '1940 - 2024',
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
            title: 'Golden Slapstick Collection',
            overview: 'A nonstop compilation of classic chases, piano concertos, and backyard showdowns between Tom and Jerry.',
            duration: '30m',
            thumbnailUrl: 'https://img.youtube.com/vi/t0Q2otsqC4I/hqdefault.jpg',
            youtubeId: 't0Q2otsqC4I',
          },
          {
            id: 'tj-s1e2',
            episodeNumber: 2,
            title: 'House Havoc & Mouse Trap Mayhem',
            overview: 'Jerry invents elaborate gadgets to outwit Tom while protecting his cheese treasure.',
            duration: '28m',
            thumbnailUrl: 'https://img.youtube.com/vi/cqyziA206KU/hqdefault.jpg',
            youtubeId: 'cqyziA206KU',
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
    backdropUrl: 'https://image.tmdb.org/t/p/original/8pQ2rV4sN7kL9mK8pQ2xY1pL2wQ.jpg',
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
            title: 'No Parking & Bean at the Cinema',
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
    backdropUrl: 'https://image.tmdb.org/t/p/original/v8pQ2rV4sN7kL9mK8pQ2xY1pL2w.jpg',
    overview: 'Shaun is a clever, rather unusual sheep who leads his flock into hilarious capers on Mossy Bottom Farm, constantly dodging Bitzer the dog.',
    releaseDate: '2007 - 2024',
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
  {
    id: 'kral-sakir',
    title: 'Kral Şakir: Süper Maceralar',
    name: 'Kral Şakir: Süper Maceralar',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1X7kL9mK8pQ2xY1pL2wQ8rV4sN7.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/j1tXFp4tJ7xR4Z1P2qO5vP8yP9k.jpg',
    overview: 'Aslan Şakir, fil Necati, Remzi ve Canan ile dünyayı kurtarma görevlerinde, uzay yolculuklarında ve akıl almaz icat maceralarında!',
    releaseDate: '2016 - 2024',
    voteAverage: 9.1,
    mediaType: 'cartoon',
    genre: 'Animasyon, Komedi, Macera',
    badge: 'TÜRKÇE',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Sezon 1',
        episodes: [
          {
            id: 'sakir-s1e1',
            episodeNumber: 1,
            title: 'Uzay Yolculuğu ve Çılgın Dürüm',
            overview: 'Remzi ve Necati aç kalınca uzay gemisiyle galaksiler arası en lezzetli dürümü aramaya çıkarlar.',
            duration: '14m',
            thumbnailUrl: 'https://img.youtube.com/vi/zC_z6PqO1eA/hqdefault.jpg',
            youtubeId: 'zC_z6PqO1eA',
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
