import { describe, expect, it } from "vitest";
import { userSchema } from "@/lib/userSchema";

const valid = {
  fullName: "Siobhán O'Neill-Murphy",
  email: "  Siobhan@Example.COM ",
  phone: "+353 87 123 4567",
  age: 30,
  country: "IE",
  city: "",
  jobTitle: "",
  bio: "",
  interests: ["Hiking"],
};

const errorsFor = (input: unknown) => {
  const result = userSchema.safeParse(input);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const i of result.error.issues) errors[String(i.path[0])] ??= i.message;
  return errors;
};

describe("userSchema", () => {
  it("accepts a valid user and normalises the email", () => {
    const result = userSchema.parse(valid);
    expect(result.email).toBe("siobhan@example.com");
    expect(result.fullName).toBe("Siobhán O'Neill-Murphy");
  });

  it("treats blank optional fields as valid", () => {
    expect(userSchema.safeParse({ ...valid, phone: "" }).success).toBe(true);
  });

  it.each([
    ["fullName", "A", /at least 2/],
    ["fullName", "R2-D2", /letters/],
    ["email", "", /required/],
    ["email", "not-an-email", /valid email/],
    ["phone", "call me", /valid phone/],
    ["phone", "123", /valid phone/],
    ["age", 17, /18 or over/],
    ["age", 121, /120 or under/],
    ["age", 30.5, /whole number/],
    ["age", undefined, /required/],
    ["country", "UK", /Choose a country/],
    ["country", "", /Choose a country/],
    ["bio", "x".repeat(301), /300 characters/],
    ["interests", [], /at least one/],
    ["interests", ["Art", "Books", "Coding", "Cooking", "Fashion", "Fitness"], /up to 5/],
    ["interests", ["Juggling"], /Unknown interest/],
  ])("rejects %s = %j", (field, value, message) => {
    expect(errorsFor({ ...valid, [field]: value })[field]).toMatch(message);
  });
});
