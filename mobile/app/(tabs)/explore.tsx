import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { contentApi } from "@/lib/api";
import { ContentCard } from "@/components/content/ContentCard";
import { SectionCard } from "@/components/content/SectionCard";
import { Input } from "@/components/ui/Input";
import { Colors, FontSizes, Spacing, BorderRadius } from "@/constants/theme";
import { SECTIONS, SECTION_ORDER } from "@shared/constants/sections";
import type { Content, PublicUser, ContentSection } from "@shared/types";

type ContentWithAuthor = Content & { author: PublicUser | null };

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const initialSection = params.section as ContentSection | undefined;

  const [activeSection, setActiveSection] = useState<ContentSection | null>(
    initialSection || null
  );
  const [content, setContent] = useState<ContentWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchContent = useCallback(
    async (reset = false) => {
      if (!activeSection) return;

      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;

      const result = await contentApi.getBySection(activeSection, {
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery ? { search: searchQuery } : {}),
      });

      if (result.data) {
        const data = result.data as { items: ContentWithAuthor[]; meta: { hasMore: boolean } };
        if (reset) {
          setContent(data.items);
        } else {
          setContent((prev) => [...prev, ...data.items]);
        }
        setHasMore(data.meta?.hasMore ?? false);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeSection, page, searchQuery]
  );

  useEffect(() => {
    if (activeSection) {
      fetchContent(true);
    }
  }, [activeSection, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContent(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchContent();
    }
  };

  const renderSectionPicker = () => (
    <FlatList
      data={SECTION_ORDER}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.sectionPicker}
      keyExtractor={(item) => item}
      renderItem={({ item }) => {
        const section = SECTIONS[item];
        const isActive = activeSection === item;

        return (
          <TouchableOpacity
            style={[
              styles.sectionChip,
              isActive && { backgroundColor: section.color },
            ]}
            onPress={() => setActiveSection(item)}
          >
            <Text
              style={[
                styles.sectionChipText,
                isActive && { color: Colors.textOnPrimary },
              ]}
            >
              {section.name}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Input
        placeholder="Search topics..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon="search"
        rightIcon={searchQuery ? "close-circle" : undefined}
        onRightIconPress={() => setSearchQuery("")}
      />
      {renderSectionPicker()}
    </View>
  );

  if (!activeSection) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.sectionsList}>
          <Text style={styles.title}>Browse by Topic</Text>
          {SECTION_ORDER.map((sectionId) => (
            <SectionCard
              key={sectionId}
              sectionId={sectionId}
              onPress={() => setActiveSection(sectionId)}
              style={styles.sectionCard}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={content}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContentCard
            content={item}
            onPress={() => router.push(`/content/${item.section}/${item.id}`)}
            style={styles.contentCard}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={styles.loader}
            />
          ) : (
            <View style={styles.empty}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors.textLight}
              />
              <Text style={styles.emptyText}>No content found</Text>
              <Text style={styles.emptySubtext}>
                Be the first to post in this section!
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          hasMore && content.length > 0 ? (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={styles.footerLoader}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.list}
      />

      {/* Create post FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to create post screen
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.base,
    paddingBottom: 0,
  },
  sectionPicker: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  sectionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionChipText: {
    fontSize: FontSizes.sm,
    fontWeight: "500",
    color: Colors.text,
  },
  sectionsList: {
    padding: Spacing.base,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  sectionCard: {
    marginBottom: Spacing.md,
  },
  list: {
    paddingBottom: Spacing["4xl"],
  },
  contentCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  loader: {
    marginTop: Spacing["3xl"],
  },
  footerLoader: {
    marginVertical: Spacing.lg,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: "500",
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
