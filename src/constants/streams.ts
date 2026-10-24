export interface StreamEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  thumbnail: string;
  youtubeId: string;
  overview: string;
  source_type?: 'youtube' | 'local';
}

export interface StreamSeason {
  seasonNumber: number;
  title: string;
  episodes: StreamEpisode[];
}

export type StreamCategory = 'kids' | 'turkish_classics' | 'indie_web' | 'documentary';

export interface StreamShow {
  id: string;
  tmdbId?: number;
  title: string;
  name: string;
  type?: 'series' | 'movie';
  category: StreamCategory;
  categoryTitle: string;
  posterUrl: string;
  backdropUrl: string;
  logoUrl?: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  badge?: string;
  isFullSeries?: boolean;
  is_pro?: boolean;
  seasons: StreamSeason[];
}

// 1. KIDS & ANIMATION
export const KIDS_CARTOONS: StreamShow[] = [
  {
    id: 'the-amazing-world-of-gumball',
    tmdbId: 37606,
    title: 'The Amazing World of Gumball',
    name: 'The Amazing World of Gumball',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2NGCRWnZpsIevwpjBLkoXfnqSgg.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/gmO3aezFgDcrhcymhNSJLGZ3CT.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/zfDGJBkoZY96jjeR6qLWNRJ245M.png',
    overview: 'The misadventures of Gumball Watterson, a blue cat, and his goldfish adoptive brother Darwin, as they cause hilarious chaos in the surreal town of Elmore.',
    releaseDate: '2011',
    voteAverage: 8.8,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1 Elmore Chronicles',
        episodes: [
          {
            id: 'gumball-e1',
            episodeNumber: 1,
            title: 'Season 1 Complete Full Episodes Marathon',
            duration: '210m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/gmO3aezFgDcrhcymhNSJLGZ3CT.jpg',
            youtubeId: 'TpaoJCQxF1M',
            source_type: 'youtube',
            overview: 'From returning an overdue DVD to surviving Elmore Junior High, Gumball and Darwin face unforgettable comic mayhem.'
          }
        ]
      }
    ]
  },
  {
    id: 'adventure-time',
    tmdbId: 15260,
    title: 'Adventure Time',
    name: 'Adventure Time',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qk3eQ8jW4opJ48gFWYUXWaMT4l.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/d8rse1RgMzXwmZvBpDvcG1VUO2Y.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/xvT35Utsxpydm9svjBfrrjG8Hg5.png',
    overview: 'Finn the Human and his magical shapeshifting dog Jake travel the colorful Land of Ooo, battling villainous monsters and rescuing Princess Bubblegum.',
    releaseDate: '2010',
    voteAverage: 8.9,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'at-e1',
            episodeNumber: 1,
            title: 'Season 1 Complete 4K Marathon',
            duration: '220m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/d8rse1RgMzXwmZvBpDvcG1VUO2Y.jpg',
            youtubeId: 'A8DCX5bIdt8',
            source_type: 'youtube',
            overview: 'Finn and Jake fight candy zombies, battle the Ice King, and explore dungeons in this complete first season block.'
          },
          {
            id: 'at-e2',
            episodeNumber: 2,
            title: 'Land of Ooo Epic Chronicles',
            duration: '180m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/qk3eQ8jW4opJ48gFWYUXWaMT4l.jpg',
            youtubeId: 'LKrX0jdLSLM',
            source_type: 'youtube',
            overview: 'Journey deeper into Marceline the Vampire Queen, the Nightosphere, and the mysteries of Ooo.'
          }
        ]
      }
    ]
  },
  {
    id: 'regular-show',
    tmdbId: 31132,
    title: 'Regular Show',
    name: 'Regular Show',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mS5SLxMYcKfUxA0utBSR5MOAWWr.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/bhF63Jd90gRYyTHd4y5GCGA2vX6.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/pZlYCkITk6GxmkVQWZFXPrAENIa.png',
    overview: 'Mordecai, a blue jay, and Rigby, a raccoon, are park groundskeepers who will do anything to slack off, unleashing surreal interdimensional chaos.',
    releaseDate: '2010',
    voteAverage: 8.8,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Park Shenanigans',
        episodes: [
          {
            id: 'rs-e1',
            episodeNumber: 1,
            title: 'Season 3 Complete Park Adventures',
            duration: '190m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/bhF63Jd90gRYyTHd4y5GCGA2vX6.jpg',
            youtubeId: 'k38mFjHFu-U',
            source_type: 'youtube',
            overview: 'Mordecai and Rigby try to set up chairs, play video games, and evade Benson while accidentally summoning cosmic demons.'
          },
          {
            id: 'rs-e2',
            episodeNumber: 2,
            title: 'Season 4 Intergalactic Madness',
            duration: '185m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/mS5SLxMYcKfUxA0utBSR5MOAWWr.jpg',
            youtubeId: '_argkqUFUAs',
            source_type: 'youtube',
            overview: 'High-stakes park escapades with Pops, Skips, and Muscle Man turning everyday chores into heroic battles.'
          }
        ]
      }
    ]
  },
  {
    id: 'we-bare-bears',
    tmdbId: 63401,
    title: 'We Bare Bears',
    name: 'We Bare Bears',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3xWzlLZ0kAD6SkVZTekFM9lxZyP.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/cl5FVcBEgddaC7dUL8HDMH6m2tp.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/e2alGUTZoJGskntP6SnOP84nbDw.png',
    overview: 'Three bear brothers—Grizzly, Panda, and Ice Bear—awkwardly navigate modern human society in the Bay Area, trying to make friends and go viral.',
    releaseDate: '2015',
    voteAverage: 8.7,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'wbb-e1',
            episodeNumber: 1,
            title: 'Season 1 Full Episodes Compilation',
            duration: '210m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/cl5FVcBEgddaC7dUL8HDMH6m2tp.jpg',
            youtubeId: 'boOzKLyomJo',
            source_type: 'youtube',
            overview: 'The bears master the bear stack, try food truck cuisine, and attempt to become viral internet sensations.'
          },
          {
            id: 'wbb-e2',
            episodeNumber: 2,
            title: 'Season 2 Bear Stack Escapades',
            duration: '195m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/3xWzlLZ0kAD6SkVZTekFM9lxZyP.jpg',
            youtubeId: 'gRgyG6Je8j0',
            source_type: 'youtube',
            overview: 'More heartwarming misadventures with Chloe, Nom Nom the koala, and Charlie the Bigfoot.'
          }
        ]
      }
    ]
  },
  {
    id: 'ben-10',
    tmdbId: 4363,
    title: 'Ben 10',
    name: 'Ben 10',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/a4H0UR7aUkGZlT6Q9r9grBrjJWR.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/eareuhgO6bQj2N0roSJ7ZxnUtAU.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/tcHJrob0afSWqVJdXQbbhB38Uow.png',
    overview: 'Ten-year-old Ben Tennyson discovers a mysterious alien watch called the Omnitrix that gives him the power to transform into 10 different alien heroes.',
    releaseDate: '2005',
    voteAverage: 8.6,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Classic Omnitrix Saga',
        episodes: [
          {
            id: 'b10-e1',
            episodeNumber: 1,
            title: 'Classic Season 1 Full Marathon',
            duration: '200m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/eareuhgO6bQj2N0roSJ7ZxnUtAU.jpg',
            youtubeId: 'YE-pFTEgsjI',
            source_type: 'youtube',
            overview: 'From discovering the Omnitrix in the forest to defeating Vilgax, Ben fights extraterrestrial evil with Grandpa Max and Gwen.'
          },
          {
            id: 'b10-e2',
            episodeNumber: 2,
            title: 'The Omnitrix Saga Marathon',
            duration: '180m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/a4H0UR7aUkGZlT6Q9r9grBrjJWR.jpg',
            youtubeId: 'P2-0xnjeJw4',
            source_type: 'youtube',
            overview: 'Relive Ben unlocking Heatblast, Diamondhead, XLR8, and Four Arms in epic battles.'
          }
        ]
      }
    ]
  },
  {
    id: 'craig-of-the-creek',
    tmdbId: 79061,
    title: 'Craig of the Creek',
    name: 'Craig of the Creek',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/u4LaONJSBi0khRe2L8nqBk81dlc.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/c1CBVe8UzltKScrjnM3aBFd8SA1.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/phlKGNxauqvdKA8YSKv5YVahHIQ.png',
    overview: 'Craig and his best friends Kelsey and JP journey through the kid-ruled wilderness of the Creek, a utopian suburban playground of endless adventure.',
    releaseDate: '2018',
    voteAverage: 8.5,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Creek Adventures',
        episodes: [
          {
            id: 'cotc-e1',
            episodeNumber: 1,
            title: 'Season 4 Complete 4K Marathon',
            duration: '190m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/c1CBVe8UzltKScrjnM3aBFd8SA1.jpg',
            youtubeId: 'xV29xoHsLjQ',
            source_type: 'youtube',
            overview: 'Craig, Kelsey, and JP trade snacks at the Trading Tree, chart untamed creek boundaries, and defend their fort.'
          }
        ]
      }
    ]
  },
  {
    id: 'teen-titans-go',
    tmdbId: 45140,
    title: 'Teen Titans Go!',
    name: 'Teen Titans Go!',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kPKAigYUlWRpnfo4Ptiwlz4FWXU.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/bIHCUqaapZdRjd2kzSDiwzYyrpC.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/p8pRg0lEZKCM7z5fakweU0VxC6c.png',
    overview: 'Robin, Starfire, Raven, Beast Boy, and Cyborg return with comedic superhero antics, living together in Titans Tower without adult supervision.',
    releaseDate: '2013',
    voteAverage: 8.3,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Titans Tower Chronicles',
        episodes: [
          {
            id: 'ttg-e1',
            episodeNumber: 1,
            title: 'Ultimate Full Episodes Marathon',
            duration: '150m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/bIHCUqaapZdRjd2kzSDiwzYyrpC.jpg',
            youtubeId: '4M6OihNrAbM',
            source_type: 'youtube',
            overview: 'Waffles, burrito battles, and Halloween monster mayhem in the ultimate Teen Titans Go! marathon.'
          },
          {
            id: 'ttg-e2',
            episodeNumber: 2,
            title: 'Raven & Titans Mega Compilation',
            duration: '120m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/kPKAigYUlWRpnfo4Ptiwlz4FWXU.jpg',
            youtubeId: 'riazU2Vbvh8',
            source_type: 'youtube',
            overview: 'The funniest highlights and musical showdowns from Robin, Beast Boy, Cyborg, and Raven.'
          }
        ]
      }
    ]
  },
  {
    id: 'tadc',
    title: 'The Amazing Digital Circus',
    name: 'The Amazing Digital Circus',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lpfrgfomX8uNFxv4VaEzvJGs9TK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/vPVdWiLUNQyaGMazyZGVAyRcYBG.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/kqxkOvN7wIwucwxFWdTFqL9XRi2.png',
    overview: 'A woman gets trapped in a wacky virtual world along with five other humans and is now subjected to the whims of wacky AI and their own personal traumas.',
    releaseDate: '2023 - 2024',
    voteAverage: 8.9,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'tadc-s1e1',
            episodeNumber: 1,
            title: 'Pilot - The Amazing Digital Circus',
            duration: '25m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/vPVdWiLUNQyaGMazyZGVAyRcYBG.jpg',
            youtubeId: 'HwAPLk_sQ3w',
            source_type: 'youtube',
            overview: 'Pomni suddenly awakens in a bizarre circus dimension with other trapped humans, ruled by the eccentric ringmaster Caine.'
          },
          {
            id: 'tadc-s1e2',
            episodeNumber: 2,
            title: 'Candy Carrier Chaos!',
            duration: '26m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/lpfrgfomX8uNFxv4VaEzvJGs9TK.jpg',
            youtubeId: '4ofJpOEXrZs',
            source_type: 'youtube',
            overview: 'The circus gang is dispatched on a wild western candy adventure involving a syrup heist and rogue bandit NPCs.'
          },
          {
            id: 'tadc-s1e3',
            episodeNumber: 3,
            title: 'The Mystery of Mildenhall Manor',
            duration: '24m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/vPVdWiLUNQyaGMazyZGVAyRcYBG.jpg',
            youtubeId: 'bKjfw77cxeQ',
            source_type: 'youtube',
            overview: 'Kinger and Pomni explore a haunted mansion adventure with dark secrets and unexpected psychological trials.'
          }
        ]
      }
    ]
  },
  {
    id: 'tayo-the-little-bus',
    tmdbId: 45039,
    title: 'Tayo the Little Bus',
    name: 'Tayo the Little Bus',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ieUwI8Y8FhhFNWVOwau0gDoHPnj.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fLn6AM7jUpXNrUOoAAJuHXaI9En.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/qAncIouNc4K4B0K0keXhNyWQYBk.png',
    overview: 'Tayo is a playful and curious little blue bus who learns his route in the bustling city with Rogi, Lani, and Gani, guided by Hana the mechanic.',
    releaseDate: '2010',
    voteAverage: 8.6,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1 Adventures',
        episodes: [
          {
            id: 'tayo-e1',
            episodeNumber: 1,
            title: 'A Day in the Life of Tayo',
            duration: '11m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/fLn6AM7jUpXNrUOoAAJuHXaI9En.jpg',
            youtubeId: 'z_qxfE7t7RM',
            source_type: 'youtube',
            overview: 'Tayo passes his bus license exam and heads out into the bustling city for his very first day of operations.'
          },
          {
            id: 'tayo-e2',
            episodeNumber: 2,
            title: 'Season 1 Full Marathon (All 26 Episodes)',
            duration: '300m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/ieUwI8Y8FhhFNWVOwau0gDoHPnj.jpg',
            youtubeId: 'HMj8vnVfNW0',
            source_type: 'youtube',
            overview: 'Enjoy the complete first season marathon following Tayo, Rogi, Lani, and Gani across Train Village and the city.'
          }
        ]
      }
    ]
  },
  {
    id: 'titipo-titipo',
    tmdbId: 87858,
    title: 'Titipo Titipo',
    name: 'Titipo Titipo',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mMGUOuV4wmW8QJ5f41jhtZ1ACXU.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/qhndXs3a39H4HzN3btjbeoL9Qsm.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/uYfOvixmj0PgCHk3tLk2ZYpscrV.png',
    overview: 'Titipo is an energetic young passenger train who wants to become the best train in the world, learning teamwork and safety at Train Village.',
    releaseDate: '2018',
    voteAverage: 8.4,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'titipo-e1',
            episodeNumber: 1,
            title: 'Getting Lost - Series Premiere',
            duration: '12m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/qhndXs3a39H4HzN3btjbeoL9Qsm.jpg',
            youtubeId: 'r00wZo51MfQ',
            source_type: 'youtube',
            overview: 'Titipo sets off on his very first delivery trial to the big city but quickly discovers how tricky rail junctions can be.'
          },
          {
            id: 'titipo-e2',
            episodeNumber: 2,
            title: 'Season 1 Full Compilation (Episodes 1-26)',
            duration: '300m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/mMGUOuV4wmW8QJ5f41jhtZ1ACXU.jpg',
            youtubeId: '1A6Iec-rBio',
            source_type: 'youtube',
            overview: 'Full season marathon of Titipo and his loyal train friends Diesel, Genie, and Xingxing navigating the tracks.'
          }
        ]
      }
    ]
  },
  {
    id: 'pororo-the-little-penguin',
    tmdbId: 19845,
    title: 'Pororo the Little Penguin',
    name: 'Pororo the Little Penguin',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oD2r5c3IG4C6RDx847tG8OtLutK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/aOkFlPc8qvXU0k5zUw7pg723ip1.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/B1Ojzzo6sR77OOO6yMQxfy3uaG.png',
    overview: 'In an icy wonderland surrounded by snow and forest, the curious penguin Pororo and his forest friends embark on warmhearted, imaginative adventures.',
    releaseDate: '2003',
    voteAverage: 8.5,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'pororo-e1',
            episodeNumber: 1,
            title: "We're Friends - Series Premiere",
            duration: '6m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/aOkFlPc8qvXU0k5zUw7pg723ip1.jpg',
            youtubeId: '8kIe7reaK3o',
            source_type: 'youtube',
            overview: 'Pororo discovers a large mysterious egg in the forest that hatches into Crong the baby dinosaur.'
          },
          {
            id: 'pororo-e2',
            episodeNumber: 2,
            title: 'Season 1 Full Episodes Marathon (E01-E52)',
            duration: '260m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/oD2r5c3IG4C6RDx847tG8OtLutK.jpg',
            youtubeId: 'FTFRKsoXAAU',
            source_type: 'youtube',
            overview: 'Complete marathon of classic Pororo adventures with Eddy the clever fox, Poby the polar bear, and Loopy the beaver.'
          }
        ]
      }
    ]
  },
  {
    id: 'flowering-heart',
    tmdbId: 70607,
    title: 'Flowering Heart',
    name: 'Flowering Heart',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ecxZWtNRJ7NpHgfypIZ0tLayYWX.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/ix7gLTjE8JpaGRtTWzauPdZyQcD.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/3hjbzIGN1mcRM5nneRGQbo44ikz.png',
    overview: 'Ari and her friends form an after-school problem-solving club and unlock magical transformations into diverse professions to collect Hope Energy.',
    releaseDate: '2016',
    voteAverage: 8.4,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'fh-e1',
            episodeNumber: 1,
            title: 'Crush at First Sight - Premiere',
            duration: '13m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/ix7gLTjE8JpaGRtTWzauPdZyQcD.jpg',
            youtubeId: 'V0u5uyQm49Y',
            source_type: 'youtube',
            overview: 'Ari encounters a mysterious magical prince transformed into a hamster and discovers her ability to change into adult professionals.'
          },
          {
            id: 'fh-e2',
            episodeNumber: 2,
            title: 'Mysterious Hamster & Hope Energy',
            duration: '13m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/ecxZWtNRJ7NpHgfypIZ0tLayYWX.jpg',
            youtubeId: 'OqU9BMRH9ks',
            source_type: 'youtube',
            overview: 'The problem-solving club takes on their next challenge to save people from despair and collect Hope Energy.'
          }
        ]
      }
    ]
  },
  {
    id: 'dino-buddy',
    tmdbId: 309224,
    title: 'Dino Buddy',
    name: 'Dino Buddy (Dino Buddies)',
    type: 'series',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3Djt4lv9GlEus8uR8JfwTbYlqC8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/2X99EWeVHtaC3GqWBjaaUfmFLTO.jpg',
    overview: 'Join young dinosaur best friends Rex, Sara, Sid, and Tor as they learn about friendship, kindness, sharing, and prehistoric fun.',
    releaseDate: '2018',
    voteAverage: 8.2,
    badge: 'FREE STREAM',
    is_pro: false,
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'db-e1',
            episodeNumber: 1,
            title: 'The Park - First Adventures',
            duration: '12m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/2X99EWeVHtaC3GqWBjaaUfmFLTO.jpg',
            youtubeId: 'qJO9U1AmWC0',
            source_type: 'youtube',
            overview: 'Rex, Sara, Sid, and Tor explore the playground and learn to take turns and make new friends.'
          },
          {
            id: 'db-e2',
            episodeNumber: 2,
            title: 'Meeting New Friends & Dino Tales',
            duration: '16m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/3Djt4lv9GlEus8uR8JfwTbYlqC8.jpg',
            youtubeId: 'JvCsHTeeelw',
            source_type: 'youtube',
            overview: 'More charming prehistoric stories filled with songs, gentle moral lessons, and early childhood adventures.'
          }
        ]
      }
    ]
  },
  {
    id: 'tom-and-jerry',
    title: 'The Tom and Jerry Show',
    name: 'The Tom and Jerry Show',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/41EWXLXTZO4MLb2BL28mWZuydyq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/utqCOvMmjjMTlXNZz6PHOzRM5QP.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/cwog1QvmNjtFoQVioOLVv15un0v.png',
    overview: 'The iconic cat-and-mouse duo in their timeless slapstick rivalries, full of hilarious chases, musical orchestrations, and legendary tricks.',
    releaseDate: 'Warner Bros Animation',
    voteAverage: 9.3,
    badge: 'FREE STREAM',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Classic Golden Hits',
        episodes: [
          {
            id: 'tj-e1',
            episodeNumber: 1,
            title: 'Classic Cartoon Compilation',
            duration: '22m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/utqCOvMmjjMTlXNZz6PHOzRM5QP.jpg',
            youtubeId: 'Si7DovGBDuQ',
            overview: 'Tom and Jerry in their greatest classic antics, full of hilarious chases, musical orchestrations, and legendary tricks.'
          },
          {
            id: 'tj-e2',
            episodeNumber: 2,
            title: 'Terrifying Tales & Night Mischief',
            duration: '20m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/41EWXLXTZO4MLb2BL28mWZuydyq.jpg',
            youtubeId: 'ugZMQUnfqss',
            overview: 'Kitchen raids after dark turn into an explosive culinary battleground between the cunning mouse and the stubborn cat.'
          },
          {
            id: 'tj-e3',
            episodeNumber: 3,
            title: 'Classic Slapstick in Full Screen',
            duration: '25m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/utqCOvMmjjMTlXNZz6PHOzRM5QP.jpg',
            youtubeId: 't0Q2otsqC4I',
            overview: 'Timeless slapstick cartoon mayhem as Tom sets high-velocity booby traps around the house.'
          },
          {
            id: 'tj-e4',
            episodeNumber: 4,
            title: 'Tom and Jerry Explore New York',
            duration: '21m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/41EWXLXTZO4MLb2BL28mWZuydyq.jpg',
            youtubeId: 'giO_iq5Xe_c',
            overview: 'The famous duo ventures across the Empire State and Central Park in an unforgettable urban chase.'
          },
          {
            id: 'tj-e5',
            episodeNumber: 5,
            title: 'Summer Olympics & Sports Day',
            duration: '24m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/utqCOvMmjjMTlXNZz6PHOzRM5QP.jpg',
            youtubeId: 'Myr2_jyscA4',
            overview: 'Tennis matches, track and field, and high dives become the ultimate playground for Tom and Jerry.'
          }
        ]
      }
    ]
  },
  {
    id: 'shaun-the-sheep',
    title: 'Shaun the Sheep',
    name: 'Shaun the Sheep',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/z2gPfTQd3I0JLWOAEdKYMQRLoun.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/onwny8s0VTTN7te9TJnItgvyWHy.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/mkd18fKB8dlLOZpzH5OMz9VIoqI.png',
    overview: 'Shaun is a clever, rather unusual sheep who leads his flock into hilarious capers on Mossy Bottom Farm, constantly dodging Bitzer the dog.',
    releaseDate: 'Aardman Animations',
    voteAverage: 8.8,
    badge: 'FREE STREAM',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Mossy Bottom Adventures',
        episodes: [
          {
            id: 'sts-e1',
            episodeNumber: 1,
            title: 'Off The Baa! - Farmyard Premiere',
            duration: '18m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/onwny8s0VTTN7te9TJnItgvyWHy.jpg',
            youtubeId: 'P4m6C5OsFz0',
            overview: 'Shaun rallies the flock into hilarious farmyard adventures and mischief without the farmer noticing.'
          },
          {
            id: 'sts-e2',
            episodeNumber: 2,
            title: 'Bathtime & Shape Up With Shaun',
            duration: '16m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/z2gPfTQd3I0JLWOAEdKYMQRLoun.jpg',
            youtubeId: 'DgDIrZX0Re8',
            overview: 'Getting the flock clean turns into an underwater carnival when Shaun discovers warm bubble bath.'
          },
          {
            id: 'sts-e3',
            episodeNumber: 3,
            title: 'Tooth Fairy & Camping Chaos',
            duration: '19m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/onwny8s0VTTN7te9TJnItgvyWHy.jpg',
            youtubeId: 'h0qXK0M4I6Q',
            overview: 'A lost tooth and a late-night camping trip in the barn bring hilarious nocturnal confusion.'
          },
          {
            id: 'sts-e4',
            episodeNumber: 4,
            title: 'Movie Time at Mossy Bottom Farm',
            duration: '22m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/z2gPfTQd3I0JLWOAEdKYMQRLoun.jpg',
            youtubeId: 'D5nvZDT5pNM',
            overview: 'Shaun sets up an outdoor cinema for the sheep while Bitzer tries to keep the peace.'
          },
          {
            id: 'sts-e5',
            episodeNumber: 5,
            title: 'Movie Nights & Creative Mischief',
            duration: '20m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/onwny8s0VTTN7te9TJnItgvyWHy.jpg',
            youtubeId: 'YyuliF8pV-s',
            overview: 'Inventive gadgets and wild farmyard escapades keep the farmer completely unaware.'
          }
        ]
      }
    ]
  },
  {
    id: 'gravity-falls',
    title: 'Gravity Falls',
    name: 'Gravity Falls',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qwi3p6PzKfQZ4YXBzv3CP5pO2dE.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/lhg7eA6CTOCL10QNVdKiyxkgPsL.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/3hbS7CLEuv7FHZeRzKxeMnoWlhe.png',
    overview: 'Twin siblings Dipper and Mabel Pines spend the summer at their great-uncle Stan\'s tourist trap in Gravity Falls, uncovering supernatural mysteries.',
    releaseDate: 'Disney Television Animation',
    voteAverage: 8.7,
    badge: 'FREE STREAM',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1 Mysteries',
        episodes: [
          {
            id: 'gf-e1',
            episodeNumber: 1,
            title: 'Tourist Trapped - Pilot Premiere',
            duration: '22m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/lhg7eA6CTOCL10QNVdKiyxkgPsL.jpg',
            youtubeId: 'o2E2wLm_LlY',
            overview: 'Dipper finds a mysterious journal in the forest that reveals supernatural anomalies hidden throughout the town.'
          }
        ]
      }
    ]
  },
  {
    id: 'avatar-the-last-airbender',
    title: 'Avatar: The Last Airbender',
    name: 'Avatar: The Last Airbender',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lzZpWEaqzP0qVA5nkCc5ASbNcSy.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/aVvRQJ2Ckhlym4uh0YGc166CUoP.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/gGdbg6Jwl6rM95BRAlf54EKNgHj.png',
    overview: 'In a war-torn world of elemental magic, a young boy reawakens to undertake a dangerous mystic quest to fulfill his destiny as the Avatar.',
    releaseDate: 'Nickelodeon Animation',
    voteAverage: 8.9,
    badge: 'FREE STREAM',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Book 1: Water',
        episodes: [
          {
            id: 'atla-e1',
            episodeNumber: 1,
            title: 'The Boy in the Iceberg',
            duration: '24m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/aVvRQJ2Ckhlym4uh0YGc166CUoP.jpg',
            youtubeId: '5KlfcKswXvs',
            overview: 'Katara and Sokka discover an extraordinary boy frozen inside an iceberg near their southern polar tribe.'
          }
        ]
      }
    ]
  }
];

