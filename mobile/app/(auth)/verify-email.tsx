import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Colors, FontSizes, Spacing, BorderRadius } from "@/constants/theme";

export default function VerifyEmailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={64} color={Colors.primary} />
        </View>

        {/* Text */}
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.description}>
          We've sent a verification link to your email address. Click the link to
          verify your account and complete registration.
        </Text>

        {/* Tips */}
        <View style={styles.tips}>
          <Text style={styles.tipTitle}>Didn't receive the email?</Text>
          <Text style={styles.tipText}>• Check your spam or junk folder</Text>
          <Text style={styles.tipText}>• Make sure you entered the correct email</Text>
          <Text style={styles.tipText}>• Wait a few minutes and check again</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Resend Email"
            onPress={() => {
              // TODO: Implement resend
            }}
            variant="outline"
            size="lg"
            style={styles.button}
          />

          <Button
            title="Back to Login"
            onPress={() => router.replace("/(auth)/login")}
            variant="ghost"
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    fontSize: FontSizes["2xl"],
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: FontSizes.base * 1.5,
    marginBottom: Spacing["2xl"],
  },
  tips: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    width: "100%",
    marginBottom: Spacing["2xl"],
  },
  tipTitle: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  actions: {
    width: "100%",
    gap: Spacing.md,
  },
  button: {
    width: "100%",
  },
});
