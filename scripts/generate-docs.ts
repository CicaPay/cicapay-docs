import * as OpenAPI from 'fumadocs-openapi';
import { rimraf } from 'rimraf';
import { openapi } from '@/lib/openapi';

const out = './content/docs/openapifiles';

// bun ./scripts/generate-docs.ts
async function generate() {
  // clean generated files
  await rimraf(out, {
    filter(v) {
      return !v.endsWith('meta.json');
    },
  });

  await OpenAPI.generateFiles({
    input: openapi,
    output: out,
  });
}

void generate();