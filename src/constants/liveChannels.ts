export type LiveChannelCategory = 'kids' | 'space_science' | 'news' | 'music';

export interface LiveChannel {
  id: string;
  name: string;
  currentProgram: string;
  category: LiveChannelCategory;
  categoryLabel: string;
  youtubeId: string;
  backupYoutubeIds: string[];
  thumbnail: string;
  viewersLabel: string;
  description: string;
}

export const LIVE_CHANNELS: LiveChannel[] = [
  {
    id: 'cn-global-live',
    name: 'Cartoon Network 24/7',
    currentProgram: 'Gumball, Teen Titans Go! & We Bare Bears Marathon',
    category: 'kids',
    categoryLabel: 'Kids & Animation',
    youtubeId: '9f7G0sR45C8',
    backupYoutubeIds: ['B5Q2u5F6c2w', 'riazU2Vbvh8', 'kK3vL8jV-q8'],
    thumbnail: 'https://image.tmdb.org/t/p/w780/w1be1Dq0bd379129c7A3c3C738c.jpg',
    viewersLabel: '24.8K watching',
    description: 'Non-stop official Cartoon Network hits featuring The Amazing World of Gumball, Adventure Time, Regular Show, and Teen Titans Go!',
  },
  {
    id: 'nasa-iss-live',
    name: 'NASA Live: Earth From Space',
    currentProgram: 'ISS High-Definition Live Earth Feed',
    category: 'space_science',
    categoryLabel: 'Space & Science',
    youtubeId: 'xRPjKQtRXR8',
    backupYoutubeIds: ['21X5lGlDOfg', 'P9C25Un7xaM'],
    thumbnail: 'https://img.youtube.com/vi/xRPjKQtRXR8/hqdefault.jpg',
    viewersLabel: '19.4K watching',
    description: '24/7 live exterior views of the Earth streamed directly from cameras aboard the International Space Station.',
  },
  {
    id: 'tayo-pororo-live',
    name: 'Tayo & Pororo 24/7 TV',
    currentProgram: 'Tayo the Little Bus & Titipo Full Episodes Live',
    category: 'kids',
    categoryLabel: 'Kids & Animation',
    youtubeId: 'z_qxfE7t7RM',
    backupYoutubeIds: ['FTFRKsoXAAU', 'hQ-dF1t7_9M'],
    thumbnail: 'https://image.tmdb.org/t/p/w780/fLn6AM7jUpXNrUOoAAJuHXaI9En.jpg',
    viewersLabel: '16.2K watching',
    description: 'Official 24/7 family animation stream featuring Tayo the Little Bus, Pororo the Little Penguin, and Titipo Titipo.',
  },
  {
    id: 'lofi-girl-live',
    name: 'Lofi Girl 24/7 Radio',
    currentProgram: 'Beats to Relax / Study To (Live Stream)',
    category: 'music',
    categoryLabel: '24/7 Music',
    youtubeId: 'jfKfPfyJRdk',
    backupYoutubeIds: ['4xDzrJKXOOY'],
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    viewersLabel: '38.5K watching',
    description: 'The world-famous 24/7 chill beats live radio stream for relaxing, working, and studying.',
  },
  {
    id: 'wb-kids-tom-jerry-live',
    name: 'WB Kids: Tom & Jerry 24/7',
    currentProgram: 'Classic Slapstick & Golden Era Chase Marathon',
    category: 'kids',
    categoryLabel: 'Kids & Animation',
    youtubeId: 't0Q2otsqC4I',
    backupYoutubeIds: ['Si7DovGBDuQ', 'ugZMQUnfqss', 'giO_iq5Xe_c'],
    thumbnail: 'https://image.tmdb.org/t/p/w780/utqCOvMmjjMTlXNZz6PHOzRM5QP.jpg',
    viewersLabel: '21.1K watching',
    description: 'Continuous slapstick comedy with Tom and Jerry across their most iconic animated episodes.',
  },
  {
    id: 'sky-news-live',
    name: 'Sky News Global 24/7',
    currentProgram: 'Breaking World News & Global Coverage',
    category: 'news',
    categoryLabel: 'World News',
    youtubeId: 'YDvsBbKfLPA',
    backupYoutubeIds: ['9Auq9mYxFEE', 'pykpO5kQJ98'],
    thumbnail: 'https://img.youtube.com/vi/YDvsBbKfLPA/hqdefault.jpg',
    viewersLabel: '14.7K watching',
    description: 'Live 24-hour international news headlines, global affairs, technology, and business updates in English.',
  },
  {
    id: 'shaun-the-sheep-live',
    name: 'Aardman: Shaun the Sheep TV',
    currentProgram: 'Mossy Bottom Farm Non-Stop Adventures',
    category: 'kids',
    categoryLabel: 'Kids & Animation',
    youtubeId: 'P4m6C5OsFz0',
    backupYoutubeIds: ['DgDIrZX0Re8', 'h0qXK0M4I6Q', 'D5nvZDT5pNM'],
    thumbnail: 'https://image.tmdb.org/t/p/w780/onwny8s0VTTN7te9TJnItgvyWHy.jpg',
    viewersLabel: '11.9K watching',
    description: 'Watch Shaun, Bitzer, and the flock in non-stop stop-motion comedy from Aardman Animations.',
  },
  {
    id: 'euronews-english-live',
    name: 'Euronews English Live',
    currentProgram: '24/7 International News & Culture',
    category: 'news',
    categoryLabel: 'World News',
    youtubeId: 'pykpO5kQJ98',
    backupYoutubeIds: ['Ap-UM1O9RBU', 'gCNeDWCI0vo'],
    thumbnail: 'https://img.youtube.com/vi/pykpO5kQJ98/hqdefault.jpg',
    viewersLabel: '9.8K watching',
    description: 'Continuous international news broadcast covering global events, science, cinema, and world markets.',
  },
  {
    id: 'dw-news-global',
    name: 'DW News International',
    currentProgram: 'Global Stories, Science & Documentaries',
    category: 'news',
    categoryLabel: 'World News',
    youtubeId: 'V9KZGs1MtP4',
    backupYoutubeIds: ['GE_SfNVNyqk', 'gCNeDWCI0vo'],
    thumbnail: 'https://img.youtube.com/vi/V9KZGs1MtP4/hqdefault.jpg',
    viewersLabel: '12.3K watching',
    description: '24/7 global English news and in-depth documentaries from Deutsche Welle.',
  },
];

export const getLiveChannelById = (id?: string): LiveChannel => {
  if (!id) return LIVE_CHANNELS[0];
  return LIVE_CHANNELS.find((c) => c.id === id) || LIVE_CHANNELS[0];
};
