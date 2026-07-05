// source-scout.mjs — reports source verification status. Live web verification
// happens outside this deterministic build (research session / CI job) and its
// results are recorded in data/source-scout-findings.json; this script audits
// registry vs findings and prints the outstanding TODO list.
import { fileURLToPath } from 'node:url';
import { repoRootFromArgs, loadJson, paths, fileExists } from './lib/io.mjs';
import { licenseStatus } from './lib/model.mjs';

export function main(argv = process.argv.slice(2)) {
  const root = repoRootFromArgs(argv);
  const sources = loadJson(paths.sources(root));
  const findings = fileExists(paths.scoutFindings(root)) ? loadJson(paths.scoutFindings(root)) : null;
  const findingMap = new Map((findings?.results ?? []).map((r) => [r.id, r]));

  console.log('source-scout — 소스 검증 현황');
  if (findings) console.log(`findings 파일: scouted_at=${findings.scouted_at}, method=${findings.method}`);
  else console.log('findings 파일 없음 (data/source-scout-findings.json) — 웹 검증 결과 미기록');
  console.log('');

  const todos = [];
  for (const s of sources) {
    const st = licenseStatus(s);
    const f = findingMap.get(s.id);
    const flags = [];
    if (!s.verified) flags.push('verified=false');
    if (!s.license_verified && s.type !== 'internal_rule') flags.push(`license: ${s.license}`);
    if (String(s.url ?? '').includes('TO_VERIFY') || String(s.url ?? '').includes('_TO_VERIFY')) flags.push('url 미확정');
    if (String(s.pdf_url ?? '').startsWith('TO_')) flags.push('pdf_url 미확정');
    console.log(`- ${s.id}`);
    console.log(`    status=${st}${flags.length ? ' | TODO: ' + flags.join(', ') : ' | OK'}`);
    if (f) console.log(`    scout: found=${f.result?.found} access=${f.result?.access_status} confidence=${f.result?.confidence}`);
    if (flags.length && s.type !== 'internal_rule') todos.push(`${s.id}: ${flags.join(', ')}`);
  }
  console.log('');
  if (todos.length) {
    console.log(`미해결 locator/license TODO ${todos.length}건 — strict mode에서 게이트됨:`);
    for (const t of todos) console.log('  · ' + t);
  } else {
    console.log('모든 소스 locator/license 확정.');
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
