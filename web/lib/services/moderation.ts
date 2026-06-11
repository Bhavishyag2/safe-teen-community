// Content moderation service using Perspective API

interface PerspectiveResponse {
  attributeScores: Record<
    string,
    {
      summaryScore: { value: number };
    }
  >;
}

interface ModerationResult {
  score: number;
  flags: string[];
  categories: Record<string, number>;
  shouldBlock: boolean;
  shouldReview: boolean;
}

const PERSPECTIVE_ATTRIBUTES = [
  "TOXICITY",
  "SEVERE_TOXICITY",
  "IDENTITY_ATTACK",
  "INSULT",
  "PROFANITY",
  "THREAT",
  "SEXUALLY_EXPLICIT",
];

const THRESHOLDS = {
  block: 0.9, // Auto-block if any score is above this
  review: 0.6, // Send to human review if above this
  safe: 0.3, // Consider safe if all below this
};

export async function moderateContent(text: string): Promise<ModerationResult> {
  const apiKey = process.env.PERSPECTIVE_API_KEY;

  if (!apiKey) {
    console.warn("Perspective API key not configured, skipping moderation");
    return {
      score: 0,
      flags: [],
      categories: {},
      shouldBlock: false,
      shouldReview: true, // Default to review when API not available
    };
  }

  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: { text },
          languages: ["en"],
          requestedAttributes: PERSPECTIVE_ATTRIBUTES.reduce(
            (acc, attr) => ({ ...acc, [attr]: {} }),
            {}
          ),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Perspective API error: ${response.status}`);
    }

    const data: PerspectiveResponse = await response.json();

    const categories: Record<string, number> = {};
    const flags: string[] = [];
    let maxScore = 0;

    for (const [attr, value] of Object.entries(data.attributeScores)) {
      const score = value.summaryScore.value;
      categories[attr.toLowerCase()] = score;

      if (score > maxScore) {
        maxScore = score;
      }

      if (score >= THRESHOLDS.review) {
        flags.push(attr.toLowerCase());
      }
    }

    return {
      score: maxScore,
      flags,
      categories,
      shouldBlock: maxScore >= THRESHOLDS.block,
      shouldReview: maxScore >= THRESHOLDS.review,
    };
  } catch (error) {
    console.error("Moderation error:", error);
    // On error, default to review
    return {
      score: 0,
      flags: ["error"],
      categories: {},
      shouldBlock: false,
      shouldReview: true,
    };
  }
}

// Simple keyword-based moderation for backup/additional checks
const BLOCKED_PATTERNS = [
  // Personal information patterns
  /\b\d{12}\b/, // Aadhaar-like numbers
  /\b\d{10}\b/, // Phone numbers
  /\b[A-Z]{5}\d{4}[A-Z]\b/, // PAN card pattern

  // Explicit content keywords (intentionally not listing explicit terms)
];

const REVIEW_KEYWORDS = [
  "meet up",
  "call me",
  "whatsapp",
  "instagram",
  "snapchat",
  "phone number",
  "address",
  "school name",
  "which school",
  "where do you live",
];

export function keywordModeration(text: string): {
  hasBlockedContent: boolean;
  requiresReview: boolean;
  flags: string[];
} {
  const lowerText = text.toLowerCase();
  const flags: string[] = [];

  // Check blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("personal_info_pattern");
    }
  }

  // Check review keywords
  for (const keyword of REVIEW_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      flags.push("potential_personal_info_request");
      break;
    }
  }

  return {
    hasBlockedContent: flags.includes("personal_info_pattern"),
    requiresReview: flags.length > 0,
    flags,
  };
}

// Combined moderation
export async function fullModeration(text: string): Promise<ModerationResult> {
  const [perspectiveResult, keywordResult] = await Promise.all([
    moderateContent(text),
    Promise.resolve(keywordModeration(text)),
  ]);

  const combinedFlags = Array.from(new Set([...perspectiveResult.flags, ...keywordResult.flags]));

  return {
    score: perspectiveResult.score,
    flags: combinedFlags,
    categories: perspectiveResult.categories,
    shouldBlock: perspectiveResult.shouldBlock || keywordResult.hasBlockedContent,
    shouldReview:
      perspectiveResult.shouldReview ||
      keywordResult.requiresReview ||
      combinedFlags.length > 0,
  };
}
