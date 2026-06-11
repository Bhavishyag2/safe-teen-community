import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { messagesApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Colors, FontSizes, Spacing, BorderRadius } from "@/constants/theme";

interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string | null;
  last_message_preview: string | null;
  last_message_at: string;
  participants: Array<{
    user: {
      id: string;
      pseudo_name: string;
      avatar_url: string | null;
    };
    isAdmin: boolean;
  }>;
  myUnreadCount: number;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    const result = await messagesApi.getConversations();

    if (result.data) {
      setConversations(
        (result.data as { items: Conversation[] }).items || []
      );
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        return "Just now";
      }
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return past.toLocaleDateString();
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    // Get display info
    const otherParticipant = item.participants.find(
      (p) => p.user.pseudo_name !== "You"
    );
    const displayName =
      item.type === "group"
        ? item.name
        : otherParticipant?.user.pseudo_name || "Unknown";
    const avatarUrl = otherParticipant?.user.avatar_url;

    return (
      <TouchableOpacity
        style={styles.conversation}
        onPress={() => router.push(`/messages/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons
              name={item.type === "group" ? "people" : "person"}
              size={24}
              color={Colors.textLight}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.conversationTime}>
              {getTimeAgo(item.last_message_at)}
            </Text>
          </View>
          <View style={styles.conversationFooter}>
            <Text style={styles.conversationPreview} numberOfLines={1}>
              {item.last_message_preview || "No messages yet"}
            </Text>
            {item.myUnreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.myUnreadCount > 99 ? "99+" : item.myUnreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Card variant="outlined" style={styles.empty}>
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color={Colors.textLight}
            />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Start a conversation with someone!
            </Text>
          </Card>
        }
      />

      {/* New message FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to new message screen
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={24} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: Spacing["4xl"],
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  conversation: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  conversationName: {
    fontSize: FontSizes.base,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  conversationTime: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginLeft: Spacing.sm,
  },
  conversationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conversationPreview: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
  },
  unreadCount: {
    fontSize: FontSizes.xs,
    fontWeight: "600",
    color: Colors.textOnPrimary,
  },
  empty: {
    alignItems: "center",
    padding: Spacing["3xl"],
    marginTop: Spacing["3xl"],
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "500",
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: "center",
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
