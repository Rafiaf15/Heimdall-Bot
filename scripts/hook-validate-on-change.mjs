import { spawnSync } from "node:child_process";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data);
    });
  });
}

function shouldValidate(payload) {
  const blob = JSON.stringify(payload || {}).toLowerCase();
  const touchedBotFile =
    blob.includes("src/") ||
    blob.includes("src\\") ||
    blob.includes("data/negative-words.json") ||
    blob.includes("data\\negative-words.json") ||
    blob.includes("test/") ||
    blob.includes("test\\") ||
    blob.includes(".env");

  if (!touchedBotFile) {
    return false;
  }

  const writeLikeTool =
    blob.includes("apply_patch") ||
    blob.includes("create_file") ||
    blob.includes("edit") ||
    blob.includes("write");

  return writeLikeTool;
}

const input = await readStdin();
let payload = {};

try {
  payload = input ? JSON.parse(input) : {};
} catch {
  payload = {};
}

if (!shouldValidate(payload)) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

const result = spawnSync("npm", ["run", "validate:bot"], {
  cwd: process.cwd(),
  shell: true,
  stdio: "pipe",
  encoding: "utf8"
});

if (result.status === 0) {
  console.log(
    JSON.stringify({
      continue: true,
      systemMessage: "Auto-validation passed: config + moderation tests are green."
    })
  );
  process.exit(0);
}

const stderr = (result.stderr || "").slice(0, 8000);
const stdout = (result.stdout || "").slice(0, 8000);

console.log(
  JSON.stringify({
    decision: "block",
    reason: "Moderation validation failed",
    systemMessage: `Validation failed.\n${stdout}\n${stderr}`
  })
);
process.exit(2);
