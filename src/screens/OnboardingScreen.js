import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Screen, Button } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';

const logo = require('../../assets/Logo/QBox logo png.png');

export const OnboardingScreen = ({ navigation }) => {
  return (
    <Screen style={styles.screen}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={logo} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>QBox</Text>
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Ask Freely, Learn Better</Text>
          <Text style={styles.subtitle}>
            Anonymous Q&A platform for interactive classroom sessions
          </Text>
        </View>

        
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Join Room"
          onPress={() => navigation.navigate('JoinRoom')}
          variant="primary"
          size="large"
          fullWidth
          style={styles.button}
        />
        
        <Button
          title="Create Room"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          size="large"
          fullWidth
          style={styles.button}
        />

        <Text style={styles.footerText}>
          Create a room if you're an instructor, or join an existing room to ask questions
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Logo section
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  
  // Tagline section
  taglineContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  tagline: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.md,
  },
  
  // Illustration
  illustrationContainer: {
    marginVertical: spacing.xxl,
  },
  illustration: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  
  // Buttons
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: spacing.md,
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: typography.lineHeight.relaxed * typography.sm,
  },
});

export default OnboardingScreen;
