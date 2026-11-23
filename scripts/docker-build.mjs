// Builds the Docker image with the GitHub Packages token as a BuildKit secret, so it never lands
// in an image layer. The token comes from NODE_AUTH_TOKEN if set, otherwise from the gitignored
// .npmrc that plain `npm install` uses.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function tokenFromNpmrc() {
  try {
    const match = readFileSync(".npmrc", "utf8").match(
      /^\/\/npm\.pkg\.github\.com\/:_authToken=(.+)$/m,
    );
    return match?.[1].trim();
  } catch {
    return undefined;
  }
}

const token = process.env.NODE_AUTH_TOKEN || tokenFromNpmrc();
if (!token || token.startsWith("ghp_your_token")) {
  console.error(
    "No GitHub Packages token found. Copy .npmrc.example to .npmrc and paste a GitHub token " +
      "with the read:packages scope.",
  );
  process.exit(1);
}

const result = spawnSync(
  "docker",
  ["build", "--secret", "id=NODE_AUTH_TOKEN,env=NODE_AUTH_TOKEN", "-t", "user-directory", "."],
  { stdio: "inherit", env: { ...process.env, NODE_AUTH_TOKEN: token } },
);
process.exit(result.status ?? 1);
