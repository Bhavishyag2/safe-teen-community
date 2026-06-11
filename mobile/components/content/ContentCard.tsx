import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  BorderRadius,
  FontSizes,
  Spacing,
  Shadows,
} from "@/constants/theme";
import { SECTIONS } from "@shared/constants/sections";
import type { Content, PublicUser, ContentSection } from "@shared/types";

interface ContentCardProps {
  content: Content & { author: PublicUser | null };
  onPress: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export function ContentCard({
  content,
  onPress,
  onLike,
  onBookmark,
  isLiked = false,
  isBookmarked = false,
}: ContentCardProps) {
  const section = SECTIONS[content.section as ContentSection];

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return past.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {content.cover_image_url && (
        <Image
          source={{ uri: content.cover_image_url }}
          style={styles.coverImage}
        />
      )}

      <View style={styles.content}>
        {/* Section tag */}
        <View
          style={[styles.sectionTag, { backgroundColor: section?.color + "20" }]}
        >
          <Text style={[styles.sectionTagText, { color: section?.color }]}>
            {section?.name || content.section}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>

        {/* Excerpt */}
        {content.excerpt && (
          <Text style={styles.excerpt} numberOfLines={2}>
            {content.excerpt}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {/* Author */}
          <View style={styles.author}>
            {content.author?.avatar_url ? (
              <Image
                source={{ uri: content.author.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={12} color={Colors.textLight} />
              </View>
            )}
            <Text style={styles.authorName}>
              {content.is_anonymous
                ? "Anonymous"
                : content.author?.pseudo_name || "Unknown"}
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.time}>{getTimeAgo(content.created_at)}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={18}
                color={isLiked ? Colors.error : Colors.textSecondary}
              />
              <Text style={styles.actionCount}>
                {formatCount(content.likes_count)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.actionCount}>
                {formatCount(content.comments_count)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onBookmark?.();
              }}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={16}
                color={isBookmarked ? Colors.primary : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.sm,
  },
  coverImage: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.borderLight,
  },
  content: {
    padding: Spacing.base,
  },
  sectionTag: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  sectionTagText: {
    fontSize: FontSizes.xs,
    fontWeight: "600",
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: FontSizes.md * 1.3,
  },
  excerpt: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm * 1.5,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  avatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xs,
  },
  authorName: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  dot: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginHorizontal: Spacing.xs,
  },
  time: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionCount: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});
