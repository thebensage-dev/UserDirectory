// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LIST_QUERY, makeUser } from "./fixtures";
import type { ListQuery } from "@/lib/listQuery";
import type { UserInput } from "@/lib/userSchema";
import { accessToken, currentUser } from "@/server/auth";
import { createUserAction, deleteUserAction, updateUserAction } from "@/server/userActions";
import { ApiError, getDirectorySummary, getUser, queryUsers } from "@/server/users";

// The People API holds the data and has its own tests for search, filters and SQL. These check
// what this app does with it: the requests it sends and how it reads the answers.

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// The actions need an editor's token; tests are signed in as an editor unless they say otherwise.
const EDITOR = { sub: "u1", name: "Ed", email: "ed@example.com", canEdit: true };
vi.mock("@/server/auth", () => ({
  accessToken: vi.fn(async () => "token-123"),
  currentUser: vi.fn(async () => EDITOR),
}));

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(accessToken).mockResolvedValue("token-123");
  vi.mocked(currentUser).mockResolvedValue(EDITOR);
});
afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const problem = (status: number, body: object) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });
// The API client (@thebensage-dev/api-client) calls fetch with one Request.
const lastRequest = () => {
  const request = fetchMock.mock.lastCall![0] as Request;
  return { url: new URL(request.url), request, headers: request.headers };
};

// The API sends offsets; the app always shows the "Z" form.
const apiPerson = { ...makeUser({ id: 7 }), createdAt: "2026-10-13T10:12:39.2+00:00" };

const input = (overrides: Partial<UserInput> = {}): UserInput => ({
  fullName: "Test Person",
  email: "test@example.com",
  phone: "",
  age: 30,
  country: "GB",
  city: "",
  jobTitle: "",
  bio: "",
  interests: ["Music"],
  ...overrides,
});
const q = (patch: Partial<ListQuery> = {}): ListQuery => ({ ...DEFAULT_LIST_QUERY, ...patch });

describe("reads", () => {
  it("sends the list query as URL parameters and returns the page", async () => {
    const page = { total: 1, page: 1, pageCount: 1, from: 1, to: 1, terms: ["ada"] };
    fetchMock.mockResolvedValue(json(200, { ...page, items: [apiPerson] }));

    const result = await queryUsers(
      q({ q: "Ada", country: "GB", age: "25-34", interests: ["Art", "Books"], sort: "age-desc" }),
    );

    const { url, request, headers } = lastRequest();
    expect(url.origin + url.pathname).toBe("http://api.test/people");
    expect(url.searchParams.getAll("interests")).toEqual(["Art", "Books"]);
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      q: "Ada",
      country: "GB",
      age: "25-34",
      sort: "age-desc",
      page: "1",
      size: "12",
    });
    expect(request.cache).toBe("no-store");
    expect(headers.has("Authorization")).toBe(false);
    expect(result).toEqual({
      ...page,
      items: [{ ...apiPerson, createdAt: "2026-10-13T10:12:39.200Z" }],
    });
  });

  it("leaves out empty filters", async () => {
    fetchMock.mockResolvedValue(json(200, { items: [], total: 0, page: 1, pageCount: 1 }));
    await queryUsers(q());
    expect([...lastRequest().url.searchParams.keys()]).toEqual(["page", "size"]);
  });

  it("turns the summary's objects into [key, count] pairs", async () => {
    fetchMock.mockResolvedValue(
      json(200, {
        people: 3,
        averageAge: 30.6,
        countries: [{ code: "GB", name: "United Kingdom", people: 2 }],
        interests: [{ name: "Coding", people: 2 }],
      }),
    );
    expect(await getDirectorySummary()).toEqual({
      people: 3,
      averageAge: 31,
      countries: [["GB", 2]],
      interests: [["Coding", 2]],
    });
  });

  it("returns null for an unknown id, and doesn't ask for an impossible one", async () => {
    fetchMock.mockResolvedValue(problem(404, { title: "That person doesn't exist." }));
    expect(await getUser(999_999)).toBeNull();
    expect(lastRequest().url.pathname).toBe("/people/999999");

    fetchMock.mockClear();
    for (const id of [Number.NaN, 0, -1, 1.5, 3_000_000_000]) expect(await getUser(id)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws on a server error instead of showing an empty directory", async () => {
    fetchMock.mockResolvedValue(problem(500, { title: "Boom" }));
    await expect(getDirectorySummary()).rejects.toBeInstanceOf(ApiError);
  });
});

