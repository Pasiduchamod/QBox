import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

export const Container = ({ children, style = {} }) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

export const Screen = ({ children, style = {} }) => {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'bottom', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});

export { Button } from './Button';
export { Card, QuestionCard } from './Card';
export { Input, RoomCodeInput } from './Input';
