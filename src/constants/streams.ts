export interface StreamEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  thumbnail: string;
  youtubeId: string;
  overview: string;
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
  seasons: StreamSeason[];
}

// 1. KIDS & ANIMATION
export const KIDS_CARTOONS: StreamShow[] = [
  {
    id: 'tadc',
    title: 'The Amazing Digital Circus',
    name: 'The Amazing Digital Circus',
    category: 'kids',
    categoryTitle: 'Kids & Animation',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lpfrgfomX8uNFxv4VaEzvJGs9TK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/vPVdWiLUNQyaGMazyZGVAyRcYBG.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/kqxkOvN7wIwucwxFWdTFqL9XRi2.png',
    overview: 'A woman gets trapped in a wacky virtual world along with five other humans and is now subjected to the whims of wacky AI and their own personal traumas.',
    releaseDate: '2023 - 2024',
    voteAverage: 8.9,
    badge: 'FREE STREAM',
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
            overview: 'Pomni suddenly awakens in a bizarre circus dimension with other trapped humans, ruled by the eccentric ringmaster Caine.'
          },
          {
            id: 'tadc-s1e2',
            episodeNumber: 2,
            title: 'Candy Carrier Chaos!',
            duration: '26m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/lpfrgfomX8uNFxv4VaEzvJGs9TK.jpg',
            youtubeId: 'WkPshgM_q20',
            overview: 'The circus gang is dispatched on a wild western candy adventure involving a syrup heist and rogue bandit NPCs.'
          },
          {
            id: 'tadc-s1e3',
            episodeNumber: 3,
            title: 'The Mystery of Mildenhall Manor',
            duration: '24m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/vPVdWiLUNQyaGMazyZGVAyRcYBG.jpg',
            youtubeId: 'yqX7B7354K4',
            overview: 'Kinger and Pomni explore a haunted mansion adventure with dark secrets and unexpected psychological trials.'
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
            title: 'The Cat Concerto & Classic Chases',
            duration: '22m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/utqCOvMmjjMTlXNZz6PHOzRM5QP.jpg',
            youtubeId: '1q_n0a653tM',
            overview: 'Tom takes the grand piano stage in formal attire while Jerry makes every key an obstacle course.'
          },
          {
            id: 'tj-e2',
            episodeNumber: 2,
            title: 'Haunted Mouse & Midnight Snack',
            duration: '20m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/41EWXLXTZO4MLb2BL28mWZuydyq.jpg',
            youtubeId: 'e-gC9F5c7F4',
            overview: 'Kitchen raids after dark turn into an explosive culinary battleground between the cunning mouse and the stubborn cat.'
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
            title: 'Farmyard Olympics & Pizza Capers',
            duration: '18m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/onwny8s0VTTN7te9TJnItgvyWHy.jpg',
            youtubeId: 'Gj2KkW_eLzY',
            overview: 'Shaun rallies the flock to order take-away pizza dressed as humans without the farmer noticing.'
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
            youtubeId: 't5gW2n4eW3k',
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
            youtubeId: 'd1EnW4kn1kg',
            overview: 'Katara and Sokka discover an extraordinary boy frozen inside an iceberg near their southern polar tribe.'
          }
        ]
      }
    ]
  }
];

