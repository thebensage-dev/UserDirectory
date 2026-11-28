// @vitest-environment node
import { describe, expect, it } from "vitest";
import { findPage, resolveLink, type Content } from "@/server/cms";

const content = {
  site: "user-directory",
  pages: [{ id: 1, path: "/", title: "User Directory" }],
  projects: [],
  settings: {},
  fetchedAt: "test",
} as unknown as Content;

describe("CMS links", () => {
  it("keeps URLs and paths as they are", () => {
    expect(resolveLink(content, { type: "url", url: "/users" })).toEqual({
      href: "/users",
      external: false,
      internal: true,
    });
    expect(resolveLink(content, { type: "url", url: "#how" })?.internal).toBe(false);
  });

  it("opens new-tab links as external", () => {
    const link = resolveLink(content, { type: "url", url: "https://github.com/x", newTab: true });
    expect(link).toEqual({ href: "https://github.com/x", external: true, internal: false });
  });

  it("puts main-site links under MAIN_SITE_URL, and leaves them out without it", () => {
    const privacy = { type: "mainSite", url: "/privacy#cookies" };
    expect(resolveLink(content, privacy, "https://example.com")?.href).toBe(
      "https://example.com/privacy#cookies",
    );
    expect(resolveLink(content, privacy, undefined)).toBeNull();
  });

  it("finds pages by id, with an anchor", () => {
    expect(resolveLink(content, { type: "page", page: 1, anchor: "how" })?.href).toBe("/#how");
    expect(resolveLink(content, { type: "page", page: 99 })).toBeNull();
  });

  it("leaves out link types only the main site uses", () => {
    expect(resolveLink(content, { type: "requestAccess" })).toBeNull();
    expect(resolveLink(content, null)).toBeNull();
  });

  it("matches the CMS page for a path", () => {
    expect(findPage(content, "/")?.title).toBe("User Directory");
  });
});
