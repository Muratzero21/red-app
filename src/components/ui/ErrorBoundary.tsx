import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { REDText } from './REDText';
import { THEME } from '../../constants/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error caught by boundary:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <REDText size={32} weight="bold" color={THEME.colors.red} style={styles.title}>
            RED
          </REDText>
          <REDText size={18} weight="bold" style={styles.subtitle}>
            Something went wrong
          </REDText>
          <REDText size={14} color={THEME.colors.textSecondary} style={styles.message}>
            The application encountered an unexpected issue. Tap below to reload.
          </REDText>
          <TouchableOpacity 
            style={styles.button}
            onPress={this.handleRestart}
            activeOpacity={0.8}
          >
            <REDText size={16} weight="bold" color="#fff">
              Reload App
            </REDText>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1015',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    letterSpacing: 4,
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    backgroundColor: THEME.colors.red,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
  },
});
