// Theme configuration for Teen Portal

export const Colors = {
  primary: "#FF6B9D",
  primaryDark: "#E85A8A",
  primaryLight: "#FFB3CC",

  secondary: "#9B59B6",
  secondaryDark: "#7D3C98",
  secondaryLight: "#C39BD3",

  background: "#FFFFFF",
  backgroundSecondary: "#FFF5F8",
  backgroundDark: "#1A1A2E",

  surface: "#FFFFFF",
  surfaceSecondary: "#F8F9FA",

  text: "#333333",
  textSecondary: "#666666",
  textLight: "#999999",
  textOnPrimary: "#FFFFFF",

  border: "#E5E5E5",
  borderLight: "#F0F0F0",

  success: "#2ECC71",
  warning: "#F39C12",
  error: "#E74C3C",
  info: "#3498DB",

  // Section colors
  relationships: "#FF6B9D",
  fashion: "#9B59B6",
  health: "#2ECC71",
  school: "#3498DB",
  career: "#F39C12",
  period_health: "#E74C3C",
  beauty_selfcare: "#E91E8C",
};

export const DarkColors = {
  ...Colors,
  background: "#1A1A2E",
  backgroundSecondary: "#16213E",
  surface: "#0F3460",
  surfaceSecondary: "#1A1A2E",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textLight: "#808080",
  border: "#2D2D44",
  borderLight: "#252538",
};

export const Fonts = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
};

export const BorderRadius = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export type ColorScheme = "light" | "dark";

export function getColors(scheme: ColorScheme) {
  return scheme === "dark" ? DarkColors : Colors;
}
