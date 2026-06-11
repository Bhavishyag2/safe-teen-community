import React from "react";
import { View, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import { Colors, BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({
  children,
  style,
  onPress,
  variant = "default",
}: CardProps) {
  const cardStyles = [
    styles.card,
    variant === "elevated" && styles.card_elevated,
    variant === "outlined" && styles.card_outlined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  card_elevated: {
    ...Shadows.md,
  },
  card_outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
