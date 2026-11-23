import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // The real package throws outside React Server Components; tests import server code directly.
      "server-only": path.resolve(import.meta.dirname, "./__tests__/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: "./vitest.setup.ts",
    include: ["__tests__/**/*.test.{ts,tsx}"],
    // Server tests stub fetch, so nothing here ever reaches a real API.
    env: { API_URL: "http://api.test" },
  },
});