// 2. TURKISH SERIES (OFFICIAL FULL HD EPISODES)
export const TURKISH_CLASSICS: StreamShow[] = [
  {
    id: 'kurtlar-vadisi',
    tmdbId: 34587,
    title: 'Kurtlar Vadisi',
    name: 'Kurtlar Vadisi',
    category: 'turkish_classics',
    categoryTitle: 'Turkish Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aGi8EuXsf5bbM4O59Uu0pucLcT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/sjLv7xpBCP7DZiYS41hMFPRyLQl.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/aWo4bjV3nS1EEIvAeC7v5of5uxy.png',
    overview: 'This is a mafia series. Intelligence agent Ali Candan changes his face and identity to Polat Alemdar to infiltrate the deepest core of the syndicate.',
    releaseDate: '2003 - 2005',
    voteAverage: 9.4,
    badge: 'FULL HD STREAM',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'kv-e1',
            episodeNumber: 1,
            title: 'Episode 1 - Operation Begins',
            duration: '68m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/sjLv7xpBCP7DZiYS41hMFPRyLQl.jpg',
            youtubeId: 'DkAHxvoA2Q8',
            overview: 'Ali Candan is called back from abroad by Aslan Akbey. Operation Valley of the Wolves officially begins.'
          },
          {
            id: 'kv-e2',
            episodeNumber: 2,
            title: 'Episode 2 - A New Life',
            duration: '72m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/aGi8EuXsf5bbM4O59Uu0pucLcT.jpg',
            youtubeId: 'lPigtgxb4Cg',
            overview: 'Polat Alemdar bids farewell to his old life under his new identity and steps into the field.'
          },
          {
            id: 'kv-e3',
            episodeNumber: 3,
            title: 'Episode 3 - The Casino Table',
            duration: '75m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/sjLv7xpBCP7DZiYS41hMFPRyLQl.jpg',
            youtubeId: 'sEBuF0hVRbc',
            overview: 'Polat and Çakır plan their first major move against common rivals in the underworld casino circle.'
          },
          {
            id: 'kv-e4',
            episodeNumber: 4,
            title: 'Episode 4 - Sevko and the Council',
            duration: '74m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/aGi8EuXsf5bbM4O59Uu0pucLcT.jpg',
            youtubeId: 'YdlTLOQGagU',
            overview: 'The council puts pressure on the streets while Polat learns the unspoken rules of the valley.'
          },
          {
            id: 'kv-e5',
            episodeNumber: 5,
            title: 'Episode 5 - Law of the Wolves',
            duration: '76m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/sjLv7xpBCP7DZiYS41hMFPRyLQl.jpg',
            youtubeId: 'WyXjWs3qXHk',
            overview: 'Aslan Akbey guides Polat through a lethal ambush as the mafia structure begins to notice him.'
          }
        ]
      }
    ]
  },
  {
    id: 'ezel',
    tmdbId: 32519,
    title: 'Ezel',
    name: 'Ezel',
    category: 'turkish_classics',
    categoryTitle: 'Turkish Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ex1K2iIwgxuzv54w89BrOJMqpTd.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/3IJPtnlFoY8bjllHxnEw21qlK2p.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/zrwsVY36od6IaXn4bZ8vBytLDYp.png',
    overview: 'Betrayed by his trusted best friends and the woman he loved, Ömer is framed and imprisoned. In prison, he meets Ramiz Dayı and returns as Ezel to claim his revenge.',
    releaseDate: '2009 - 2011',
    voteAverage: 9.6,
    badge: '1080P STREAM',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Revenge',
        episodes: [
          {
            id: 'ezel-e1',
            episodeNumber: 1,
            title: 'Episode 1 - Worse Than Death: Betrayal',
            duration: '85m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/3IJPtnlFoY8bjllHxnEw21qlK2p.jpg',
            youtubeId: 'FSo8aRocl9w',
            overview: 'Ezel appears before Eyşan, Cengiz, and Ali at the Cyprus casino as an enigmatic high-roller.'
          },
          {
            id: 'ezel-e2',
            episodeNumber: 2,
            title: 'Episode 2 - Brotherhood Forged in Betrayal',
            duration: '88m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/ex1K2iIwgxuzv54w89BrOJMqpTd.jpg',
            youtubeId: '4tulyH8Y91Q',
            overview: 'Ezel accelerates his steps to earn the confidence of Cengiz and Ali.'
          },
          {
            id: 'ezel-e3',
            episodeNumber: 3,
            title: 'Episode 3 - Shadows of the Past',
            duration: '82m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/3IJPtnlFoY8bjllHxnEw21qlK2p.jpg',
            youtubeId: 'Jqm1MDxUNlo',
            overview: 'Ezel forces Eyşan to confront the memories of Ömer without revealing his true identity.'
          },
          {
            id: 'ezel-e4',
            episodeNumber: 4,
            title: 'Episode 4 - High Stakes',
            duration: '86m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/ex1K2iIwgxuzv54w89BrOJMqpTd.jpg',
            youtubeId: 'yl-iudreN-g',
            overview: 'High stakes at the poker table test Cengiz\'s loyalty and greed.'
          },
          {
            id: 'ezel-e5',
            episodeNumber: 5,
            title: 'Episode 5 - Counsel of Uncle Ramiz',
            duration: '84m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/3IJPtnlFoY8bjllHxnEw21qlK2p.jpg',
            youtubeId: 'qH8kwrHFE5A',
            overview: 'Ramiz Dayı shares crucial wisdom about patience and vengeance with Ezel.'
          }
        ]
      }
    ]
  },
  {
    id: 'kuzey-guney',
    tmdbId: 42099,
    title: 'Kuzey Güney',
    name: 'Kuzey Güney',
    category: 'turkish_classics',
    categoryTitle: 'Turkish Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/eG35U9iYp6cWigQxIpzwlPEPY0l.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tQprHjpB1Utq3QmPDdQRKwPDDRh.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/77yJ9kKHXriIqD37rJovQTwohCm.png',
    overview: 'Two diametrically opposed brothers—one hot-headed and fearless, the other calm and studious—find their lives shattered after a tragic car crash.',
    releaseDate: '2011 - 2013',
    voteAverage: 8.8,
    badge: 'FULL HD STREAM',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'kg-e1',
            episodeNumber: 1,
            title: 'Episode 1 - Brothers Divided',
            duration: '90m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/tQprHjpB1Utq3QmPDdQRKwPDDRh.jpg',
            youtubeId: 'YjEfvVX-V9c',
            overview: 'Kuzey is released from prison after taking the fall for his brother, but the scars of the past and Cemre continue to test them.'
          },
          {
            id: 'kg-e2',
            episodeNumber: 2,
            title: 'Episode 2 - A Fresh Start',
            duration: '85m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/eG35U9iYp6cWigQxIpzwlPEPY0l.jpg',
            youtubeId: 'uPJ_O1j94Jw',
            overview: 'Kuzey enters underground street fights while Güney navigates family pressure.'
          }
        ]
      }
    ]
  },
  {
    id: 'behzat-c',
    tmdbId: 39176,
    title: 'Behzat Ç.',
    name: 'Behzat Ç. Bir Ankara Polisiyesi',
    category: 'turkish_classics',
    categoryTitle: 'Turkish Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aRqNQ5v2tvZ9ZRAXpYik0JamHkm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/pF1OQe4zaXX9vOwxbxjZzws0CAe.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/w6OVfjClWvujlCiYMcdth2H1S4E.png',
    overview: 'An unyielding homicide chief and his misfit squad navigate murder cases and deep bureaucratic corruption on the streets of Ankara.',
    releaseDate: '2010 - 2013',
    voteAverage: 9.1,
    badge: 'ORIGINAL HD',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'behzat-e1',
            episodeNumber: 1,
            title: 'Episode 1 - Homicide Division',
            duration: '78m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/pF1OQe4zaXX9vOwxbxjZzws0CAe.jpg',
            youtubeId: 'FjyoVZNJriM',
            overview: 'A suspicious homicide occurs in Ankara. Chief Inspector Behzat Ç. and his team take the case.'
          },
          {
            id: 'behzat-e2',
            episodeNumber: 2,
            title: 'Episode 2 - Justice',
            duration: '80m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/aRqNQ5v2tvZ9ZRAXpYik0JamHkm.jpg',
            youtubeId: '2foQ8FOZVsE',
            overview: 'The squad investigates the alleged suicide of a corporate executive against political obstruction.'
          }
        ]
      }
    ]
  }
];

