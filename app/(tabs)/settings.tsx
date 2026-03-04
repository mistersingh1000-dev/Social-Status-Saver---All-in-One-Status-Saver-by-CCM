import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import {
  getSavedMedia,
  clearAllMedia,
  clearHistory,
  getDownloadHistory,
} from "@/lib/storage";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [savedCount, setSavedCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  const loadCounts = useCallback(async () => {
    const saved = await getSavedMedia();
    const history = await getDownloadHistory();
    setSavedCount(saved.length);
    setHistoryCount(history.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts]),
  );

  const handleClearSaved = () => {
    Alert.alert(
      "Clear Saved Media",
      "Delete all saved media? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearAllMedia();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
            loadCounts();
          },
        },
      ],
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Download History",
      "Delete all download history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
            loadCounts();
          },
        },
      ],
    );
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16 + webTopInset,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Storage
        </Text>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <SettingRow
            icon="images"
            label="Saved Media"
            value={`${savedCount} items`}
            theme={theme}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.border }]}
          />
          <SettingRow
            icon="time"
            label="Download History"
            value={`${historyCount} entries`}
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Actions
        </Text>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Pressable onPress={handleClearSaved}>
            <SettingRow
              icon="trash"
              label="Clear Saved Media"
              value=""
              theme={theme}
              showChevron
              destructive
            />
          </Pressable>
          <View
            style={[styles.divider, { backgroundColor: theme.border }]}
          />
          <Pressable onPress={handleClearHistory}>
            <SettingRow
              icon="document-text"
              label="Clear Download History"
              value=""
              theme={theme}
              showChevron
              destructive
            />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          About
        </Text>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <SettingRow
            icon="information-circle"
            label="Version"
            value="1.0.0"
            theme={theme}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.border }]}
          />
          <SettingRow
            icon="code-slash"
            label="Developer"
            value="CCM"
            theme={theme}
          />
          <View
            style={[styles.divider, { backgroundColor: theme.border }]}
          />
          <SettingRow
            icon="shield-checkmark"
            label="Privacy"
            value="Compliant"
            theme={theme}
          />
        </View>

        <View
          style={[
            styles.disclaimer,
            { backgroundColor: theme.surfaceSecondary },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={theme.textSecondary}
          />
          <Text
            style={[styles.disclaimerText, { color: theme.textSecondary }]}
          >
            This app only downloads publicly available content. It does not
            bypass any security systems or access private data. Users are
            responsible for respecting copyright and platform terms of service.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Social Status Saver - All in One Status Saver by CCM v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            All in One Status Saver by CCM
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  theme,
  showChevron,
  destructive,
}: {
  icon: string;
  label: string;
  value: string;
  theme: any;
  showChevron?: boolean;
  destructive?: boolean;
}) {
  return (
    <View style={rowStyles.container}>
      <Ionicons
        name={icon as any}
        size={20}
        color={destructive ? theme.danger : theme.tint}
      />
      <Text
        style={[
          rowStyles.label,
          { color: destructive ? theme.danger : theme.text },
        ]}
      >
        {label}
      </Text>
      <Text style={[rowStyles.value, { color: theme.textSecondary }]}>
        {value}
      </Text>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.textSecondary}
        />
      )}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  value: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    borderRadius: 14,
    marginBottom: 24,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
