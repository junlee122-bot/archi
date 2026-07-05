import { fileURLToPath } from 'node:url';
import { repoRootFromArgs, loadAll } from './lib/io.mjs';
import { validateCorpus } from './lib/schema-check.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const errors = validateCorpus(loadAll(root));
  if (errors.length) {
    console.error('validate: schema errors:');
    for (const e of errors) console.error('  · ' + e);
    process.exit(1);
  }
  console.log('validate: all data files pass schema checks');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
