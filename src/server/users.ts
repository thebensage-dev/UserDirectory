import "server-only";
import { cache } from "react";
import { createApiClient, type User as ApiUser } from "@thebensage-dev/api-client";
import type { ListQuery } from "@/lib/listQuery";
import type { UserOptions } from "@/lib/userOptions";
import type { UserInput } from "@/lib/userSchema";
import type { DirectorySummary, User, UserPage } from "@/types";

// Every read and write goes to the API (the Api repo: ASP.NET Core + PostgreSQL), which
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
const toUser = (p: ApiUser): User => ({
  ...p,
  createdAt: new Date(p.createdAt).toISOString(),
  updatedAt: new Date(p.updatedAt).toISOString(),
});

// PostgreSQL integer ids: anything outside this range can't exist, so don't ask. Takes unknown:
// Server Actions are public endpoints, so their arguments can be anything at runtime.
const MAX_ID = 2_147_483_647;
export const isId = (id: unknown): id is number =>
  Number.isInteger(id) && (id as number) > 0 && (id as number) <= MAX_ID;

// cache() lets a page and its generateMetadata share one request.
export const getUser = cache(async (id: number): Promise<User | null> => {
  if (!isId(id)) return null;
  const user = unwrap(
    await api().GET("/users/{id}", { params: { path: { id } } }),
    `GET /users/${id}`,
  );
  return user && toUser(user);
});

/** The allowed countries, interests, age ranges and sorts. cache(): one request per page. */
export const getUserOptions = cache(async (): Promise<UserOptions> =>
  required(await api().GET("/users/options"), "GET /users/options"),
);

export async function queryUsers(query: ListQuery): Promise<UserPage> {
  const page = required(
    await api().GET("/users", {
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
    "GET /users",
  );
  return { ...page, items: page.items.map(toUser) };
}

export async function getDirectorySummary(): Promise<DirectorySummary> {
  const s = required(await api().GET("/users/summary"), "GET /users/summary");
  return {
    users: s.users,
    averageAge: Math.round(s.averageAge),
    countries: s.countries.map(({ code, users }) => [code, users]),
    interests: s.interests.map(({ name, users }) => [name, users]),
  };
}

export async function createUser(input: UserInput, token: string): Promise<User> {
  return toUser(required(await api(token).POST("/users", { body: input }), "POST /users"));
}

/** null when the user no longer exists. */
export async function updateUser(
  id: number,
  input: UserInput,
  token: string,
): Promise<User | null> {
  if (!isId(id)) return null;
  const user = unwrap(
    await api(token).PUT("/users/{id}", { params: { path: { id } }, body: input }),
    `PUT /users/${id}`,
  );
  return user && toUser(user);
}

/** false when the user no longer exists. */
export async function deleteUser(id: number, token: string): Promise<boolean> {
  if (!isId(id)) return false;
  const result = await api(token).DELETE("/users/{id}", { params: { path: { id } } });
  return unwrap(result, `DELETE /users/${id}`) !== null;
}
