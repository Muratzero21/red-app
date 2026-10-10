import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

interface REDTextProps extends TextProps {
  weight?: 'regular' | 'semibold' | 'bold';
  color?: string;
  size?: number;
}

export const REDText = ({ style, weight = 'regular', color = THEME.colors.textPrimary, size = 16, ...props }: REDTextProps) => {
  const getFontFamily = () => {
    switch (weight) {
      case 'bold':
        return 'TitilliumWeb-Bold';
      case 'semibold':
        return 'TitilliumWeb-SemiBold';
      default:
        return 'TitilliumWeb-Regular';
    }
  };

  return (
    <Text
      style={[
        {
          fontFamily: getFontFamily(),
          color,
          fontSize: size,
        },
        style,
      ]}
      {...props}
    />
  );
};
