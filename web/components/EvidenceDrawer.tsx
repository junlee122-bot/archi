'use client';

import type { Feature, Spec } from '../lib/types';
import type { SourceMeta } from '../lib/useArtifacts';
import ConfidenceBadge from './ConfidenceBadge';
import { linkedHypotheses, linkedPhases, relatedChecks, NOT_CLAIMED_LABELS } from '../lib/relations';

const STACK_LABEL: Record<string, string> = {
  archaeology: '보고 사실', context: '보고 사실 / 맥락', hypothesis: '기능 가설', uncertainty: '불확실성'
};

const PROXY_LAYERS = new Set(['proxy_silhouette', 'material_context', 'helper']);

// The drawer is the heart of evidence separation: FACT (source-backed claim,
// class, locator) is always shown apart from RENDER (how we visualize it).
export default function EvidenceDrawer({
  feature, spec, sources
}: {
  feature: Feature | null;
  spec: Spec;
  sources: SourceMeta[] | null;
}) {
  if (!feature) {
    return (
      <div className="card">
        <p className="small">
          장면의 유구 또는 목록에서 feature를 선택하면 사실(FACT) 근거와 표시(RENDER) 방식을 분리해 보여줍니다.
        </p>
      </div>
    );
  }
  const srcById = new Map((sources ?? []).map((s) => [s.id, s]));
  const segById = new Map((spec.segments ?? []).map((s: any) => [s.id, s]));
  const stack = feature.derived_badges?.archaeology_vs_hypothesis ?? 'context';
  const hyps = linkedHypotheses(spec, feature.id);
  const phases = linkedPhases(spec, feature.id);
  const checks = relatedChecks(feature.id);
  const geomMode = (feature.geometry_layer as any).geometry_mode ?? feature.geometry_layer.type;

  const evidenceCard = (ev: any, i: number) => {
    const src = srcById.get(ev.source_id);
    const seg: any = ev.source_segment_id ? segById.get(ev.source_segment_id) : null;
    const page = seg?.locator?.page ?? ev.locator?.page ?? null;
    return (
      <div className="srccard" key={i}>
        <div className="t">
          <ConfidenceBadge cls={ev.class} short /> {src?.title ?? ev.source_id}
        </div>
        <div className="m">
          {[src?.author, src?.publisher ?? src?.journal, src?.type, src?.year].filter(Boolean).join(' · ')}
        </div>
        <div className="m">
          {page != null && <>locator: <b>p.{String(page)}</b></>}
          {seg?.locator?.table && <> · {seg.locator.table}</>}
          {seg?.locator?.figure && <> · {seg.locator.figure}</>}
          {ev.method && <> · method: {ev.method}</>}
        </div>
        {seg && <div className="m">segment: <span className="mono">{seg.id}</span></div>}
        {src && (
          <div className="m">
            license: {src.license} {src.license_verified ? '(확인)' : '(미확인)'} · public asset {src.public_asset_allowed ? '허용' : '금지'}
            {seg?.needs_source_review && <span className="badge legacy">부분 판독</span>}
          </div>
        )}
        {(ev.note || ev.claim) && <div className="m">{ev.note ?? ev.claim}</div>}
      </div>
    );
  };

  return (
    <div className="card">
      <h3>{feature.name_ko}</h3>
      <div>
        <span className="badge stage">{STACK_LABEL[stack] ?? stack}</span>
        <span className="badge outline">{feature.category}</span>
        <span className="badge outline">{feature.archaeological_status}</span>
        <span className="badge outline">{feature.render_layer}</span>
      </div>
      <p className="small mono">{feature.id}</p>

      <div className="fact-block">
        <h4>FACT — 사실 layer <ConfidenceBadge cls={feature.fact_layer.confidence} /></h4>
        <p>{feature.fact_layer.statement_ko}</p>
        {feature.fact_layer.evidence.map(evidenceCard)}
      </div>

      <div className="render-block">
        <h4>RENDER — 표시 layer <ConfidenceBadge cls={feature.render_confidence} /></h4>
        <p>
          표시 방식: <b>{geomMode}</b>
          {(feature.geometry_layer as any).footprint_source && (
            <> · 스케일 근거: {(feature.geometry_layer as any).footprint_source}</>
          )}
          {(feature.geometry_layer as any).subdivision_assumed && <> · 칸 분할은 균등 가정</>}
          {feature.ui_flags.relative_geometry && <> · 상대 배치 (실측 좌표 아님)</>}
        </p>
        {feature.geometry_layer.evidence.map(evidenceCard)}
      </div>

      {(feature.not_usable_for ?? []).length > 0 && (
        <div className="fact-block" style={{ borderColor: '#7a4a4a' }}>
          <h4>NOT CLAIMED — 이 표시가 주장하지 않는 것</h4>
          <div>
            {(feature.not_usable_for ?? []).map((k) => (
              <span key={k} className="badge legacy" style={{ marginRight: 4, marginBottom: 4 }}>
                {NOT_CLAIMED_LABELS[k] ?? k}
              </span>
            ))}
          </div>
        </div>
      )}

      {feature.render_layer === 'proxy_silhouette' && (
        <div className="card" style={{ marginTop: 8 }}>
          <h4>왜 표시가 허용되는가?</h4>
          <p className="small">
            적심과 평면은 보고서 근거가 있지만, 상부 목구조는 남아 있지 않습니다. 따라서 이 레이어는
            구조 리듬과 규모감을 이해하기 위한 투명한 proxy입니다. 지붕형식 미지정 · 공포양식 미지정 ·
            기둥 높이 미확정 — 원형 복원 아님.
          </p>
        </div>
      )}
      {PROXY_LAYERS.has(feature.render_layer) && feature.render_layer !== 'proxy_silhouette' && (
        <p className="small warn">
          {feature.render_layer === 'helper'
            ? 'UI helper — 고고학 feature가 아니며 사실 주장이 없습니다.'
            : '재료 맥락 마커 — 절차적 추상 표시이며 지붕형식 확정 근거로 사용하지 않습니다.'}
        </p>
      )}

      {feature.warnings.length > 0 && (
        <>
          <h4>주의</h4>
          <ul>
            {feature.warnings.map((w, i) => (
              <li key={i} className="warn">{w}</li>
            ))}
          </ul>
        </>
      )}

      <h4>연결 가설</h4>
      {hyps.length ? (
        <ul>
          {hyps.map((h) => (
            <li key={h.id}>
              <span className="badge axis">{h.axis_label_ko}</span> {h.title_ko} <ConfidenceBadge cls={h.confidence} short />
            </li>
          ))}
        </ul>
      ) : (
        <p className="small">연결된 가설 없음</p>
      )}

      <h4>연결 phase</h4>
      {phases.length ? (
        <ul>
          {phases.map((p) => (
            <li key={p.id}>
              <span className="badge stage">{p.stage_kind}</span> {p.name_ko} <ConfidenceBadge cls={p.confidence} short />
            </li>
          ))}
        </ul>
      ) : (
        <p className="small">연결된 phase 없음</p>
      )}

      <h4>관련 verifier 체크</h4>
      <p className="small mono">{checks.join(' · ')}</p>
    </div>
  );
}
