import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const openapiPath = path.join(
  root,
  "node_modules/@krea-ai/sdk/openapi/krea-openapi.json"
);
const outPath = path.join(root, "lib/krea/krea-official-endpoints.generated.ts");

const openapi = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
const out = [];

for (const apiPath of Object.keys(openapi.paths ?? {}).sort()) {
  const match = apiPath.match(/^\/generate\/(image|video|enhance)\/(.+)$/);
  if (!match) continue;
  const post = openapi.paths[apiPath]?.post;
  const schema = post?.requestBody?.content?.["application/json"]?.schema;
  out.push({
    kind: match[1],
    modelPath: match[2],
    apiPath,
    subscribePath: `${match[1]}/${match[2]}`,
    summary: post?.summary ?? null,
    requiredFields: schema?.required ?? [],
  });
}

const ts = `/** Auto-generated from @krea-ai/sdk openapi — run: node scripts/generate-krea-official-catalog.mjs */
export type KreaOfficialEndpointKind = "image" | "video" | "enhance";

export type KreaOfficialEndpointRecord = {
  kind: KreaOfficialEndpointKind;
  modelPath: string;
  apiPath: string;
  subscribePath: string;
  summary: string | null;
  requiredFields: readonly string[];
};

export const KREA_OFFICIAL_ENDPOINT_RECORDS: readonly KreaOfficialEndpointRecord[] = ${JSON.stringify(out, null, 2)};

export const KREA_OFFICIAL_MODEL_PATHS = new Set<string>(
  KREA_OFFICIAL_ENDPOINT_RECORDS.map((entry) => entry.modelPath)
);
`;

fs.writeFileSync(outPath, ts);
console.log(`Wrote ${out.length} endpoints to ${outPath}`);
