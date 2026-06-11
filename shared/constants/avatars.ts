// Avatar configuration

export interface AvatarConfig {
  id: string;
  name: string;
  category: AvatarCategory;
  url: string;
  isPremium: boolean;
}

export type AvatarCategory =
  | "default"
  | "cute"
  | "cool"
  | "nature"
  | "fantasy"
  | "minimal";

export const AVATAR_CATEGORIES: Record<
  AvatarCategory,
  { name: string; description: string }
> = {
  default: {
    name: "Default",
    description: "Simple, friendly avatars",
  },
  cute: {
    name: "Cute",
    description: "Adorable kawaii-style avatars",
  },
  cool: {
    name: "Cool",
    description: "Stylish and confident avatars",
  },
  nature: {
    name: "Nature",
    description: "Animals and nature-inspired",
  },
  fantasy: {
    name: "Fantasy",
    description: "Magical and mythical creatures",
  },
  minimal: {
    name: "Minimal",
    description: "Clean and simple designs",
  },
};

// Default avatars (stored in Supabase Storage)
// These are placeholder IDs - actual URLs would be from storage
export const DEFAULT_AVATARS: AvatarConfig[] = [
  // Default category
  {
    id: "default-1",
    name: "Sunny",
    category: "default",
    url: "/avatars/default/sunny.png",
    isPremium: false,
  },
  {
    id: "default-2",
    name: "Star",
    category: "default",
    url: "/avatars/default/star.png",
    isPremium: false,
  },
  {
    id: "default-3",
    name: "Moon",
    category: "default",
    url: "/avatars/default/moon.png",
    isPremium: false,
  },
  {
    id: "default-4",
    name: "Cloud",
    category: "default",
    url: "/avatars/default/cloud.png",
    isPremium: false,
  },

  // Cute category
  {
    id: "cute-1",
    name: "Bunny",
    category: "cute",
    url: "/avatars/cute/bunny.png",
    isPremium: false,
  },
  {
    id: "cute-2",
    name: "Kitty",
    category: "cute",
    url: "/avatars/cute/kitty.png",
    isPremium: false,
  },
  {
    id: "cute-3",
    name: "Panda",
    category: "cute",
    url: "/avatars/cute/panda.png",
    isPremium: false,
  },
  {
    id: "cute-4",
    name: "Bear",
    category: "cute",
    url: "/avatars/cute/bear.png",
    isPremium: false,
  },

  // Cool category
  {
    id: "cool-1",
    name: "Rebel",
    category: "cool",
    url: "/avatars/cool/rebel.png",
    isPremium: false,
  },
  {
    id: "cool-2",
    name: "Rocker",
    category: "cool",
    url: "/avatars/cool/rocker.png",
    isPremium: false,
  },
  {
    id: "cool-3",
    name: "Chill",
    category: "cool",
    url: "/avatars/cool/chill.png",
    isPremium: false,
  },
  {
    id: "cool-4",
    name: "Boss",
    category: "cool",
    url: "/avatars/cool/boss.png",
    isPremium: false,
  },

  // Nature category
  {
    id: "nature-1",
    name: "Butterfly",
    category: "nature",
    url: "/avatars/nature/butterfly.png",
    isPremium: false,
  },
  {
    id: "nature-2",
    name: "Flower",
    category: "nature",
    url: "/avatars/nature/flower.png",
    isPremium: false,
  },
  {
    id: "nature-3",
    name: "Dolphin",
    category: "nature",
    url: "/avatars/nature/dolphin.png",
    isPremium: false,
  },
  {
    id: "nature-4",
    name: "Bird",
    category: "nature",
    url: "/avatars/nature/bird.png",
    isPremium: false,
  },

  // Fantasy category
  {
    id: "fantasy-1",
    name: "Unicorn",
    category: "fantasy",
    url: "/avatars/fantasy/unicorn.png",
    isPremium: false,
  },
  {
    id: "fantasy-2",
    name: "Phoenix",
    category: "fantasy",
    url: "/avatars/fantasy/phoenix.png",
    isPremium: false,
  },
  {
    id: "fantasy-3",
    name: "Dragon",
    category: "fantasy",
    url: "/avatars/fantasy/dragon.png",
    isPremium: false,
  },
  {
    id: "fantasy-4",
    name: "Fairy",
    category: "fantasy",
    url: "/avatars/fantasy/fairy.png",
    isPremium: false,
  },

  // Minimal category
  {
    id: "minimal-1",
    name: "Circle",
    category: "minimal",
    url: "/avatars/minimal/circle.png",
    isPremium: false,
  },
  {
    id: "minimal-2",
    name: "Heart",
    category: "minimal",
    url: "/avatars/minimal/heart.png",
    isPremium: false,
  },
  {
    id: "minimal-3",
    name: "Sparkle",
    category: "minimal",
    url: "/avatars/minimal/sparkle.png",
    isPremium: false,
  },
  {
    id: "minimal-4",
    name: "Wave",
    category: "minimal",
    url: "/avatars/minimal/wave.png",
    isPremium: false,
  },
];

export function getAvatarById(id: string): AvatarConfig | undefined {
  return DEFAULT_AVATARS.find((a) => a.id === id);
}

export function getAvatarsByCategory(category: AvatarCategory): AvatarConfig[] {
  return DEFAULT_AVATARS.filter((a) => a.category === category);
}

export function getRandomAvatar(): AvatarConfig {
  const freeAvatars = DEFAULT_AVATARS.filter((a) => !a.isPremium);
  return freeAvatars[Math.floor(Math.random() * freeAvatars.length)];
}
