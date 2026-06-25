const path = require("path");
const { execSync } = require("child_process");

try {
  console.log("[POSTINSTALL] Generating Prisma client...");
  const schemaPath = path.resolve(
    __dirname,
    "..",
    "packages",
    "database",
    "prisma",
    "schema.prisma"
  );
  execSync(`npx prisma generate --schema="${schemaPath}"`, { stdio: "inherit" });
  console.log("[POSTINSTALL] Prisma client generated successfully.");
} catch (err) {
  console.warn(
    "[POSTINSTALL] Prisma client generation failed/skipped:",
    err.message
  );
}
