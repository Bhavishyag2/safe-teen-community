// Crisis helplines and support resources for India

export interface Helpline {
  name: string;
  description: string;
  phone: string;
  hours: string;
  languages: string[];
  website?: string;
  whatsapp?: string;
  email?: string;
  category: HelplineCategory;
}

export type HelplineCategory =
  | "mental_health"
  | "abuse"
  | "emergency"
  | "women_safety"
  | "lgbtq"
  | "education";

export const HELPLINES: Helpline[] = [
  // Mental Health
  {
    name: "iCall",
    description:
      "Psychosocial helpline offering counseling for emotional distress, anxiety, depression, and other mental health concerns",
    phone: "9152987821",
    hours: "Mon-Sat, 8 AM - 10 PM",
    languages: ["English", "Hindi", "Marathi"],
    website: "https://icallhelpline.org",
    email: "icall@tiss.edu",
    category: "mental_health",
  },
  {
    name: "Vandrevala Foundation",
    description:
      "24/7 mental health support for depression, anxiety, and emotional distress",
    phone: "1860-2662-345",
    hours: "24/7",
    languages: ["English", "Hindi"],
    website: "https://www.vandrevalafoundation.com",
    category: "mental_health",
  },
  {
    name: "NIMHANS",
    description:
      "National Institute of Mental Health - professional psychiatric support",
    phone: "080-46110007",
    hours: "24/7",
    languages: ["English", "Hindi", "Kannada"],
    website: "https://nimhans.ac.in",
    category: "mental_health",
  },
  {
    name: "Snehi",
    description: "Emotional support for those in distress or feeling suicidal",
    phone: "044-24640050",
    hours: "24/7",
    languages: ["English", "Tamil", "Hindi"],
    category: "mental_health",
  },

  // Abuse & Safety
  {
    name: "Childline India",
    description:
      "For children in need of care and protection - abuse, neglect, trafficking",
    phone: "1098",
    hours: "24/7",
    languages: ["All major Indian languages"],
    website: "https://www.childlineindia.org",
    category: "abuse",
  },
  {
    name: "Women Helpline",
    description: "National Commission for Women - for violence against women",
    phone: "181",
    hours: "24/7",
    languages: ["All major Indian languages"],
    category: "women_safety",
  },
  {
    name: "National Commission for Protection of Child Rights",
    description: "Report child rights violations",
    phone: "1800-121-2830",
    hours: "24/7",
    languages: ["English", "Hindi"],
    website: "https://ncpcr.gov.in",
    category: "abuse",
  },

  // Emergency
  {
    name: "Police Emergency",
    description: "For immediate emergency situations",
    phone: "100",
    hours: "24/7",
    languages: ["All languages"],
    category: "emergency",
  },
  {
    name: "Women Emergency",
    description: "Emergency response for women in danger",
    phone: "1091",
    hours: "24/7",
    languages: ["All languages"],
    category: "emergency",
  },

  // LGBTQ+
  {
    name: "iCall LGBTQ+ Support",
    description: "Support for LGBTQ+ individuals facing discrimination or distress",
    phone: "9152987821",
    hours: "Mon-Sat, 8 AM - 10 PM",
    languages: ["English", "Hindi"],
    category: "lgbtq",
  },

  // Education
  {
    name: "CBSE Counseling",
    description: "Exam stress and academic pressure support for students",
    phone: "1800-11-0234",
    hours: "During exam season, 8 AM - 10 PM",
    languages: ["English", "Hindi"],
    category: "education",
  },
];

export const HELPLINE_CATEGORIES: Record<
  HelplineCategory,
  { name: string; icon: string }
> = {
  mental_health: {
    name: "Mental Health",
    icon: "brain",
  },
  abuse: {
    name: "Abuse & Safety",
    icon: "shield",
  },
  emergency: {
    name: "Emergency",
    icon: "alert-triangle",
  },
  women_safety: {
    name: "Women Safety",
    icon: "heart",
  },
  lgbtq: {
    name: "LGBTQ+ Support",
    icon: "rainbow",
  },
  education: {
    name: "Education",
    icon: "book",
  },
};

export function getHelplinesByCategory(category: HelplineCategory): Helpline[] {
  return HELPLINES.filter((h) => h.category === category);
}

export function getPrimaryHelpline(): Helpline {
  // Return the most general mental health helpline
  return HELPLINES.find((h) => h.name === "Vandrevala Foundation")!;
}

export function getEmergencyHelplines(): Helpline[] {
  return HELPLINES.filter(
    (h) => h.category === "emergency" || h.hours === "24/7"
  );
}

// Crisis detection keywords mapped to appropriate helplines
export const CRISIS_KEYWORD_HELPLINES: Record<string, string[]> = {
  suicide: ["Vandrevala Foundation", "iCall", "NIMHANS"],
  "self harm": ["Vandrevala Foundation", "iCall", "NIMHANS"],
  abuse: ["Childline India", "Women Helpline", "Police Emergency"],
  molest: ["Childline India", "Police Emergency", "Women Helpline"],
  rape: ["Police Emergency", "Women Helpline", "Childline India"],
  violence: ["Police Emergency", "Women Helpline", "Childline India"],
  depression: ["Vandrevala Foundation", "iCall", "NIMHANS"],
  anxiety: ["iCall", "Vandrevala Foundation"],
  bullying: ["Childline India", "iCall"],
  "exam stress": ["CBSE Counseling", "iCall"],
};
