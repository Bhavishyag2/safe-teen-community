// Content section definitions

import { ContentSection } from "../types/database";

export interface SectionConfig {
  id: ContentSection;
  name: string;
  description: string;
  icon: string; // Icon name for UI
  color: string; // Theme color
  subcategories: string[];
}

export const SECTIONS: Record<ContentSection, SectionConfig> = {
  relationships: {
    id: "relationships",
    name: "Relationships",
    description: "Dating advice, friendships, family dynamics, peer pressure",
    icon: "heart",
    color: "#FF6B9D",
    subcategories: [
      "Dating & Crushes",
      "Friendships",
      "Family",
      "Peer Pressure",
      "Breakups",
      "Boundaries",
    ],
  },
  fashion: {
    id: "fashion",
    name: "Fashion",
    description: "Style tips, trends, budget shopping, outfit ideas",
    icon: "shirt",
    color: "#9B59B6",
    subcategories: [
      "Style Tips",
      "Trends",
      "Budget Shopping",
      "Outfit Ideas",
      "DIY Fashion",
      "Accessories",
    ],
  },
  health: {
    id: "health",
    name: "Health",
    description: "Physical wellness, mental health, nutrition, fitness",
    icon: "activity",
    color: "#2ECC71",
    subcategories: [
      "Mental Health",
      "Physical Wellness",
      "Nutrition",
      "Fitness",
      "Sleep",
      "Hobbies & Sports",
    ],
  },
  school: {
    id: "school",
    name: "School",
    description: "Study tips, exam prep, homework help, teacher/peer issues",
    icon: "book-open",
    color: "#3498DB",
    subcategories: [
      "Study Tips",
      "Exam Prep",
      "Homework Help",
      "Teacher Issues",
      "School Drama",
      "Extracurriculars",
    ],
  },
  career: {
    id: "career",
    name: "Career & Future Goals",
    description: "College prep, skill development, internships, career exploration",
    icon: "briefcase",
    color: "#F39C12",
    subcategories: [
      "College Prep",
      "Career Exploration",
      "Skill Development",
      "Internships",
      "Money Basics",
      "Creative Corner",
    ],
  },
  period_health: {
    id: "period_health",
    name: "Period & Puberty Health",
    description: "Menstrual health, body changes, puberty guidance",
    icon: "droplet",
    color: "#E74C3C",
    subcategories: [
      "First Period",
      "Period Problems",
      "Body Changes",
      "Puberty Q&A",
      "Products & Tips",
      "Myths & Facts",
    ],
  },
  beauty_selfcare: {
    id: "beauty_selfcare",
    name: "Beauty & Self-care",
    description: "Skincare, makeup basics, self-confidence, body positivity",
    icon: "sparkles",
    color: "#E91E8C",
    subcategories: [
      "Skincare",
      "Makeup Basics",
      "Hair Care",
      "Self-Confidence",
      "Body Positivity",
      "Self-Care Routines",
    ],
  },
};

export const SECTION_ORDER: ContentSection[] = [
  "relationships",
  "health",
  "school",
  "period_health",
  "beauty_selfcare",
  "fashion",
  "career",
];

export function getSectionById(id: string): SectionConfig | undefined {
  return SECTIONS[id as ContentSection];
}

export function getSectionColor(id: ContentSection): string {
  return SECTIONS[id]?.color ?? "#666666";
}

export function getSectionName(id: ContentSection): string {
  return SECTIONS[id]?.name ?? id;
}
