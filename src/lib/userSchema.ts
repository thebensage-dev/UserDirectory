import { z } from "zod";
import type { UserOptions } from "@/lib/userOptions";

export const LIMITS = {
  name: 80,
  email: 254,
  jobTitle: 80,
  city: 80,
  bio: 300,
};

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}'’ .-]*$/u;
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

const fixedRules = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name is required (at least 2 characters)")
    .max(LIMITS.name, `Name must be ${LIMITS.name} characters or fewer`)
    .regex(NAME_PATTERN, "Use letters, spaces, hyphens or apostrophes only"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .max(LIMITS.email, "Email is too long")
    .email("Enter a valid email address, like name@example.com"),

  phone: z
    .string()
    .trim()
    .refine(
      (v) => {
        if (v === "") return true;
        const digits = v.replace(/\D/g, "").length;
        return PHONE_PATTERN.test(v) && digits >= 7 && digits <= 15;
      },
      { message: "Enter a valid phone number, like +44 7700 900123" },
    ),

  age: z
    .number({
      error: (issue) => (issue.input === undefined ? "Age is required" : "Enter a valid age"),
    })
    .int("Age must be a whole number")
    .min(18, "Must be 18 or over")
    .max(120, "Must be 120 or under"),

  city: optionalText(LIMITS.city, "City"),
  jobTitle: optionalText(LIMITS.jobTitle, "Job title"),
  bio: optionalText(LIMITS.bio, "Bio"),
});

// z.enum needs at least one value; the API always sends some.
const oneOf = (values: string[]) => values as [string, ...string[]];

/** All the rules, with the countries and interests the API allows (`GET /users/options`). */
export const userSchema = ({
  countries,
  interests,
  maxInterests,
}: Pick<UserOptions, "countries" | "interests" | "maxInterests">) =>
  fixedRules.extend({
    country: z.enum(oneOf(countries.map((c) => c.code)), { error: "Choose a country" }),
    interests: z
      .array(z.enum(oneOf(interests), { error: "Unknown interest" }), {
        error: "Pick at least one interest",
      })
      .min(1, "Pick at least one interest")
      .max(maxInterests, `Pick up to ${maxInterests} interests`),
  });

export type UserInput = z.infer<ReturnType<typeof userSchema>>;
