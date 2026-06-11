import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from "@/constants/theme";

export default function ProfileScreen() {
  const { profile, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "person-outline" as const,
      title: "Edit Profile",
      subtitle: "Update your pseudo-name and avatar",
      onPress: () => {},
    },
    {
      icon: "bookmark-outline" as const,
      title: "Saved Posts",
      subtitle: "View your bookmarked content",
      onPress: () => {},
    },
    {
      icon: "create-outline" as const,
      title: "My Posts",
      subtitle: "Manage your posts and questions",
      onPress: () => {},
    },
    {
      icon: "notifications-outline" as const,
      title: "Notifications",
      subtitle: "Manage notification preferences",
      onPress: () => {},
    },
    {
      icon: "shield-checkmark-outline" as const,
      title: "Privacy & Safety",
      subtitle: "Control who can message you",
      onPress: () => {},
    },
    {
      icon: "help-circle-outline" as const,
      title: "Help & Support",
      subtitle: "Get help or report an issue",
      onPress: () => {},
    },
    {
      icon: "information-circle-outline" as const,
      title: "About",
      subtitle: "App version and legal info",
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.header}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color={Colors.textLight} />
          </View>
        )}

        <Text style={styles.pseudoName}>{profile?.pseudo_name || "Anonymous"}</Text>

        <View style={styles.badges}>
          {profile?.email_verified && (
            <View style={styles.badge}>
              <Ionicons name="mail" size={12} color={Colors.success} />
              <Text style={styles.badgeText}>Email Verified</Text>
            </View>
          )}
          {profile?.id_verified && (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
              <Text style={styles.badgeText}>ID Verified</Text>
            </View>
          )}
        </View>

        <Text style={styles.memberSince}>
          Member since{" "}
          {new Date(profile?.created_at || Date.now()).toLocaleDateString(
            "en-IN",
            { month: "long", year: "numeric" }
          )}
        </Text>
      </View>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>
      </Card>

      {/* Verification prompt */}
      {!profile?.id_verified && (
        <Card
          style={styles.verifyCard}
          onPress={() => {
            // TODO: Navigate to verification
          }}
        >
          <View style={styles.verifyContent}>
            <View style={styles.verifyIcon}>
              <Ionicons name="shield" size={24} color={Colors.primary} />
            </View>
            <View style={styles.verifyText}>
              <Text style={styles.verifyTitle}>Verify Your Identity</Text>
              <Text style={styles.verifySubtitle}>
                Get a verified badge and unlock more features
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </View>
        </Card>
      )}

      {/* Menu items */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={22} color={Colors.text} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout button */}
      <Button
        title="Log Out"
        onPress={handleLogout}
        variant="outline"
        loading={isLoading}
        style={styles.logoutButton}
      />

      {/* Version */}
      <Text style={styles.version}>Teen Portal v1.0.0</Text>
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
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  pseudoName: {
    fontSize: FontSizes["2xl"],
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.success + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: "500",
  },
  memberSince: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  verifyCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primaryLight + "20",
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  verifyContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifyIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  verifyText: {
    flex: 1,
  },
  verifyTitle: {
    fontSize: FontSizes.base,
    fontWeight: "600",
    color: Colors.text,
  },
  verifySubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  menu: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 40,
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSizes.base,
    fontWeight: "500",
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  logoutButton: {
    marginBottom: Spacing.lg,
  },
  version: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: "center",
  },
});
