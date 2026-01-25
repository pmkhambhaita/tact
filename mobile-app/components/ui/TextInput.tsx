/**
 * TextInput - Glass-styled text input
 */

import React, { forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      error,
      containerStyle,
      leftIcon,
      rightIcon,
      style,
      ...props
    },
    ref
  ) => {
    const { isDark, colors } = useTheme();

    const inputContainerStyle: ViewStyle = {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: error
        ? colors.error
        : isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
    };

    const inputStyle: ViewStyle = {
      paddingHorizontal: leftIcon ? 12 : 16,
      paddingVertical: Platform.OS === 'ios' ? 16 : 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark
        ? 'rgba(30, 41, 59, 0.4)'
        : 'rgba(255, 255, 255, 0.4)',
    };

    const renderContent = () => (
      <View style={inputStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <RNTextInput
          ref={ref}
          style={[
            styles.input,
            {
              color: colors.text,
              flex: 1,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    );

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
        )}
        <View style={inputContainerStyle}>
          {Platform.OS === 'ios' ? (
            <>
              <BlurView
                intensity={40}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              {renderContent()}
            </>
          ) : (
            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(30, 41, 59, 0.85)'
                  : 'rgba(255, 255, 255, 0.85)',
              }}
            >
              {renderContent()}
            </View>
          )}
        </View>
        {error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

export function TextArea({
  label,
  error,
  containerStyle,
  style,
  ...props
}: TextInputProps) {
  const { isDark, colors } = useTheme();

  const inputContainerStyle: ViewStyle = {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: error
      ? colors.error
      : isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)',
    minHeight: 120,
  };

  const inputStyle: ViewStyle = {
    padding: 16,
    backgroundColor: isDark
      ? 'rgba(30, 41, 59, 0.4)'
      : 'rgba(255, 255, 255, 0.4)',
    flex: 1,
  };

  const renderContent = () => (
    <View style={inputStyle}>
      <RNTextInput
        style={[
          styles.input,
          styles.textArea,
          {
            color: colors.text,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
        {...props}
      />
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View style={inputContainerStyle}>
        {Platform.OS === 'ios' ? (
          <>
            <BlurView
              intensity={40}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            {renderContent()}
          </>
        ) : (
          <View
            style={{
              backgroundColor: isDark
                ? 'rgba(30, 41, 59, 0.85)'
                : 'rgba(255, 255, 255, 0.85)',
              flex: 1,
            }}
          >
            {renderContent()}
          </View>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
  },
  textArea: {
    minHeight: 100,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
});
