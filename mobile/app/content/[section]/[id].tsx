import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { contentApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { SECTIONS } from "@shared/constants/sections";
import type { Content, PublicUser, ContentSection } from "@shared/types";

type ContentWithAuthor = Content & {
  author: PublicUser | null;
  isLiked?: boolean;
  isBookmarked?: boolean;
};

interface Comment {
  id: string;
  text: string;
  created_at: string;
  likes_count: number;
  author: PublicUser;
  replies?: Comment[];
  isLiked?: boolean;
}

export default function ContentDetailScreen() {
  const { section, id } = useLocalSearchParams<{ section: string; id: string }>();

  const [content, setContent] = useState<ContentWithAuthor | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const sectionConfig = SECTIONS[section as ContentSection];

  useEffect(() => {
    fetchContent();
    fetchComments();
  }, [id, section]);

  const fetchContent = async () => {
    const result = await contentApi.getById(section!, id!);
    if (result.data) {
      setContent(result.data as ContentWithAuthor);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const result = await contentApi.getComments(section!, id!);
    if (result.data) {
      setComments((result.data as { items: Comment[] }).items || []);
    }
  };

  const handleLike = async () => {
    if (!content) return;

    const result = await contentApi.like(section!, id!);
    if (result.data) {
      const { liked } = result.data as { liked: boolean };
      setContent({
        ...content,
        isLiked: liked,
        likes_count: liked ? content.likes_count + 1 : content.likes_count - 1,
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    const result = await contentApi.addComment(section!, id!, commentText.trim());

    if (result.data) {
      setCommentText("");
      fetchComments(); // Refresh comments
    } else {
      Alert.alert("Error", "Failed to post comment. Please try again.");
    }
    setSubmittingComment(false);
  };

  const handleReport = () => {
    Alert.alert(
      "Report Content",
      "Why are you reporting this content?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Inappropriate Content",
          onPress: () => submitReport("inappropriate_content"),
        },
        {
          text: "Harassment",
          onPress: () => submitReport("harassment"),
        },
        {
          text: "Misinformation",
          onPress: () => submitReport("misinformation"),
        },
        {
          text: "Other",
          onPress: () => submitReport("other"),
        },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    const result = await contentApi.report(section!, id!, reason);
    if (result.data) {
      Alert.alert("Report Submitted", "Thank you for helping keep our community safe.");
    } else {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={styles.errorText}>Content not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: sectionConfig?.name || section,
          headerRight: () => (
            <TouchableOpacity onPress={handleReport} style={styles.headerButton}>
              <Ionicons name="flag-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Cover image */}
          {content.cover_image_url && (
            <Image
              source={{ uri: content.cover_image_url }}
              style={styles.coverImage}
            />
          )}

          {/* Header */}
          <View style={styles.header}>
            {/* Section tag */}
            <View
              style={[
                styles.sectionTag,
                { backgroundColor: sectionConfig?.color + "20" },
              ]}
            >
              <Text style={[styles.sectionTagText, { color: sectionConfig?.color }]}>
                {sectionConfig?.name || section}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{content.title}</Text>

            {/* Author and date */}
            <View style={styles.meta}>
              {content.author?.avatar_url ? (
                <Image
                  source={{ uri: content.author.avatar_url }}
                  style={styles.authorAvatar}
                />
              ) : (
                <View style={styles.authorAvatarPlaceholder}>
                  <Ionicons name="person" size={16} color={Colors.textLight} />
                </View>
              )}
              <Text style={styles.authorName}>
                {content.is_anonymous
                  ? "Anonymous"
                  : content.author?.pseudo_name || "Unknown"}
              </Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.date}>{formatDate(content.created_at)}</Text>
            </View>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.bodyText}>{content.body}</Text>
          </View>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <View style={styles.tags}>
              {content.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons
                name={content.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={content.isLiked ? Colors.error : Colors.text}
              />
              <Text style={styles.actionCount}>{content.likes_count}</Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color={Colors.text} />
              <Text style={styles.actionCount}>{content.comments_count}</Text>
            </View>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name={content.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color={content.isBookmarked ? Colors.primary : Colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Comments section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>

            {comments.length === 0 ? (
              <Card variant="outlined" style={styles.noComments}>
                <Text style={styles.noCommentsText}>
                  No comments yet. Be the first to share your thoughts!
                </Text>
              </Card>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    {comment.author?.avatar_url ? (
                      <Image
                        source={{ uri: comment.author.avatar_url }}
                        style={styles.commentAvatar}
                      />
                    ) : (
                      <View style={styles.commentAvatarPlaceholder}>
                        <Ionicons name="person" size={12} color={Colors.textLight} />
                      </View>
                    )}
                    <Text style={styles.commentAuthor}>
                      {comment.author?.pseudo_name || "Anonymous"}
                    </Text>
                    <Text style={styles.commentDate}>
                      {formatDate(comment.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.commentAction}>
                      <Ionicons
                        name={comment.isLiked ? "heart" : "heart-outline"}
                        size={16}
                        color={comment.isLiked ? Colors.error : Colors.textSecondary}
                      />
                      <Text style={styles.commentActionText}>
                        {comment.likes_count}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentAction}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={14}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.commentActionText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Comment input */}
        {content.allow_comments && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={Colors.textLight}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !commentText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color={Colors.textOnPrimary} />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={
                    commentText.trim() ? Colors.textOnPrimary : Colors.textLight
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing["3xl"],
  },
  coverImage: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.borderLight,
  },
  header: {
    padding: Spacing.base,
  },
  sectionTag: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  sectionTagText: {
    fontSize: FontSizes.xs,
    fontWeight: "600",
  },
  title: {
    fontSize: FontSizes["2xl"],
    fontWeight: "700",
    color: Colors.text,
    lineHeight: FontSizes["2xl"] * 1.3,
    marginBottom: Spacing.md,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  authorAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  authorName: {
    fontSize: FontSizes.sm,
    fontWeight: "500",
    color: Colors.text,
  },
  metaDot: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginHorizontal: Spacing.sm,
  },
  date: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  body: {
    padding: Spacing.base,
    paddingTop: 0,
  },
  bodyText: {
    fontSize: FontSizes.base,
    color: Colors.text,
    lineHeight: FontSizes.base * 1.7,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.base,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  commentsSection: {
    padding: Spacing.base,
  },
  commentsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  noComments: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  comment: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  commentAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  commentAuthor: {
    fontSize: FontSizes.sm,
    fontWeight: "500",
    color: Colors.text,
    flex: 1,
  },
  commentDate: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  commentText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: FontSizes.sm * 1.5,
  },
  commentActions: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  commentActionText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.sm,
    color: Colors.text,
    maxHeight: 80,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
});
