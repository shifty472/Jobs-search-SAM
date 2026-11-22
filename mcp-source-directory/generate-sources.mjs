import { readFileSync, writeFileSync } from 'node:fs';
const input = readFileSync(process.argv[2], 'utf8');
let category;
const result = [];
for (const line of input.split(/\r?\n/)) {
  if (line.startsWith('## Primary job')) category = 'primary';
  else if (line.startsWith('## Primary employer')) category = 'employer';
  else if (line.startsWith('## Supplemental')) category = 'supplemental';
  const match = line.match(/^\d+\. (.+?) [--] (https:\/\/\S+)/);
  if (match && category) result.push({name: match[1], url: match[2], category});
}
if (result.length !== 76) throw Error(`Expected 76 sources, got ${result.length}`);
writeFileSync(new URL('./sources.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');

