import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { getSavedMedia, removeMedia, type SavedMedia } from "@/lib/storage";
import { MediaCard } from "@/components/MediaCard";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function WhatsAppScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [whatsappMedia, setWhatsappMedia] = useState<SavedMedia[]>([]);

  const loadData = useCallback(async () => {
    const all = await getSavedMedia();
    setWhatsappMedia(all.filter((m) => m.platform === "whatsapp"));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

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
        <View style={styles.header}>
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: theme.whatsapp + "18" },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={28} color={theme.whatsapp} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            WhatsApp Status
          </Text>
        </View>

        <View
          style={[
            styles.infoBox,
            { backgroundColor: theme.surfaceSecondary },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={22}
            color={theme.accent}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              How it works
            </Text>
            <Text
              style={[styles.infoDescription, { color: theme.textSecondary }]}
            >
              On Android devices with proper file access permissions, this
              feature reads visible WhatsApp statuses from the public media
              directory. View a contact's status in WhatsApp first, then open
              this app to see and save it.
            </Text>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <StepItem
            number={1}
            title="View status in WhatsApp"
            description="Open WhatsApp and view the status you want to save"
            icon="eye"
            theme={theme}
          />
          <StepItem
            number={2}
            title="Open Social Status Saver"
            description="Come back to this app to see the viewed statuses"
            icon="apps"
            theme={theme}
          />
          <StepItem
            number={3}
            title="Save to gallery"
            description="Tap save to download images and videos to your device"
            icon="download"
            theme={theme}
          />
        </View>

        {whatsappMedia.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Saved WhatsApp Statuses
            </Text>
            <View style={styles.mediaGrid}>
              {whatsappMedia.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onPress={() => {}}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </View>
          </>
        )}

        {whatsappMedia.length === 0 && (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Ionicons
                name="images-outline"
                size={40}
                color={theme.textSecondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No saved statuses yet
            </Text>
            <Text
              style={[styles.emptyDescription, { color: theme.textSecondary }]}
            >
              View WhatsApp statuses on your device, then come back here to
              save them.
            </Text>
          </View>
        )}

        <View
          style={[
            styles.noteBox,
            {
              backgroundColor: theme.tintLight,
              borderColor: theme.tint + "30",
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={18} color={theme.tint} />
          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            Social Status Saver only accesses publicly visible statuses. No private
            data is accessed or stored.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StepItem({
  number,
  title,
  description,
  icon,
  theme,
}: {
  number: number;
  title: string;
  description: string;
  icon: string;
  theme: any;
}) {
  return (
    <View style={[stepStyles.container, { backgroundColor: theme.surface }]}>
      <View
        style={[stepStyles.numberBadge, { backgroundColor: theme.tint + "18" }]}
      >
        <Text style={[stepStyles.number, { color: theme.tint }]}>
          {number}
        </Text>
      </View>
      <View style={stepStyles.content}>
        <Text style={[stepStyles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[stepStyles.description, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Ionicons name={icon as any} size={22} color={theme.tint} />
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 12,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  infoDescription: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
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
    paddingHorizontal: 20,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