// 2. TÜRK DİZİ KLASİKLERİ (TÜM BÖLÜMLER RESMİ FULL HD)
export const TURKISH_CLASSICS: StreamShow[] = [
  {
    id: 'kurtlar-vadisi',
    tmdbId: 34587,
    title: 'Kurtlar Vadisi',
    name: 'Kurtlar Vadisi',
    category: 'turkish_classics',
    categoryTitle: 'Türk Dizi Klasikleri',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aGi8EuXsf5bbM4O59Uu0pucLcT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/sjLv7xpBCP7DZiYS41hMFPRyLQl.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/aWo4bjV3nS1EEIvAeC7v5of5uxy.png',
    overview: 'Bu bir mafya dizisidir. Devlet adına çalışan istihbaratçı Ali Candan, yüzünü değiştirip Polat Alemdar kimliğiyle mafyanın en derin merkezine sızar.',
    releaseDate: '2003 - 2005',
    voteAverage: 9.4,
    badge: 'TÜM BÖLÜMLER HD',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: '1. Sezon (Efsane Dönem)',
        episodes: [
          {
            id: 'kv-e1',
            episodeNumber: 1,
            title: '1. Bölüm - Operasyon Başlıyor',
            duration: '68m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/sjLv7xpBCP7DZiYS41hMFPRyLQl.jpg',
            youtubeId: 'DkAHxvoA2Q8',
            overview: 'Ali Candan yurt dışı görevindeyken Aslan Akbey tarafından çağrılır. Kurtlar Vadisi operasyonu resmen başlar.'
          },
          {
            id: 'kv-e2',
            episodeNumber: 2,
            title: '2. Bölüm - Yeni Hayat',
            duration: '72m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/aGi8EuXsf5bbM4O59Uu0pucLcT.jpg',
            youtubeId: 'lPigtgxb4Cg',
            overview: 'Polat Alemdar yeni kimliğiyle eski hayatına veda edip Çakır ile ilk teması kurmak için sahaya adım atar.'
          },
          {
            id: 'kv-e3',
            episodeNumber: 3,
            title: '3. Bölüm - Kumarhane Masası',
            duration: '75m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/sjLv7xpBCP7DZiYS41hMFPRyLQl.jpg',
            youtubeId: 'sEBuF0hVRbc',
            overview: 'Polat ve Çakır kumarhane aleminde ortak düşmanlarına karşı ilk büyük hamlelerini planlarlar.'
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
    categoryTitle: 'Türk Dizi Klasikleri',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ex1K2iIwgxuzv54w89BrOJMqpTd.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/3IJPtnlFoY8bjllHxnEw21qlK2p.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/zrwsVY36od6IaXn4bZ8vBytLDYp.png',
    overview: 'En yakın arkadaşları ve sevdiği kadın tarafından ihanete uğrayıp hapse atılan Ömer, hapiste Ramiz Dayı ile tanışıp estetik ameliyatla Ezel olarak geri döner.',
    releaseDate: '2009 - 2011',
    voteAverage: 9.6,
    badge: 'TÜM BÖLÜMLER 1080P',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: '1. Sezon: İntikam',
        episodes: [
          {
            id: 'ezel-e1',
            episodeNumber: 1,
            title: '1. Bölüm - Ölümden Beter Bir Şey Varsa O da İhanettir',
            duration: '85m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/3IJPtnlFoY8bjllHxnEw21qlK2p.jpg',
            youtubeId: 'eo76L8gueeU',
            overview: 'Ezel Kıbrıs kumarhanesinde Eyşan, Cengiz ve Ali\'nin karşısına kusursuz bir iş adamı olarak ilk kez çıkar.'
          },
          {
            id: 'ezel-e2',
            episodeNumber: 2,
            title: '2. Bölüm - İhanetle Gelen Kardeşlik',
            duration: '88m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/ex1K2iIwgxuzv54w89BrOJMqpTd.jpg',
            youtubeId: '4tulyH8Y91Q',
            overview: 'Ezel, geçmişin hesabını sormak için Cengiz ve Ali\'nin güvenini kazanma adımlarını hızlandırır.'
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
    categoryTitle: 'Türk Dizi Klasikleri',
    posterUrl: 'https://image.tmdb.org/t/p/w500/eG35U9iYp6cWigQxIpzwlPEPY0l.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tQprHjpB1Utq3QmPDdQRKwPDDRh.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/77yJ9kKHXriIqD37rJovQTwohCm.png',
    overview: 'Biri isyankar ve gözü pek, diğeri sakin ve başarılı iki kardeşin tek bir araba kazası ve aynı kıza duydukları aşk yüzünden altüst olan hayatları.',
    releaseDate: '2011 - 2013',
    voteAverage: 8.8,
    badge: 'TÜM BÖLÜMLER HD',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: '1. Sezon',
        episodes: [
          {
            id: 'kg-e1',
            episodeNumber: 1,
            title: '1. Bölüm - Kardeş Payı',
            duration: '90m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/tQprHjpB1Utq3QmPDdQRKwPDDRh.jpg',
            youtubeId: 'YjEfvVX-V9c',
            overview: 'Kuzey dört yıl hapis yattıktan sonra tahliye olur, ancak geçmişin acıları ve Cemre\'nin varlığı iki kardeşi yeniden sınar.'
          },
          {
            id: 'kg-e2',
            episodeNumber: 2,
            title: '2. Bölüm - Yeni Bir Başlangıç',
            duration: '85m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/eG35U9iYp6cWigQxIpzwlPEPY0l.jpg',
            youtubeId: 'uPJ_O1j94Jw',
            overview: 'Kuzey sokak dövüşlerine girerken Güney ailesinin beklentileri ve Simay\'ın baskısıyla mücadele eder.'
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
    categoryTitle: 'Türk Dizi Klasikleri',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aRqNQ5v2tvZ9ZRAXpYik0JamHkm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/pF1OQe4zaXX9vOwxbxjZzws0CAe.jpg',
    logoUrl: 'https://image.tmdb.org/t/p/w500/w6OVfjClWvujlCiYMcdth2H1S4E.png',
    overview: 'Ankara Emniyet Müdürlüğü Cinayet Büro Amiri Behzat Ç. ve ekibinin başkent sokaklarındaki cinayetleri kendine has kurallarıyla çözme mücadelesi.',
    releaseDate: '2010 - 2013',
    voteAverage: 9.1,
    badge: 'ORİJİNAL HD',
    isFullSeries: true,
    seasons: [
      {
        seasonNumber: 1,
        title: '1. Sezon',
        episodes: [
          {
            id: 'behzat-e1',
            episodeNumber: 1,
            title: '1. Bölüm - Cinayet Masası',
            duration: '78m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/pF1OQe4zaXX9vOwxbxjZzws0CAe.jpg',
            youtubeId: 'FjyoVZNJriM',
            overview: 'Ankara\'da şüpheli bir kadın cinayeti işlenir. Başkomiser Behzat Ç. ve ekibi Harun, Hayalet, Akbaba dosyanın peşine düşer.'
          },
          {
            id: 'behzat-e2',
            episodeNumber: 2,
            title: '2. Bölüm - Adalet',
            duration: '80m',
            thumbnail: 'https://image.tmdb.org/t/p/w500/aRqNQ5v2tvZ9ZRAXpYik0JamHkm.jpg',
            youtubeId: '2foQ8FOZVsE',
            overview: 'Cinayet masası bir holding yöneticisinin şüpheli intiharını aydınlatmaya çalışırken bürokrasinin engelleriyle karşılaşır.'
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
    categoryTitle: 'Viral Web Serileri',
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
