import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform as RNPlatform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface PlatformCardProps {
  platform: string;
  icon: string;
  color: string;
  count: number;
  onPress: () => void;
}

export function PlatformCard({
  platform,
  icon,
  color,
  count,
  onPress,
}: PlatformCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (RNPlatform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { backgroundColor: theme.surface }]}
        testID={`platform-card-${platform.toLowerCase()}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + "18" }]}>
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <Text
          style={[styles.platformName, { color: theme.text }]}
          numberOfLines={1}
        >
          {platform}
        </Text>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {count} saved
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    minWidth: 100,
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  platformName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  count: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
