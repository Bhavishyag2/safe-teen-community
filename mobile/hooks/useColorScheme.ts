import { useColorScheme as useRNColorScheme } from "react-native";
import { Colors, DarkColors, type ColorScheme } from "@/constants/theme";

export function useColorScheme(): ColorScheme {
  const scheme = useRNColorScheme();
  return scheme === "dark" ? "dark" : "light";
}

export function useColors() {
  const scheme = useColorScheme();
  return scheme === "dark" ? DarkColors : Colors;
}
