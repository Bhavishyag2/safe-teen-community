import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, BorderRadius, FontSizes, Spacing, Shadows } from "@/constants/theme";
import { SECTIONS, type SectionConfig } from "@shared/constants/sections";
import type { ContentSection } from "@shared/types";

interface SectionCardProps {
  sectionId: ContentSection;
  onPress: () => void;
  compact?: boolean;
}

const SECTION_ICONS: Record<ContentSection, keyof typeof Ionicons.glyphMap> = {
  relationships: "heart",
  fashion: "shirt",
  health: "fitness",
  school: "book",
  career: "briefcase",
  period_health: "water",
  beauty_selfcare: "sparkles",
};

export function SectionCard({ sectionId, onPress, compact = false }: SectionCardProps) {
  const section = SECTIONS[sectionId];

  if (!section) return null;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: section.color + "15" }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: section.color }]}>
          <Ionicons
            name={SECTION_ICONS[sectionId]}
            size={20}
            color={Colors.textOnPrimary}
          />
        </View>
        <Text style={styles.compactName}>{section.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: section.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainerLarge, { backgroundColor: section.color }]}>
        <Ionicons
          name={SECTION_ICONS[sectionId]}
          size={24}
          color={Colors.textOnPrimary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{section.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {section.description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors.textLight}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
  iconContainerLarge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  // Compact styles
  compactCard: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: 100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  compactName: {
    fontSize: FontSizes.xs,
    fontWeight: "500",
    color: Colors.text,
    textAlign: "center",
  },
});