describe("Server Actions", () => {
  it("creates, updates and deletes with the signed-in person's token", async () => {
    fetchMock.mockResolvedValueOnce(json(201, apiPerson));
    const created = await createUserAction(input());
    expect(created).toMatchObject({ ok: true, data: { id: 7 } });
    let request = lastRequest();
    expect(request.request.method).toBe("POST");
    expect(request.headers.get("Authorization")).toBe("Bearer token-123");
    expect(await request.request.clone().json()).toMatchObject({ email: "test@example.com" });

    fetchMock.mockResolvedValueOnce(json(200, { ...apiPerson, fullName: "Ada King" }));
    expect(await updateUserAction(7, input({ fullName: "Ada King" }))).toMatchObject({
      ok: true,
      data: { fullName: "Ada King" },
    });
    request = lastRequest();
    expect([request.request.method, request.url.pathname]).toEqual(["PUT", "/people/7"]);

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect(await deleteUserAction(7)).toEqual({ ok: true, data: null });
    request = lastRequest();
    expect([request.request.method, request.url.pathname]).toEqual(["DELETE", "/people/7"]);
  });

  it("validates first, so invalid input never reaches the API", async () => {
    const invalid = await createUserAction(input({ email: "not-an-email", age: 12 }));
    expect(invalid).toMatchObject({ ok: false });
    if (!invalid.ok) expect(Object.keys(invalid.fieldErrors ?? {})).toEqual(["email", "age"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the API's field errors and duplicate emails beside the fields", async () => {
    fetchMock.mockResolvedValueOnce(
      problem(400, { title: "Please fix the highlighted fields.", errors: { city: ["Too long"] } }),
    );
    expect(await createUserAction(input())).toEqual({
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { city: ["Too long"] },
    });

    fetchMock.mockResolvedValueOnce(
      problem(409, { title: "That email is already in use.", errors: { email: ["Taken"] } }),
    );
    expect(await createUserAction(input())).toMatchObject({
      ok: false,
      fieldErrors: { email: ["Another user already has this email"] },
    });
  });

  it("reports a missing user on update", async () => {
    fetchMock.mockResolvedValue(problem(404, { title: "That person doesn't exist." }));
    expect(await updateUserAction(999_999, input())).toEqual({
      ok: false,
      error: "That user no longer exists.",
    });
  });

  const refused = { ok: false, error: "Please sign in to make changes.", signInRequired: true };

  it("refuses every change when nobody is signed in, without calling the API", async () => {
    vi.mocked(currentUser).mockResolvedValue(null);
    expect(await createUserAction(input())).toEqual(refused);
    expect(await updateUserAction(7, input())).toEqual(refused);
    expect(await deleteUserAction(7)).toEqual(refused);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses people signed in without edit access, without calling the API", async () => {
    vi.mocked(currentUser).mockResolvedValue({ ...EDITOR, canEdit: false });
    const noAccess = {
      ok: false,
      error: "Your account can't make changes yet.",
      signInRequired: true,
    };
    expect(await createUserAction(input())).toEqual(noAccess);
    expect(await updateUserAction(7, input())).toEqual(noAccess);
    expect(await deleteUserAction(7)).toEqual(noAccess);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("explains a 403 from the API (not an editor there)", async () => {
    fetchMock.mockResolvedValue(problem(403, {}));
    expect(await deleteUserAction(7)).toMatchObject({ ok: false, signInRequired: true });
  });

  it("asks to sign in again when the API rejects the token", async () => {
    vi.mocked(accessToken).mockResolvedValue("expired");
    fetchMock.mockResolvedValue(problem(401, {}));
    expect(await deleteUserAction(7)).toEqual(refused);
  });

  it("still validates a signed-out visitor's input before refusing it", async () => {
    vi.mocked(currentUser).mockResolvedValue(null);
    const result = await createUserAction(input({ email: "not-an-email" }));
    expect(result).toMatchObject({ ok: false, fieldErrors: { email: expect.any(Array) } });
    expect(result).not.toHaveProperty("signInRequired");
  });
});
