// Forbidden-language policy (patch section J / check V39).
// Scans USER-FACING claims only. Policy text, negated sentences, quoted term
// lists, and code comments are exempt by design.

// The list itself is exempt from scanning ("strings inside arrays named forbiddenTerms").
export const forbiddenTerms = [
  '원형 복원',
  '정확한 신라 궁궐 복원',
  '실제 동궁 모습',
  'AI가 복원한 실제 모습',
  '완벽한 고증',
  '확정된 태자궁',
  '확정된 왕의 공간',
  '확정 복원',
  'confirmed original appearance'
];

export const allowedReplacements = [
  '발굴유구 기반 표시',
  '보고서 기반 해석',
  '상부구조 가설',
  '기능 해석 가설',
  '경쟁 해석',
  '최신 재비정',
  'source required',
  'unresolved'
];

const NEGATION_PATTERNS = [
  '금지',
  '사용하지 않는다',
  'must not',
  'do not',
  'not a',
  '아니다',
  '아닙니다',
  '않는다',
  '금지어'
];

const COMMENT_PREFIXES = ['//', '*', '/*', '#', '<!--', '{/*'];

export function isNegatedContext(line) {
  const lower = line.toLowerCase();
  return NEGATION_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

export function isCommentLine(line) {
  const t = line.trim();
  return COMMENT_PREFIXES.some((p) => t.startsWith(p));
}

// Regions of the form: forbiddenTerms ... [ ... ]  are the canonical term list
// and never count as usage.
function forbiddenTermsArrayLines(text) {
  const lines = text.split('\n');
  const exempt = new Set();
  let inArray = false;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inArray && /forbiddenTerms\s*[:=]?\s*\[?/.test(line) && line.includes('forbiddenTerms')) {
      inArray = true;
      depth = 0;
    }
    if (inArray) {
      exempt.add(i);
      for (const ch of line) {
        if (ch === '[') depth++;
        if (ch === ']') depth--;
      }
      if (depth <= 0 && line.includes(']')) inArray = false;
    }
  }
  return exempt;
}

// Markdown sections whose heading mentions the forbidden-term policy are lists
// of banned vocabulary, not claims.
function policySectionLines(text) {
  const lines = text.split('\n');
  const exempt = new Set();
  let inPolicySection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const heading = /^#{1,6}\s+(.*)$/.exec(line.trim());
    if (heading) {
      const h = heading[1].toLowerCase();
      inPolicySection = h.includes('금지어') || h.includes('forbidden');
    }
    if (inPolicySection) exempt.add(i);
  }
  return exempt;
}

/**
 * Scan text for forbidden user-facing claims.
 * @returns array of {line: 1-based, term, text}
 */
export function scanText(text, { kind = 'plain' } = {}) {
  const lines = text.split('\n');
  const arrayExempt = forbiddenTermsArrayLines(text);
  const sectionExempt = kind === 'markdown' ? policySectionLines(text) : new Set();
  const violations = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (arrayExempt.has(i) || sectionExempt.has(i)) continue;
    if (isCommentLine(line)) continue;
    if (isNegatedContext(line)) continue;
    for (const term of forbiddenTerms) {
      if (line.includes(term)) violations.push({ line: i + 1, term, text: line.trim().slice(0, 160) });
    }
  }
  return violations;
}

// User-facing string keys inside generated artifacts (structural-spec etc.).
const USER_FACING_KEYS = new Set([
  'statement_ko', 'summary_ko', 'name_ko', 'name_en', 'title_ko', 'title_en',
  'warning', 'claim', 'label', 'label_ko', 'label_en', 'notes_public',
  'legacy_badge_label_ko', 'legacy_badge_label_en'
]);
const USER_FACING_ARRAY_KEYS = new Set(['warnings', 'confidence_notes', 'unresolved_questions', 'claims']);

export function scanSpecObject(obj) {
  const violations = [];
  const visit = (node, path) => {
    if (node == null) return;
    if (Array.isArray(node)) {
      node.forEach((v, i) => visit(v, `${path}[${i}]`));
      return;
    }
    if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        if (typeof v === 'string' && USER_FACING_KEYS.has(k)) {
          checkString(v, `${path}.${k}`);
        } else if (Array.isArray(v) && USER_FACING_ARRAY_KEYS.has(k)) {
          v.forEach((s, i) => { if (typeof s === 'string') checkString(s, `${path}.${k}[${i}]`); });
        } else {
          visit(v, `${path}.${k}`);
        }
      }
    }
  };
  const checkString = (s, path) => {
    if (isNegatedContext(s)) return;
    for (const term of forbiddenTerms) {
      if (s.includes(term)) violations.push({ path, term, text: s.slice(0, 160) });
    }
  };
  visit(obj, '$');
  return violations;
}
