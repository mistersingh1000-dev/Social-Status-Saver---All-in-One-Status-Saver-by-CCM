import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import {
  getSavedMedia,
  removeMedia,
  clearAllMedia,
  type SavedMedia,
} from "@/lib/storage";
import { MediaCard } from "@/components/MediaCard";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

type FilterType = "all" | "image" | "video";
type PlatformFilter = "all" | "whatsapp" | "instagram" | "facebook" | "snapchat";

export default function SavedScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [media, setMedia] = useState<SavedMedia[]>([]);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [platformFilter, setPlatformFilter] =
    useState<PlatformFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const all = await getSavedMedia();
    setMedia(all);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredMedia = media.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (platformFilter !== "all" && m.platform !== platformFilter) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    Alert.alert("Delete Media", "Remove this item from saved?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeMedia(id);
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
          }
          loadData();
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (media.length === 0) return;
    Alert.alert(
      "Clear All",
      "Delete all saved media? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearAllMedia();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
            loadData();
          },
        },
      ],
    );
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const typeFilters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "image", label: "Images" },
    { key: "video", label: "Videos" },
  ];

  const platformFilters: {
    key: PlatformFilter;
    label: string;
    icon: string;
    color: string;
  }[] = [
    { key: "all", label: "All", icon: "grid", color: theme.tint },
    {
      key: "whatsapp",
      label: "WA",
      icon: "logo-whatsapp",
      color: theme.whatsapp,
    },
    {
      key: "instagram",
      label: "IG",
      icon: "logo-instagram",
      color: theme.instagram,
    },
    {
      key: "facebook",
      label: "FB",
      icon: "logo-facebook",
      color: theme.facebook,
    },
    {
      key: "snapchat",
      label: "SC",
      icon: "logo-snapchat",
      color: theme.snapchatDark,
    },
  ];

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>Saved</Text>
          {media.length > 0 && (
            <Pressable onPress={handleClearAll} hitSlop={8}>
              <Ionicons
                name="trash-outline"
                size={22}
                color={theme.danger}
              />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {platformFilters.map((f) => {
            const active = platformFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setPlatformFilter(f.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? f.color + "20"
                      : theme.surface,
                    borderColor: active ? f.color : "transparent",
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name={f.icon as any}
                  size={16}
                  color={active ? f.color : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? f.color : theme.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.typeFilterRow}>
          {typeFilters.map((f) => {
            const active = typeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setTypeFilter(f.key)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: active ? theme.tint : theme.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    { color: active ? "#fff" : theme.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredMedia.length > 0 ? (
          <View style={styles.mediaGrid}>
            {filteredMedia.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onPress={() => {}}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Ionicons
                name="folder-open-outline"
                size={44}
                color={theme.textSecondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {media.length === 0
                ? "No saved media yet"
                : "No matching media"}
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                { color: theme.textSecondary },
              ]}
            >
              {media.length === 0
                ? "Download media from social platforms and it will appear here."
                : "Try changing your filters to find what you're looking for."}
            </Text>
          </View>
        )}

        <View style={styles.countBar}>
          <Text style={[styles.countText, { color: theme.textSecondary }]}>
            {filteredMedia.length} of {media.length} items
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  filterRow: {
    marginBottom: 12,
    marginHorizontal: -20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  typeFilterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 30,
  },
  countBar: {
    alignItems: "center",
    paddingVertical: 12,
  },
  countText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
