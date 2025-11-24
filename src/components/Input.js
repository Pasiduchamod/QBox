import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../theme';

export const Input = ({ 
  label = '',
  placeholder = '',
  value = '',
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  maxLength = null,
  error = '',
  hint = '',
  disabled = false,
  style = {},
  autoCapitalize = 'sentences',
  autoCorrect = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        disabled && styles.inputContainerDisabled,
      ]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
      
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length} / {maxLength}
        </Text>
      )}
    </View>
  );
};

export const RoomCodeInput = ({ value, onChangeText, style = {} }) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.roomCodeInput}
        placeholder="Enter Room Code"
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={(text) => onChangeText(text.toUpperCase())}
        maxLength={6}
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        textAlign="center"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.md,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerDisabled: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  input: {
    fontSize: typography.md,
    color: colors.textPrimary,
    padding: 0,
    minHeight: 24,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  hintText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  characterCount: {
    fontSize: typography.xs,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  
  // Room code input specific
  roomCodeInput: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.primary,
    letterSpacing: 8,
    padding: spacing.lg,
    textAlign: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
});

export default Input;