// 3. VIRAL INDIE & WEB SERIES
export const INDIE_WEB_SERIES: StreamShow[] = [
  {
    id: 'hazbin-hotel',
    tmdbId: 94954,
    title: 'Hazbin Hotel',
    name: 'Hazbin Hotel (Official Pilot & Specials)',
    category: 'indie_web',
    categoryTitle: 'Viral Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aVYHMW8pdzJ9qG1OGRMKyGy9xor.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/9K6QtLqyocVHgIZe4yqCIl1q2ZR.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/r91aVEvQjmbR3NTbTPvqrziInHv.png',
    overview: 'In attempt to find a non-violent alternative for reducing Hell\'s overpopulation, the daughter of Lucifer opens a rehabilitation hotel.',
    releaseDate: '2019 - 2024',
    voteAverage: 8.9,
    badge: 'VIRAL HIT',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Original Pilot & Specials',
        episodes: [
          {
            id: 'hazbin-p1',
            episodeNumber: 1,
            title: 'Official Pilot - That\'s Entertainment',
            duration: '31m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/9K6QtLqyocVHgIZe4yqCIl1q2ZR.jpg',
            youtubeId: 'Zlmswo0S0e0',
            overview: 'Charlie presents her ambitious plan to rehabilitate demons to the underworld on live television.'
          }
        ]
      }
    ]
  }
];

// Master Catalog
export const ALL_STREAM_SHOWS: StreamShow[] = [
  ...KIDS_CARTOONS,
  ...TURKISH_CLASSICS,
  ...INDIE_WEB_SERIES,
];

// Helper functions
export const getAllStreamShows = (): StreamShow[] => ALL_STREAM_SHOWS;

export const getStreamShowById = (idOrTmdb: string | number): StreamShow | undefined => {
  const query = idOrTmdb.toString().toLowerCase();
  return ALL_STREAM_SHOWS.find(
    (s) => s.id.toLowerCase() === query || s.tmdbId?.toString() === query
  );
};

export const getStreamShowsByCategory = (category: StreamCategory): StreamShow[] => {
  return ALL_STREAM_SHOWS.filter((s) => s.category === category);
};

// Backward-compatibility aliases for existing cartoon calls
export type CartoonItem = StreamShow;
export type CartoonEpisode = StreamEpisode;
export type CartoonSeason = StreamSeason;

export const getAllCartoons = (): StreamShow[] => KIDS_CARTOONS;
export const getCartoonById = (id: string): StreamShow | undefined => {
  return ALL_STREAM_SHOWS.find((s) => s.id.toLowerCase() === id.toLowerCase());
};
