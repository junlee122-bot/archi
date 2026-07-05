import { loadJson } from './io.mjs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMAS = loadJson(
  resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'schemas', 'schemas.json')
);

function typeOk(value, type) {
  const nullable = type.endsWith('?');
  const base = nullable ? type.slice(0, -1) : type;
  if (value === null || value === undefined) return nullable;
  if (base.startsWith('array')) {
    if (!Array.isArray(value)) return false;
    const item = base.includes(':') ? base.split(':')[1] : null;
    if (!item) return true;
    return value.every((v) => typeOk(v, item));
  }
  switch (base) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number';
    case 'integer': return Number.isInteger(value);
    case 'boolean': return typeof value === 'boolean';
    case 'object': return typeof value === 'object' && !Array.isArray(value);
    default: throw new Error(`unknown schema type ${type}`);
  }
}

export function checkAgainst(schemaName, obj, label) {
  const schema = SCHEMAS[schemaName];
  if (!schema) throw new Error(`unknown schema ${schemaName}`);
  const errors = [];
  for (const [field, type] of Object.entries(schema.required)) {
    if (!(field in obj)) { errors.push(`${label}: missing required field '${field}'`); continue; }
    if (!typeOk(obj[field], type)) errors.push(`${label}: field '${field}' fails type ${type}`);
  }
  for (const [field, type] of Object.entries(schema.optional ?? {})) {
    if (field in obj && !typeOk(obj[field], type)) errors.push(`${label}: field '${field}' fails type ${type}`);
  }
  for (const [field, allowed] of Object.entries(schema.enums ?? {})) {
    if (field in obj && obj[field] != null && !allowed.includes(obj[field])) {
      errors.push(`${label}: field '${field}'='${obj[field]}' not in enum [${allowed.join(', ')}]`);
    }
  }
  return errors;
}

export function validateCorpus({ params, sources, segments, features, hypotheses, phases }) {
  const errors = [];
  errors.push(...checkAgainst('params', params, 'params'));
  sources.forEach((s) => errors.push(...checkAgainst('source', s, `source ${s.id ?? '?'}`)));
  segments.forEach((s) => errors.push(...checkAgainst('segment', s, `segment ${s.id ?? '?'}`)));
  for (const f of features) {
    const label = `feature ${f.id ?? '?'}`;
    errors.push(...checkAgainst('feature', f, label));
    if (f.fact_layer && typeof f.fact_layer === 'object') {
      errors.push(...checkAgainst('fact_layer', f.fact_layer, `${label}.fact_layer`));
      (f.fact_layer.evidence ?? []).forEach((ev, i) =>
        errors.push(...checkAgainst('evidence', ev, `${label}.fact_layer.evidence[${i}]`)));
    }
    if (f.geometry_layer && typeof f.geometry_layer === 'object') {
      errors.push(...checkAgainst('geometry_layer', f.geometry_layer, `${label}.geometry_layer`));
      (f.geometry_layer.evidence ?? []).forEach((ev, i) =>
        errors.push(...checkAgainst('evidence', ev, `${label}.geometry_layer.evidence[${i}]`)));
    }
  }
  for (const h of hypotheses) {
    const label = `hypothesis ${h.id ?? '?'}`;
    errors.push(...checkAgainst('hypothesis', h, label));
    (h.supporting_evidence ?? []).forEach((ev, i) =>
      errors.push(...checkAgainst('hypothesis_evidence', ev, `${label}.supporting_evidence[${i}]`)));
    (h.counter_evidence ?? []).forEach((ev, i) =>
      errors.push(...checkAgainst('counter_evidence', ev, `${label}.counter_evidence[${i}]`)));
  }
  phases.forEach((p) => errors.push(...checkAgainst('phase', p, `phase ${p.id ?? '?'}`)));
  return errors;
}
