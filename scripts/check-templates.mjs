// Checks what the JSON schema can't: the folder layout, ids, the default and the retro.md layouts.
// Mirrors the rules of the NABS Retros extension (src/retro/templateSources.ts). No dependencies.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = 'templates';
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/;
const MAX_TEMPLATES = 50;
const MAX_FILE_BYTES = 100 * 1024;
const ALLOWED = new Set(['template.json', 'retro.md']);
const errors = [];
const fail = (message) => errors.push(message);

const folders = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
if (folders.length > MAX_TEMPLATES) {
  fail(`${root} has ${folders.length} templates; the extension only reads the first ${MAX_TEMPLATES}.`);
}
for (const entry of readdirSync(root)) {
  if (!statSync(join(root, entry)).isDirectory() && entry !== 'templates.json') {
    fail(`${root}/${entry}: only template folders and templates.json belong in ${root}/.`);
  }
}

for (const folder of folders) {
  const dir = join(root, folder);
  if (!ID.test(folder)) {
    fail(`${dir}: the folder name is the template id: letters, digits, '-' or '_' (max 40), starting with a letter or digit.`);
  }
  for (const file of readdirSync(dir)) {
    if (!ALLOWED.has(file)) {
      fail(`${dir}/${file}: unexpected file (the extension only reads template.json and retro.md).`);
    } else if (statSync(join(dir, file)).size > MAX_FILE_BYTES) {
      fail(`${dir}/${file} is larger than 100 KB.`);
    }
  }
  const jsonPath = join(dir, 'template.json');
  if (!existsSync(jsonPath)) {
    fail(`${dir}: missing template.json.`);
    continue;
  }
  let template;
  try {
    template = JSON.parse(readFileSync(jsonPath, 'utf8'));
  } catch (error) {
    fail(`${jsonPath} isn't valid JSON: ${error.message}`);
    continue;
  }
  if (template.id !== undefined && template.id !== folder) {
    fail(`${jsonPath}: "id" (${JSON.stringify(template.id)}) must match the folder name "${folder}" (or be left out).`);
  }
  const typeIds = (template.types ?? []).map((type) => type.id);
  const duplicates = typeIds.filter((id, index) => typeIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    fail(`${jsonPath}: duplicate type ids: ${[...new Set(duplicates)].join(', ')}.`);
  }
  const values = (template.ratingScale ?? []).map((option) => option.value);
  if (new Set(values).size !== values.length) {
    fail(`${jsonPath}: duplicate ratingScale values.`);
  }
  const layoutPath = join(dir, 'retro.md');
  if (existsSync(layoutPath)) {
    const layout = readFileSync(layoutPath, 'utf8');
    if (!/^feedbackTemplate: \{\{feedbackTemplate\}\}$/m.test(layout)) {
      fail(`${layoutPath}: keep "feedbackTemplate: {{feedbackTemplate}}" in the front matter, so retros remember their template.`);
    }
    for (const placeholder of ['{{wentWell}}', '{{didNotGoWell}}', '{{actionItems}}']) {
      if (!layout.includes(placeholder)) {
        fail(`${layoutPath}: missing ${placeholder} (Summarise Feedback writes that section there).`);
      }
    }
  }
}

const configPath = join(root, 'templates.json');
if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  if (config.default !== undefined && !folders.includes(config.default)) {
    fail(`${configPath}: "default" is "${config.default}", but there's no ${root}/${config.default}/ folder.`);
  }
}

if (errors.length > 0) {
  for (const message of errors) {
    console.error(`::error::${message}`);
  }
  process.exit(1);
}
console.log(`OK: ${folders.length} templates (${folders.join(', ')}).`);
