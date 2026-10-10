import { useLanguageStore } from '../store/useLanguageStore';

const dictionaries = {
  en: {
    // Tabs
    tab_home: 'Home',
    tab_search: 'Search',
    tab_watchlist: 'Watchlist',
    tab_settings: 'Settings',

    // Settings
    settings_title: 'Settings',
    section_app: 'APP',
    appearance: 'Appearance',
    appearance_desc: 'Dark Cinematic (Default)',
    notifications: 'Notifications',
    autoplay: 'Auto-play Trailers',
    wifi_only: 'Wi-Fi Only Downloads',
    language: 'Language',
    language_desc: 'English',
    language_desc_prompt: 'Select your preferred language',
    cancel: 'Cancel',
    section_about: 'ABOUT RED',
    privacy_policy: 'Privacy Policy',
    terms_of_use: 'Terms of Use',
    contact: 'Contact RED',
    about_red: 'About RED',
    version: 'Version',
    developed_for: 'Developed for internal testing.',
    
    // Legal Placeholders
    privacy_desc: 'RED App is designed with privacy at its core...',

    // Hero
    play: 'Play',

    // Alerts
    alert_appearance: 'RED App is optimized for Dark Cinematic mode exclusively.',
    alert_language_changed: 'Language changed successfully.',
    
    // Categories
    cat_trending: 'Trending',
    cat_movies: 'Movies',
    cat_series: 'Series',
  },
  tr: {
    // Tabs
    tab_home: 'Ana Sayfa',
    tab_search: 'Ara',
    tab_watchlist: 'Listem',
    tab_settings: 'Ayarlar',

    // Settings
    settings_title: 'Ayarlar',
    section_app: 'UYGULAMA',
    appearance: 'Görünüm',
    appearance_desc: 'Karanlık Sinematik (Varsayılan)',
    notifications: 'Bildirimler',
    autoplay: 'Fragmanları Otomatik Oynat',
    wifi_only: 'Sadece Wi-Fi İle İndir',
    language: 'Dil',
    language_desc: 'Türkçe',
    language_desc_prompt: 'Uygulama dilini seçin',
    cancel: 'İptal',
    section_about: 'RED HAKKINDA',
    privacy_policy: 'Gizlilik Politikası',
    terms_of_use: 'Kullanım Şartları',
    contact: 'RED İle İletişim',
    about_red: 'RED Hakkında',
    version: 'Sürüm',
    developed_for: 'Dahili test için geliştirilmiştir.',

    // Legal Placeholders
    privacy_desc: 'RED App gizlilik odaklı tasarlanmıştır...',

    // Hero
    play: 'Oynat',

    // Alerts
    alert_appearance: 'RED App, özel olarak Karanlık Sinematik moda optimize edilmiştir.',
    alert_language_changed: 'Dil başarıyla değiştirildi.',
    
    // Categories
    cat_trending: 'Trendler',
    cat_movies: 'Filmler',
    cat_series: 'Diziler',
  }
};

type TranslationKey = keyof typeof dictionaries.en;

export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  
  const t = (key: TranslationKey) => {
    return dictionaries[language][key] || dictionaries.en[key] || key;
  };

  return { t, language };
};
