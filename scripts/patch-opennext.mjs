import fs from "node:fs";
import path from "node:path";

const turbopackPatchFile = path.resolve(
  process.cwd(),
  "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/turbopack.js"
);

if (fs.existsSync(turbopackPatchFile)) {
  let content = fs.readFileSync(turbopackPatchFile, "utf8");

  // Fix Windows backslash path matching for Turbopack SSR chunk bundling in OpenNext
  if (!content.includes('filePath.replaceAll("\\\\", "/")')) {
    content = content.replace(
      'const dotNextDir = filePath.replace(/\\/server\\/chunks\\/.*$/, "");',
      'const normalizedFilePath = filePath.replaceAll("\\\\", "/");\n    const dotNextDir = normalizedFilePath.replace(/\\/server\\/chunks\\/.*$/, "");'
    );
  }

  if (!content.includes('f.replaceAll("\\\\", "/").includes(".next/server/chunks/")')) {
    content = content.replace(
      'const chunkFiles = tracedFiles.filter((f) => f.includes(".next/server/chunks/"));',
      'const chunkFiles = tracedFiles.filter((f) => f.replaceAll("\\\\", "/").includes(".next/server/chunks/"));'
    );
  }

  if (!content.includes('const normalized = file.replaceAll("\\\\", "/");')) {
    content = content.replace(
      'if (file.includes(".next/server/chunks/")) {\n            chunks.add(file);\n        }',
      'const normalized = file.replaceAll("\\\\", "/");\n        if (normalized.includes(".next/server/chunks/")) {\n            chunks.add(normalized);\n        }'
    );
  }

  if (!content.includes('chunk.replaceAll("\\\\", "/")')) {
    content = content.replace(
      'chunk.replace(/.*\\/\\.next\\//, "")}": return require("${chunk}");\`)',
      'chunk.replace(/.*[\\/\\\\]\\.next[\\/\\\\]/, "").replaceAll("\\\\", "/")}": return require("${chunk.replaceAll("\\\\", "/")}");\`)'
    );
  }

  if (!content.includes('absPath.replaceAll("\\\\", "/")')) {
    content = content.replace(
      '.map((absPath) => ({ absPath, relPath: absPath.replace(/.*\\/\\.next\\//, "") }))',
      '.map((absPath) => ({ absPath: absPath.replaceAll("\\\\", "/"), relPath: absPath.replace(/.*[\\/\\\\]\\.next[\\/\\\\]/, "").replaceAll("\\\\", "/") }))'
    );
  }

  fs.writeFileSync(turbopackPatchFile, content, "utf8");
  console.log("✓ Applied Windows path fix to @opennextjs/cloudflare turbopack patcher");
}
