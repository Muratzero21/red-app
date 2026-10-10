import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { REDText } from '../ui/REDText';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';

const CATEGORIES = [
  "TV Shows",
  "Movies",
  "Categories",
];

export const CategoriesBar = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: Math.max(insets.top, 16) + 50 }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat, index) => (
          <Pressable key={index} style={styles.pillContainer}>
            <BlurView intensity={20} tint="dark" style={styles.pill}>
              <REDText size={13} weight="semibold" style={styles.text}>
                {cat}
              </REDText>
              {cat === 'Categories' && (
                <ChevronDown color="#fff" size={14} style={{ marginLeft: 4 }} />
              )}
            </BlurView>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 90,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  pillContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  text: {
    letterSpacing: 0.3,
  }
});
