import "server-only";
import { cache } from "react";
import { createApiClient, type Person } from "@thebensage-dev/api-client";
import type { ListQuery } from "@/lib/listQuery";
import type { UserInput } from "@/lib/userSchema";
import type { DirectorySummary, User, UserPage } from "@/types";

// Every read and write goes to the People API (the Api repo: ASP.NET Core + PostgreSQL), which
// owns the data. Search, filters, sort and paging run there, in SQL. The typed client comes from
// @thebensage-dev/api-client, generated from the API's OpenAPI document. Reads are public; writes
// send the signed-in person's authentik access token (the client adds it only to those calls).

/** The API's base URL: API_URL, or the API's own `dotnet run` port for `npm run dev`. */
const apiUrl = () => process.env.API_URL || "http://localhost:3002";

const api = (token?: string) =>
  createApiClient({
    baseUrl: apiUrl(),
    // no-store: every page shows the current data; Server Actions revalidate the pages after writes.
    cache: "no-store",
    // Looked up on each call, so Next's fetch (and the tests' stub) is the one used.
    fetch: (request) => fetch(request),
    getToken: token ? () => token : undefined,
  });

/** The API answered with an error this app doesn't handle itself (5xx, an unexpected 4xx). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
/** 400: the API's field errors, with userSchema's own field names and messages. */
export class ValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string[]>) {
    super("Validation failed");
  }
}
/** 409: the email belongs to someone else. */
export class DuplicateEmailError extends Error {}
/** 401: the token is missing, expired or not accepted. */
export class UnauthorizedError extends Error {}
/** 403: signed in, but not in a group that may edit. */
export class ForbiddenError extends Error {}

type Problem = { title?: string | null; errors?: Record<string, string[]> };

/** The answer's data, null for a 404, or the matching error. */
function unwrap<T>(
  { data, error, response }: { data?: T; error?: unknown; response: Response },
  what: string,
): T | null {
  if (response.ok) return data as T;
  if (response.status === 404) return null;

  const problem: Problem = typeof error === "object" && error !== null ? error : {};
  if (response.status === 400) throw new ValidationError(problem.errors ?? {});
  if (response.status === 409) throw new DuplicateEmailError(problem.title ?? undefined);
  if (response.status === 401) throw new UnauthorizedError(problem.title ?? undefined);
  if (response.status === 403) throw new ForbiddenError(problem.title ?? undefined);
  throw new ApiError(
    response.status,
    `${what}: ${response.status} ${problem.title ?? response.statusText}`,
  );
}

/** Like unwrap, for answers that are never a 404. */
function required<T>(result: { data?: T; error?: unknown; response: Response }, what: string): T {
  const data = unwrap(result, what);
  if (data === null) throw new ApiError(404, `${what}: 404`);
  return data;
}

// The API sends offsets (+00:00); the app uses the ISO "Z" form everywhere.
const toUser = (p: Person): User => ({
  ...p,
  createdAt: new Date(p.createdAt).toISOString(),
  updatedAt: new Date(p.updatedAt).toISOString(),
});

// PostgreSQL integer ids: anything outside this range can't exist, so don't ask.
const MAX_ID = 2_147_483_647;
const isId = (id: number) => Number.isInteger(id) && id > 0 && id <= MAX_ID;

// cache() lets a page and its generateMetadata share one request.
export const getUser = cache(async (id: number): Promise<User | null> => {
  if (!isId(id)) return null;
  const person = unwrap(
    await api().GET("/people/{id}", { params: { path: { id } } }),
    `GET /people/${id}`,
  );
  return person && toUser(person);
});

export async function queryUsers(query: ListQuery): Promise<UserPage> {
  const page = required(
    await api().GET("/people", {
      params: {
        query: {
          q: query.q || undefined,
          country: query.country || undefined,
          age: query.age || undefined,
          interests: query.interests.length > 0 ? query.interests : undefined,
          sort: query.sort || undefined,
          page: query.page,
          size: query.size,
        },
      },
    }),
    "GET /people",
  );
  return { ...page, items: page.items.map(toUser) };
}

export async function getDirectorySummary(): Promise<DirectorySummary> {
  const s = required(await api().GET("/people/summary"), "GET /people/summary");
  return {
    people: s.people,
    averageAge: Math.round(s.averageAge),
    countries: s.countries.map(({ code, people }) => [code, people]),
    interests: s.interests.map(({ name, people }) => [name, people]),
  };
}

export async function createUser(input: UserInput, token: string): Promise<User> {
  return toUser(required(await api(token).POST("/people", { body: input }), "POST /people"));
}

/** null when the person no longer exists. */
export async function updateUser(
  id: number,
  input: UserInput,
  token: string,
): Promise<User | null> {
  if (!isId(id)) return null;
  const person = unwrap(
    await api(token).PUT("/people/{id}", { params: { path: { id } }, body: input }),
    `PUT /people/${id}`,
  );
  return person && toUser(person);
}

/** false when the person no longer exists. */
export async function deleteUser(id: number, token: string): Promise<boolean> {
  if (!isId(id)) return false;
  const result = await api(token).DELETE("/people/{id}", { params: { path: { id } } });
  return unwrap(result, `DELETE /people/${id}`) !== null;
}
