export const INTERESTS = [
  "Art",
  "Books",
  "Coding",
  "Cooking",
  "Fashion",
  "Fitness",
  "Gaming",
  "Gardening",
  "Hiking",
  "Movies",
  "Music",
  "Photography",
  "Science",
  "Sports",
  "Travel",
  "Volunteering",
] as const;

export const MAX_INTERESTS = 5;

export const AGE_RANGES = [
  { value: "18-24", label: "18–24", min: 18, max: 24 },
  { value: "25-34", label: "25–34", min: 25, max: 34 },
  { value: "35-44", label: "35–44", min: 35, max: 44 },
  { value: "45-54", label: "45–54", min: 45, max: 54 },
  { value: "55+", label: "55+", min: 55, max: Infinity },
] as const;
