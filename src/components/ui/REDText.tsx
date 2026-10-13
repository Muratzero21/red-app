import React from 'react';
import { Text, TextProps, Platform } from 'react-native';
import { THEME } from '../../constants/theme';

interface REDTextProps extends TextProps {
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
  color?: string;
  size?: number;
}

export const REDText = ({ style, weight = 'regular', color = THEME.colors.textPrimary, size = 16, ...props }: REDTextProps) => {
  const getFontWeight = (): any => {
    switch (weight) {
      case 'bold':
      case 'heavy':
        return '700';
      case 'semibold':
        return '600';
      case 'medium':
        return '500';
      default:
        return '400';
    }
  };

  return (
    <Text
      style={[
        {
          fontWeight: getFontWeight(),
          color,
          fontSize: size,
        },
        style,
      ]}
      {...props}
    />
  );
};
