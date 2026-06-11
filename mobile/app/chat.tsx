import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { chatApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Colors, FontSizes, Spacing, BorderRadius } from "@/constants/theme";
import { CHATBOT_CONFIG } from "@shared/constants/chatbot";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Send initial greeting
  useEffect(() => {
    const greeting = {
      id: "greeting",
      role: "assistant" as const,
      content: `Hey there! I'm ${CHATBOT_CONFIG.name} ${CHATBOT_CONFIG.emoji} - your fun best friend who's always here to chat! What's on your mind today?`,
      created_at: new Date().toISOString(),
    };
    setMessages([greeting]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const result = await chatApi.sendMessage(
      userMessage.content,
      sessionId || undefined
    );

    if (result.data) {
      const data = result.data as {
        sessionId: string;
        assistantMessage: ChatMessage;
        hasCrisisFlag?: boolean;
      };

      setSessionId(data.sessionId);

      const assistantMessage: ChatMessage = {
        id: data.assistantMessage?.id || Date.now().toString() + "-assistant",
        role: "assistant",
        content: data.assistantMessage?.content || "I'm here for you!",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      // Error response
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content:
          "Oops! I'm having a little trouble right now. Can you try again? 💜",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{CHATBOT_CONFIG.emoji}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.assistantMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingIndicator}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{CHATBOT_CONFIG.emoji}</Text>
          </View>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.typingText}>Sakhi is typing...</Text>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textLight}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Ionicons
            name="send"
            size={20}
            color={input.trim() ? Colors.textOnPrimary : Colors.textLight}
          />
        </TouchableOpacity>
      </View>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <View style={styles.quickPrompts}>
          {[
            "I need advice about friendships",
            "I'm stressed about exams",
            "Tell me about period health",
            "I want to talk about my feelings",
          ].map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickPrompt}
              onPress={() => {
                setInput(prompt);
              }}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    padding: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  assistantMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  avatar: {
    fontSize: 18,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Spacing.xs,
  },
  assistantBubble: {
    backgroundColor: Colors.surfaceSecondary,
    borderBottomLeftRadius: Spacing.xs,
  },
  messageText: {
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * 1.5,
  },
  userMessageText: {
    color: Colors.textOnPrimary,
  },
  assistantMessageText: {
    color: Colors.text,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  typingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.text,
    maxHeight: 100,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  quickPrompts: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.base,
    paddingTop: 0,
    gap: Spacing.sm,
  },
  quickPrompt: {
    backgroundColor: Colors.primaryLight + "30",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  quickPromptText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
  },
});
