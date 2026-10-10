import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Bell, HardDrive, Shield, ChevronRight, Moon, Globe, Info, Mail, FileText, Link, Tv, MonitorPlay } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';
import { REDText } from '../../src/components/ui/REDText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from '../../src/i18n/translations';
import { useLanguageStore } from '../../src/store/useLanguageStore';
import { queryClient } from '../../app/_layout';
import { clearTmdbCache } from '../../src/services/tmdb';

interface SettingRowProps {
  icon: any;
  title: string;
  subtitle?: string;
  type?: 'link' | 'toggle';
  value?: boolean;
  onValueChange?: (v: boolean) => void;
  onPress?: () => void;
}

const SettingRow = ({ icon: Icon, title, subtitle, type = 'link', value, onValueChange, onPress }: SettingRowProps) => (
  <Pressable 
    style={({ pressed }) => [styles.row, pressed && type === 'link' && { opacity: 0.7 }]}
    onPress={type === 'toggle' ? () => onValueChange?.(!value) : onPress}
  >
    <View style={styles.rowIcon}>
      <Icon color="rgba(255,255,255,0.7)" size={22} />
    </View>
    <View style={styles.rowText}>
      <REDText size={16} weight="semibold">{title}</REDText>
      {subtitle && <REDText size={12} color={THEME.colors.textSecondary} style={{ marginTop: 2 }}>{subtitle}</REDText>}
    </View>
    <View style={styles.rowAction}>
      {type === 'toggle' ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: THEME.colors.red }}
          thumbColor="#fff"
        />
      ) : (
        <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
      )}
    </View>
  </Pressable>
);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  
  // States
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // App Version
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  // Load Settings from Storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notif = await AsyncStorage.getItem('@settings_notifications');
        const auto = await AsyncStorage.getItem('@settings_autoplay');
        const wifi = await AsyncStorage.getItem('@settings_wifi');
        
        if (notif !== null) setNotifications(notif === 'true');
        if (auto !== null) setAutoPlay(auto === 'true');
        if (wifi !== null) setWifiOnly(wifi === 'true');
        
        setIsLoaded(true);
      } catch (e) {
        console.error("Failed to load settings", e);
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // Save Settings when they change
  const handleTogglePlatform = async (platformId: string) => {
    const newState = { ...connectedPlatforms, [platformId]: !connectedPlatforms[platformId] };
    setConnectedPlatforms(newState);
    await AsyncStorage.setItem('@connected_platforms', JSON.stringify(newState));
  };

  const handleToggle = async (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open the link.");
    });
  };

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const selectLanguage = (lang: 'en' | 'tr') => {
    if (language !== lang) {
      setLanguage(lang).then(() => {
        clearTmdbCache();
        queryClient.invalidateQueries();
        setLanguageModalVisible(false);
      });
    } else {
      setLanguageModalVisible(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.header}>
        <REDText size={28} weight="bold">{t('settings_title')}</REDText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <REDText size={13} weight="bold" color={THEME.colors.textSecondary} style={styles.sectionTitle}>{t('section_app')}</REDText>
        <View style={styles.section}>
          <SettingRow 
            icon={Moon} 
            title={t('appearance')} 
            subtitle={t('appearance_desc')} 
            onPress={() => Alert.alert("RED App", t('alert_appearance'))}
          />
          <SettingRow 
            icon={Bell} 
            title={t('notifications')} 
            type="toggle" 
            value={notifications} 
            onValueChange={(v) => handleToggle('@settings_notifications', v, setNotifications)} 
          />
          <SettingRow 
            icon={Play} 
            title={t('autoplay')} 
            type="toggle" 
            value={autoPlay} 
            onValueChange={(v) => handleToggle('@settings_autoplay', v, setAutoPlay)} 
          />
          <SettingRow 
            icon={HardDrive} 
            title={t('wifi_only')} 
            type="toggle" 
            value={wifiOnly} 
            onValueChange={(v) => handleToggle('@settings_wifi', v, setWifiOnly)} 
          />
          <SettingRow 
            icon={Globe} 
            title={t('language')} 
            subtitle={language === 'en' ? 'English' : 'Türkçe'} 
            onPress={() => setLanguageModalVisible(true)}
          />
        </View>

        <REDText size={13} weight="bold" color={THEME.colors.textSecondary} style={styles.sectionTitle}>{t('section_about')}</REDText>
        <View style={styles.section}>
          <SettingRow 
            icon={Shield} 
            title={t('privacy_policy')} 
            onPress={() => router.push('/legal/privacy')}
          />
          <SettingRow 
            icon={FileText} 
            title={t('terms_of_use')} 
            onPress={() => router.push('/legal/terms')}
          />
          <SettingRow 
            icon={Mail} 
            title={t('contact')} 
            onPress={() => openUrl('mailto:hello@reddiscovery.com')}
          />
          <SettingRow 
            icon={Info} 
            title={t('about_red')} 
            onPress={() => router.push('/legal/about')}
          />
          <SettingRow 
            icon={Info} 
            title={t('version')} 
            subtitle={appVersion}
            onPress={() => Alert.alert("RED App", `Version ${appVersion}`)}
          />
        </View>

        <View style={styles.footer}>
          <REDText size={12} color="rgba(255,255,255,0.3)" style={{ textAlign: 'center', marginTop: 12 }}>
            {t('developed_for')}
          </REDText>
        </View>

      </ScrollView>

      {/* Beautiful Language Modal */}
      {languageModalVisible && (
        <View style={[StyleSheet.absoluteFill, styles.modalOverlay]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setLanguageModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalDragIndicator} />
            <REDText size={20} weight="bold" style={{ marginBottom: 24, textAlign: 'center' }}>
              {t('language_desc_prompt') || 'Select Language'}
            </REDText>
            
            <Pressable 
              style={[styles.languageOption, language === 'en' && styles.languageOptionSelected]}
              onPress={() => selectLanguage('en')}
            >
              <REDText size={16} weight={language === 'en' ? 'bold' : 'medium'}>English</REDText>
              {language === 'en' && <View style={styles.radioSelected}><View style={styles.radioInner} /></View>}
              {language !== 'en' && <View style={styles.radioUnselected} />}
            </Pressable>

            <Pressable 
              style={[styles.languageOption, language === 'tr' && styles.languageOptionSelected]}
              onPress={() => selectLanguage('tr')}
            >
              <REDText size={16} weight={language === 'tr' ? 'bold' : 'medium'}>Türkçe</REDText>
              {language === 'tr' && <View style={styles.radioSelected}><View style={styles.radioInner} /></View>}
              {language !== 'tr' && <View style={styles.radioUnselected} />}
            </Pressable>

          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
  content: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 100, // For bottom tab bar
  },
  sectionTitle: {
    marginBottom: 12,
    letterSpacing: 1,
    marginLeft: 4,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowText: {
    flex: 1,
  },
  rowAction: {
    marginLeft: 16,
  },
  footer: {
    marginTop: 8,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: -8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  languageOptionSelected: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderColor: THEME.colors.red,
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.red,
  }
});
