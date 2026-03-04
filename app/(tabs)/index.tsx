import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { getSavedMedia, type SavedMedia } from "@/lib/storage";
import { PlatformCard } from "@/components/PlatformCard";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [savedMedia, setSavedMedia] = useState<SavedMedia[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const media = await getSavedMedia();
    setSavedMedia(media);
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

  const counts = {
    whatsapp: savedMedia.filter((m) => m.platform === "whatsapp").length,
    instagram: savedMedia.filter((m) => m.platform === "instagram").length,
    facebook: savedMedia.filter((m) => m.platform === "facebook").length,
    snapchat: savedMedia.filter((m) => m.platform === "snapchat").length,
  };

  const totalSaved = savedMedia.length;
  const totalImages = savedMedia.filter((m) => m.type === "image").length;
  const totalVideos = savedMedia.filter((m) => m.type === "video").length;

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Social Status Saver
          </Text>
        </View>

        <View
          style={[styles.statsCard, { backgroundColor: theme.tint + "12" }]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.tint }]}>
                {totalSaved}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Saved
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.tint + "30" }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.tint }]}>
                {totalImages}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Images
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.tint + "30" }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.tint }]}>
                {totalVideos}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Videos
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Platforms
        </Text>

        <View style={styles.platformGrid}>
          <PlatformCard
            platform="WhatsApp"
            icon="logo-whatsapp"
            color={theme.whatsapp}
            count={counts.whatsapp}
            onPress={() => router.push("/(tabs)/whatsapp")}
          />
          <PlatformCard
            platform="Instagram"
            icon="logo-instagram"
            color={theme.instagram}
            count={counts.instagram}
            onPress={() => router.push("/(tabs)/download")}
          />
        </View>
        <View style={styles.platformGrid}>
          <PlatformCard
            platform="Facebook"
            icon="logo-facebook"
            color={theme.facebook}
            count={counts.facebook}
            onPress={() => router.push("/(tabs)/download")}
          />
          <PlatformCard
            platform="Snapchat"
            icon="logo-snapchat"
            color={theme.snapchatDark}
            count={counts.snapchat}
            onPress={() => router.push("/(tabs)/download")}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Download
        </Text>
        <Pressable
          style={[styles.quickDownload, { backgroundColor: theme.surface }]}
          onPress={() => router.push("/(tabs)/download")}
          testID="quick-download"
        >
          <View
            style={[
              styles.quickDownloadIcon,
              { backgroundColor: theme.accentLight },
            ]}
          >
            <Ionicons name="download" size={22} color={theme.accent} />
          </View>
          <View style={styles.quickDownloadText}>
            <Text
              style={[styles.quickDownloadTitle, { color: theme.text }]}
            >
              Paste a link to download
            </Text>
            <Text
              style={[
                styles.quickDownloadSub,
                { color: theme.textSecondary },
              ]}
            >
              Instagram, Facebook, Snapchat
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>

        <View style={styles.infoCard}>
          <View
            style={[
              styles.infoCardInner,
              { backgroundColor: theme.surfaceSecondary },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={theme.tint}
            />
            <Text
              style={[styles.infoText, { color: theme.textSecondary }]}
            >
              All downloads comply with platform privacy policies. Only
              publicly available content can be saved.
            </Text>
          </View>
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
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  platformGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  quickDownload: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    gap: 12,
    marginBottom: 20,
  },
  quickDownloadIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickDownloadText: {
    flex: 1,
    gap: 2,
  },
  quickDownloadTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  quickDownloadSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  infoCard: {
    marginBottom: 20,
  },
  infoCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
