import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

interface UrlInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function UrlInput({
  value,
  onChangeText,
  onSubmit,
  isLoading,
  placeholder = "Paste media URL here...",
}: UrlInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        onChangeText(text);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch {}
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: isFocused ? theme.tint : theme.border,
        },
      ]}
    >
      <Ionicons
        name="link"
        size={20}
        color={isFocused ? theme.tint : theme.textSecondary}
        style={styles.linkIcon}
      />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!isLoading}
        testID="url-input"
      />
      {!value ? (
        <Pressable
          onPress={handlePaste}
          style={[styles.actionBtn, { backgroundColor: theme.tintLight }]}
          testID="paste-button"
        >
          <Ionicons name="clipboard" size={18} color={theme.tint} />
        </Pressable>
      ) : isLoading ? (
        <View style={[styles.actionBtn, { backgroundColor: theme.tintLight }]}>
          <ActivityIndicator size="small" color={theme.tint} />
        </View>
      ) : (
        <Pressable
          onPress={onSubmit}
          style={[styles.actionBtn, { backgroundColor: theme.tint }]}
          testID="download-button"
        >
          <Ionicons name="download" size={18} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingLeft: 12,
    paddingRight: 6,
    height: 52,
    gap: 8,
  },
  linkIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
