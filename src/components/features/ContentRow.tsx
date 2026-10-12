import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { REDText } from '../ui/REDText';
import { MovieCard } from './MovieCard';
import { THEME } from '../../constants/theme';

interface ContentRowProps {
  title: string;
  data: any[];
  onItemPress?: (id: string) => void;
  renderType?: 'movie' | 'person';
}

export const ContentRow = ({ title, data, onItemPress, renderType = 'movie' }: ContentRowProps) => {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <REDText weight="bold" size={18} style={styles.title}>
        {title}
      </REDText>
      
      <View style={{ height: renderType === 'person' ? 160 : 240 }}>
        <FlashList
          data={data}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              {renderType === 'person' ? (
                <Pressable onPress={() => onItemPress?.(item.id)} style={{ alignItems: 'center' }}>
                  {(item.profileUrl || item.posterUrl) ? (
                    <Image source={{ uri: item.profileUrl || item.posterUrl }} style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#11131a' }} contentFit="cover" transition={300} />
                  ) : (
                    <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#1a1d24' }} />
                  )}
                  <REDText size={13} style={{ marginTop: 12, textAlign: 'center', width: 120 }} numberOfLines={1}>{item.title || item.name}</REDText>
                </Pressable>
              ) : (
                <MovieCard
                  id={item.id}
                  title={item.title}
                  posterUrl={item.posterUrl}
                  onPress={() => onItemPress?.(item.id)}
                />
              )}
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  cardWrapper: {
    marginRight: 16,
  },
});
