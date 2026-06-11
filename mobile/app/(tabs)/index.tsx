import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { contentApi } from "@/lib/api";
import { SectionCard } from "@/components/content/SectionCard";
import { ContentCard } from "@/components/content/ContentCard";
import { Card } from "@/components/ui/Card";
import { Colors, FontSizes, Spacing, BorderRadius } from "@/constants/theme";
import { SECTION_ORDER } from "@shared/constants/sections";
import type { Content, PublicUser, ContentSection } from "@shared/types";

type ContentWithAuthor = Content & { author: PublicUser | null };

export default function HomeScreen() {
  const { profile } = useAuth();
  const [featuredContent, setFeaturedContent] = useState<ContentWithAuthor[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContent = async () => {
    // Fetch featured content from relationships section
    const result = await contentApi.getBySection("relationships", {
      limit: "5",
      featured: "true",
    });

    if (result.data) {
      setFeaturedContent((result.data as { items: ContentWithAuthor[] }).items || []);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome section */}
      <View style={styles.welcome}>
        <Text style={styles.greeting}>
          {greeting()}, {profile?.pseudo_name || "there"}!
        </Text>
        <Text style={styles.subGreeting}>What would you like to explore today?</Text>
      </View>

      {/* Chat with Sakhi */}
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => router.push("/chat")}
        activeOpacity={0.8}
      >
        <View style={styles.chatIcon}>
          <Text style={styles.chatEmoji}>✨</Text>
        </View>
        <View style={styles.chatContent}>
          <Text style={styles.chatTitle}>Chat with Sakhi</Text>
          <Text style={styles.chatSubtitle}>
            Your fun best friend is here to help!
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
      </TouchableOpacity>

      {/* Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Topics</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionsScroll}
        >
          {SECTION_ORDER.map((sectionId) => (
            <SectionCard
              key={sectionId}
              sectionId={sectionId}
              compact
              onPress={() => router.push(`/explore?section=${sectionId}`)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Featured content */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>For You</Text>
          <TouchableOpacity onPress={() => router.push("/explore")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {featuredContent.length > 0 ? (
          featuredContent.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onPress={() =>
                router.push(`/content/${item.section}/${item.id}`)
              }
              style={styles.contentCard}
            />
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No content yet. Be the first to post!
            </Text>
          </Card>
        )}
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: Colors.health }]}
            >
              <Ionicons name="fitness" size={20} color={Colors.textOnPrimary} />
            </View>
            <Text style={styles.quickActionText}>Period Tracker</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: Colors.school }]}
            >
              <Ionicons name="book" size={20} color={Colors.textOnPrimary} />
            </View>
            <Text style={styles.quickActionText}>Study Tips</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: Colors.relationships },
              ]}
            >
              <Ionicons name="heart" size={20} color={Colors.textOnPrimary} />
            </View>
            <Text style={styles.quickActionText}>Advice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: Colors.career }]}
            >
              <Ionicons name="bulb" size={20} color={Colors.textOnPrimary} />
            </View>
            <Text style={styles.quickActionText}>Resources</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing["3xl"],
  },
  welcome: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSizes["2xl"],
    fontWeight: "700",
    color: Colors.text,
  },
  subGreeting: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Chat card
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight + "30",
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  chatEmoji: {
    fontSize: 24,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.text,
  },
  chatSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: "500",
  },
  sectionsScroll: {
    gap: Spacing.md,
    paddingRight: Spacing.base,
  },
  contentCard: {
    marginBottom: Spacing.md,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },

  // Quick actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
