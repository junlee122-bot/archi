'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import type { Spec } from '../lib/types';
import { CONF_COLOR } from '../lib/relations';

// All geometry is in metres, scaled from REPORT-STATED dimensions
// (structural-spec.derived.report_dimension_scaled — 25.5m × 15.2m, p.84).
// Individual foundation coordinates are NOT digitized: pad positions derive
// from the symbolic bay grid; everything here is evidence-separated display,
// never a definitive reconstruction. No roof or bracket typology exists.
// The M2.6 silhouette layer is a constrained proxy: post heights are scene-unit
// presets (never measured), the roof stays an untyped envelope, and the
// omitted-column zone is never filled with confident posts.

const MODES = {
  REMAINS: '발굴유구', GRID: '제원/그리드', OMITTED: '내진감주', MOVE: '출입/동선',
  WING: '익랑·회랑', LAND: '대지조성·트렌치', AXIS: '해석축', SIL: '구조 실루엣',
  UNCERT: '불확실성', VERIFY: '검증결과'
} as const;

// camera presets (M2.6): research-neutral viewpoints, no cinematic tricks
const CAMERA_PRESETS: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
  '유구 중심': { pos: [26, 24, 34], target: [0, 0.5, 0] },
  '건물 실루엣': { pos: [31, 11, 29], target: [0, 3.0, 0] },
  '상부/평면 비교': { pos: [1, 46, 12], target: [0, 0.5, 0] }
};

function CameraRig({ preset }: { preset: string }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as any;
  useEffect(() => {
    const p = CAMERA_PRESETS[preset];
    if (!p) return;
    camera.position.set(...p.pos);
    if (controls?.target) {
      controls.target.set(...p.target);
      controls.update();
    }
    camera.updateProjectionMatrix();
  }, [preset, camera, controls]);
  return null;
}

// deterministic tiny RNG (no Math.random — stable renders)
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return (h % 10000) / 10000;
}

export interface ProxyParts {
  columns: boolean;
  beams: boolean;
  roof: boolean;
  corridor: boolean;
  scale: boolean;
}

export interface SceneProps {
  spec: Spec;
  mode: string;
  highlightIds: string[];
  corruptedIds: string[];
  phaseFeatures: string[] | null;
  ghostOn: boolean;
  ghostOpacity: number;
  onSelect: (id: string | null) => void;
  // M2.6 constrained silhouette layer (optional so /verify previews keep working)
  proxyOn?: boolean;
  proxyParts?: ProxyParts;
  heightPreset?: string;
  emphasizeSilhouette?: boolean;
  cameraPreset?: string;
}

const DEFAULT_PARTS: ProxyParts = { columns: true, beams: true, roof: true, corridor: true, scale: true };

export default function SceneViewer(props: SceneProps) {
  const {
    spec, mode, highlightIds, corruptedIds, phaseFeatures, ghostOn, ghostOpacity, onSelect,
    proxyOn = false, proxyParts = DEFAULT_PARTS, heightPreset, emphasizeSilhouette = false,
    cameraPreset = '유구 중심'
  } = props;
  const rds = spec.derived.report_dimension_scaled;
  const W = rds?.length_m ?? 25.5;
  const D = rds?.width_m ?? 15.2;
  const grid = spec.derived.symbolic_column_grid;
  const cols = grid.columns_along_front;
  const rows = grid.columns_along_side;
  const featureMap = useMemo(
    () => Object.fromEntries(spec.features.map((f) => [f.id, f])),
    [spec]
  );

  const hi = new Set(highlightIds);
  const bad = new Set(corruptedIds);
  const phaseSet = phaseFeatures ? new Set(phaseFeatures) : null;
  const inPhase = (fid: string) => !phaseSet || phaseSet.has(fid);

  // per-feature material resolution: uncertainty mode colors by FACT confidence,
  // opacity by RENDER confidence; corruption wins; highlight brightens.
  const styleFor = (fid: string, base: string, baseOpacity = 1) => {
    const f = featureMap[fid];
    if (bad.has(fid)) return { color: '#d96459', opacity: 0.95, transparent: true };
    if (mode === MODES.UNCERT && f) {
      const c = CONF_COLOR[f.confidence] ?? base;
      const ro = f.render_confidence === 'DEMO' ? 0.45 : f.render_confidence === 'E5' ? 0.4 : f.render_confidence === 'E3' ? 0.8 : f.render_confidence === 'E2' ? 0.85 : 0.95;
      return { color: c, opacity: ro, transparent: true };
    }
    if (hi.size > 0) {
      if (hi.has(fid)) return { color: '#e8b64c', opacity: Math.min(1, baseOpacity + 0.05), transparent: baseOpacity < 1 };
      return { color: base, opacity: baseOpacity * 0.3, transparent: true };
    }
    const dimmedInWingMode = mode === MODES.WING && !fid.startsWith('corridor.');
    const dimmedInLandMode = mode === MODES.LAND && !/^(trench|stratigraphy|land_preparation|context\.pre_wolji)/.test(fid);
    if (dimmedInWingMode || dimmedInLandMode) return { color: base, opacity: baseOpacity * 0.28, transparent: true };
    return { color: base, opacity: baseOpacity, transparent: baseOpacity < 1 };
  };

  const click = (fid: string) => (e: any) => { e.stopPropagation(); onSelect(fid); };

  // visibility per mode
  const showGrid = mode === MODES.GRID || mode === MODES.OMITTED || mode === MODES.AXIS;
  const showHatch = mode === MODES.OMITTED || mode === MODES.AXIS || mode === MODES.REMAINS;
  const showArrows = mode === MODES.MOVE;
  const showLand = mode === MODES.LAND;
  const bayW = W / (cols - 1 || 7);
  const bayD = D / (rows - 1 || 4);
  const hatchW = 2 * bayW * 2 * 0.5 + bayW * 1.0; // symbolic central zone ~2 bays wide
  const hatchD = bayD * 2;

  // jeoksim pads from derived artifact (symbolic positions, report-backed sizes)
  const pads = spec.derived.jeoksim_pads?.pads ?? [];
  const padVisible = (p: any) =>
    !(mode === MODES.OMITTED && Math.abs(-W / 2 + p.u * W) < hatchW / 2 && Math.abs(-D / 2 + p.v * D) < hatchD / 2 && p.col > 0 && p.col < cols - 1 && p.row > 0 && p.row < rows - 1);

  // ── M2.6 constrained silhouette proxy (visual only, never measured) ────
  const ps = spec.derived.proxy_superstructure;
  const presetName = heightPreset ?? ps?.height_presets?.default ?? '중간';
  const presetMult = ps?.height_presets?.options?.[presetName] ?? 1.0;
  const postH = 3.3 * presetMult; // scene units — 시각화 preset, 실측 아님
  const beamY = 0.62 + postH;
  const emph = emphasizeSilhouette ? 1.45 : 1;
  const colOpac = Math.min(0.38, (ps?.opacity?.columns ?? 0.3) * emph);
  const beamOpac = Math.min(0.32, (ps?.opacity?.beams ?? 0.26) * emph);
  const roofOpac = Math.min(ps?.opacity?.roof_emphasized_max ?? 0.28, (ps?.opacity?.roof ?? 0.16) * emph);
  const corrOpac = Math.min(0.2, (ps?.opacity?.corridor ?? 0.12) * emph);
  const showProxy = proxyOn && !!ps?.enabled;
  const proxyDim = mode === MODES.AXIS ? 0.7 : 1; // 해석축에서는 더 낮은 존재감

  return (
    <Canvas camera={{ position: [26, 24, 34], fov: 42 }} onPointerMissed={() => onSelect(null)}>
      <color attach="background" args={['#0c0f13']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[18, 30, 14]} intensity={1.15} />
      <directionalLight position={[-24, 18, -10]} intensity={0.3} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[130, 100]} />
        <meshStandardMaterial color="#181c22" />
      </mesh>

      {/* scale bar: 5m reference at SW corner */}
      <group position={[-W / 2, 0.02, D / 2 + 6.5]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[i + 0.5, 0.03, 0]}>
            <boxGeometry args={[1, 0.06, 0.5]} />
            <meshStandardMaterial color={i % 2 ? '#e9e7e2' : '#343a47'} />
          </mesh>
        ))}
      </group>

      {/* foundation footprint + platform (report_dimension_scaled) */}
      {inPhase('foundation.general_layout') && (
        <mesh position={[0, 0.06, 0]} onClick={click('foundation.general_layout')}>
          <boxGeometry args={[W + 2.4, 0.12, D + 2.4]} />
          <meshStandardMaterial {...styleFor('foundation.general_layout', '#2e343f')} />
        </mesh>
      )}
      {inPhase('platform.main_building') && (
        <mesh position={[0, 0.36, 0]} onClick={click('platform.main_building')}>
          <boxGeometry args={[W + 1.2, 0.5, D + 1.2]} />
          <meshStandardMaterial {...styleFor('platform.main_building', '#3f4652')} />
        </mesh>
      )}

      {/* 7×4 grid lines (symbolic uniform subdivision — disclosed) */}
      {showGrid && inPhase('layout.grid.seven_by_four') && (
        <group onClick={click('layout.grid.seven_by_four')}>
          {Array.from({ length: cols }, (_, i) => (
            <mesh key={`gx${i}`} position={[-W / 2 + i * bayW, 0.64, 0]}>
              <boxGeometry args={[0.05, 0.02, D]} />
              <meshStandardMaterial {...styleFor('layout.grid.seven_by_four', '#d9a441')} />
            </mesh>
          ))}
          {Array.from({ length: rows }, (_, j) => (
            <mesh key={`gz${j}`} position={[0, 0.64, -D / 2 + j * bayD]}>
              <boxGeometry args={[W, 0.02, 0.05]} />
              <meshStandardMaterial {...styleFor('layout.grid.seven_by_four', '#d9a441')} />
            </mesh>
          ))}
        </group>
      )}

      {/* jeoksim: procedural rubble pads (base pad + deterministic pebbles) */}
      {inPhase('foundation.jeoksim_grid') && (
        <group onClick={click('foundation.jeoksim_grid')}>
          {pads.map((p: any) => {
            const x = -W / 2 + p.u * W + (p.jitter ?? 0);
            const z = -D / 2 + p.v * D - (p.jitter ?? 0);
            const key = `${p.col}-${p.row}`;
            const r = 1.1 + hash01(key) * 0.3; // within reported 2.2–2.8m diameter
            const dim = !padVisible(p);
            const s = styleFor('foundation.jeoksim_grid', '#828b99', dim ? 0.12 : 1);
            return (
              <group key={key} position={[x, 0.61, z]}>
                <mesh>
                  <cylinderGeometry args={[r, r * 1.06, 0.14, 18]} />
                  <meshStandardMaterial color={s.color} opacity={s.opacity} transparent={s.transparent} />
                </mesh>
                {Array.from({ length: 8 }, (_, k) => {
                  const a = hash01(`${key}:${k}a`) * Math.PI * 2;
                  const rr = hash01(`${key}:${k}r`) * r * 0.72;
                  const sz = 0.14 + hash01(`${key}:${k}s`) * 0.22;
                  const g = 0.42 + hash01(`${key}:${k}g`) * 0.25;
                  const stoneColor = bad.has('foundation.jeoksim_grid') ? '#d96459' : `rgb(${Math.round(g * 255)},${Math.round(g * 255 * 1.02)},${Math.round(g * 255 * 1.1)})`;
                  return (
                    <mesh key={k} position={[Math.cos(a) * rr, 0.1 + sz * 0.3, Math.sin(a) * rr]} rotation={[a, a * 2, a * 0.5]}>
                      <dodecahedronGeometry args={[sz, 0]} />
                      <meshStandardMaterial color={stoneColor} opacity={s.opacity} transparent={s.transparent} />
                    </mesh>
                  );
                })}
              </group>
            );
          })}
        </group>
      )}

      {/* omitted-column zone: symbolic central hatch (positions NOT digitized) */}
      {showHatch && inPhase('layout.omitted_inner_columns') && (
        <group onClick={click('layout.omitted_inner_columns')} position={[0, 0.66, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[hatchW, hatchD]} />
            <meshStandardMaterial {...styleFor('layout.omitted_inner_columns', '#d96459', 0.22)} />
          </mesh>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[-hatchW / 2 + (i + 0.5) * (hatchW / 9), 0.012, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
              <planeGeometry args={[0.14, hatchD * 1.05]} />
              <meshStandardMaterial {...styleFor('layout.omitted_inner_columns', '#d96459', 0.75)} />
            </mesh>
          ))}
        </group>
      )}

      {/* entrances: south pair with dapdo strips, distinct north-central */}
      {(['entrance.south.left', 'entrance.south.right'] as const).map((fid, idx) => {
        if (!inPhase(fid)) return null;
        const x = idx === 0 ? -W / 4 : W / 4;
        const s = styleFor(fid, '#5f6b60');
        const dapdo = styleFor(fid, '#d9a441');
        return (
          <group key={fid} position={[x, 0, D / 2 + 0.65]} onClick={click(fid)}>
            {[0, 1, 2].map((st) => (
              <mesh key={st} position={[0, 0.5 - st * 0.16, st * 0.42]}>
                <boxGeometry args={[2.6, 0.15, 0.4]} />
                <meshStandardMaterial color={s.color} opacity={s.opacity} transparent={s.transparent} />
              </mesh>
            ))}
            {/* 답도: central strip on the stair (계단 중앙석) */}
            <mesh position={[0, 0.62, 0.42]} rotation={[-0.36, 0, 0]}>
              <boxGeometry args={[0.5, 0.05, 1.5]} />
              <meshStandardMaterial color={dapdo.color} opacity={dapdo.opacity} transparent={dapdo.transparent} />
            </mesh>
          </group>
        );
      })}
      {inPhase('entrance.north.center') && (
        <group position={[0, 0, -D / 2 - 0.7]} onClick={click('entrance.north.center')}>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[2.4, 0.14, 1.0]} />
            <meshStandardMaterial {...styleFor('entrance.north.center', '#3f9aa6')} />
          </mesh>
          {[-1, 1].map((sgn) => (
            <mesh key={sgn} position={[sgn * 1.35, 0.58, 0]}>
              <boxGeometry args={[0.32, 0.5, 0.9]} />
              <meshStandardMaterial {...styleFor('entrance.north.center', '#357f89')} />
            </mesh>
          ))}
        </group>
      )}

      {/* walkway/drainage: procedural brick strips around the platform */}
      {inPhase('walkway.drainage_or_paved_facility') && (
        <group onClick={click('walkway.drainage_or_paved_facility')}>
          {(() => {
            const bricks: JSX.Element[] = [];
            const s = styleFor('walkway.drainage_or_paved_facility', '#7a4b38');
            const edge = (len: number, at: (t: number) => [number, number], rot: boolean, keyp: string, rowsN: number) => {
              const n = Math.floor(len / 0.46);
              for (let i = 0; i < n; i++) {
                for (let r2 = 0; r2 < rowsN; r2++) {
                  const [x, z] = at(i / (n - 1));
                  const off = (r2 - (rowsN - 1) / 2) * 0.26;
                  const shade = 0.72 + hash01(`${keyp}:${i}:${r2}`) * 0.4;
                  bricks.push(
                    <mesh
                      key={`${keyp}-${i}-${r2}`}
                      position={rot ? [x + off, 0.42, z] : [x, 0.42, z + off]}
                      rotation={[0, ((i + r2) % 2) * Math.PI / 2, 0]}
                    >
                      <boxGeometry args={[0.38, 0.06, 0.18]} />
                      <meshStandardMaterial
                        color={bad.has('walkway.drainage_or_paved_facility') ? '#d96459' : `rgb(${Math.round(122 * shade)},${Math.round(75 * shade)},${Math.round(56 * shade)})`}
                        opacity={s.opacity} transparent={s.transparent}
                      />
                    </mesh>
                  );
                }
              }
            };
            const px = W / 2 + 1.1, pz = D / 2 + 1.1;
            edge(W + 2, (t) => [-W / 2 - 1 + t * (W + 2), -pz - 0.55], false, 'n', 3); // north: 2.0m급 3열
            edge(W + 2, (t) => [-W / 2 - 1 + t * (W + 2), pz + 0.4], false, 's', 2);
            edge(D + 2, (t) => [-px - 0.4, -D / 2 - 1 + t * (D + 2)], true, 'w', 2);
            edge(D + 2, (t) => [px + 0.4, -D / 2 - 1 + t * (D + 2)], true, 'e', 2);
            return bricks;
          })()}
        </group>
      )}

      {/* east wing (reported, tentative 3×1) */}
      {inPhase('corridor.east_wing') && (
        <mesh position={[W / 2 + 0.9 + 5.05, 0.5, 0]} onClick={click('corridor.east_wing')}>
          <boxGeometry args={[10.1, 0.45, 4.2]} />
          <meshStandardMaterial {...styleFor('corridor.east_wing', '#5c6474', 0.55)} />
        </mesh>
      )}
      {/* west wing: 3×1칸, 10.1×4.2m (p.107-108) + 4 mini pads */}
      {inPhase('corridor.west_wing') && (
        <group position={[-W / 2 - 0.9 - 5.05, 0, 0]} onClick={click('corridor.west_wing')}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[10.1, 0.45, 4.2]} />
            <meshStandardMaterial {...styleFor('corridor.west_wing', '#5c6474', 0.9)} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[-5.05 + 3.37 * i + 0.35, 0.78, 0]}>
              <cylinderGeometry args={[0.95, 1.0, 0.12, 14]} />
              <meshStandardMaterial {...styleFor('corridor.west_wing', '#828b99')} />
            </mesh>
          ))}
        </group>
      )}
      {/* west corridor: 6 pads N-S at ~10.4m west (p.115-119) */}
      {inPhase('corridor.west_corridor') && (
        <group position={[-W / 2 - 10.4 - 1.5, 0, 0]} onClick={click('corridor.west_corridor')}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[3.0, 0.22, D + 8]} />
            <meshStandardMaterial {...styleFor('corridor.west_corridor', '#4a5160', 0.85)} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[0, 0.48, -(D + 6) / 2 + i * ((D + 6) / 5)]}>
              <cylinderGeometry args={[0.82, 0.88, 0.12, 14]} />
              <meshStandardMaterial {...styleFor('corridor.west_corridor', '#828b99')} />
            </mesh>
          ))}
        </group>
      )}
      {/* corridor stone platform: 5 layered courses, dashed uncertain extensions */}
      {inPhase('corridor.west_corridor_stone_platform') && (
        <group position={[-W / 2 - 14.6, 0, 0]} onClick={click('corridor.west_corridor_stone_platform')}>
          {[0, 1, 2, 3, 4].map((c) => (
            <mesh key={c} position={[0, 0.12 + c * 0.24, 0]}>
              <boxGeometry args={[1.5 - c * 0.08, 0.22, D + 10 - c * 0.3]} />
              <meshStandardMaterial {...styleFor('corridor.west_corridor_stone_platform', c < 2 ? '#49505e' : '#5d6675')} />
            </mesh>
          ))}
          {[-1, 1].map((sgn) =>
            [0, 1, 2].map((i) => (
              <mesh key={`${sgn}-${i}`} position={[0, 0.6, sgn * ((D + 10) / 2 + 1.6 + i * 2.4)]}>
                <boxGeometry args={[1.3, 1.0, 1.4]} />
                <meshStandardMaterial {...styleFor('corridor.west_corridor_stone_platform', '#5d6675', 0.28 - i * 0.07)} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* south line-foundation buildings */}
      {(['surrounding.south_line_foundation.building.01', 'surrounding.south_line_foundation.building.02'] as const).map((fid, i) =>
        inPhase(fid) ? (
          <mesh key={fid} position={[i === 0 ? -W / 4 : W / 4, 0.18, D / 2 + 7.5]} onClick={click(fid)}>
            <boxGeometry args={[6, 0.2, 3]} />
            <meshStandardMaterial {...styleFor(fid, '#55503f', 0.9)} />
          </mesh>
        ) : null
      )}

      {/* movement arrows — INTERPRETATION ONLY (출입/동선 mode) */}
      {showArrows && inPhase('movement.primary_entrance_axis') &&
        ([
          ['movement.primary_entrance_axis', 0, D / 2 + 2.5, 0],
          ['movement.primary_entrance_axis', 0, -D / 2 - 2.5, Math.PI]
        ] as const).map(([fid, x, z, rot], i) => (
          <group key={i} position={[x as number, 0.9, z as number]} rotation={[0, 0, 0]} onClick={click(fid as string)}>
            <mesh rotation={[(rot as number) === 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.5, 1.4, 12]} />
              <meshStandardMaterial {...styleFor(fid as string, '#3fa66a', 0.9)} />
            </mesh>
            <mesh position={[0, 0, (rot as number) === 0 ? 1.4 : -1.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 2.2, 8]} />
              <meshStandardMaterial {...styleFor(fid as string, '#3fa66a', 0.9)} />
            </mesh>
          </group>
        ))}

      {/* north trench with 2.5D stratigraphy wall + boto band */}
      {(showLand || mode === MODES.REMAINS) && inPhase('trench.north') && (
        <group position={[3.5, 0, -D / 2 - 10]} onClick={click('trench.north')}>
          <mesh position={[0, -1.62, 0]}>
            <boxGeometry args={[4, 3.2, 15]} />
            <meshStandardMaterial {...styleFor('trench.north', '#14171c')} />
          </mesh>
          {showLand && (
            <group position={[-2.01, 0, 0]} onClick={click('stratigraphy.layers')}>
              {(spec.derived.stratigraphy_section?.layers ?? []).map((l: any, i: number, arr: any[]) => {
                const total = arr.reduce((s2: number, x: any) => s2 + (x.relative_thickness ?? 1), 0);
                const before = arr.slice(0, i).reduce((s2: number, x: any) => s2 + (x.relative_thickness ?? 1), 0);
                const h = ((l.relative_thickness ?? 1) / total) * 3.1;
                const y = -3.2 + (before / total) * 3.1 + h / 2;
                const colors = ['#4a4136', '#5a4f40', '#6b5a44', '#7c6a4e', '#c8a23c', '#8a7654', '#6e6a5a', '#57606e'];
                return (
                  <mesh key={l.code} position={[0, y, 0]}>
                    <boxGeometry args={[0.1, h, 14.6]} />
                    <meshStandardMaterial {...styleFor('stratigraphy.layers', colors[i % colors.length])} />
                  </mesh>
                );
              })}
              {/* 보토시설: wall-like band 1.8m × 0.95m (Ji p.859) */}
              <mesh position={[0.06, -1.9, -6]} onClick={click('land_preparation.boto_facility')}>
                <boxGeometry args={[0.16, 1.8, 0.95]} />
                <meshStandardMaterial {...styleFor('land_preparation.boto_facility', '#e0c23c')} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* land preparation fill volume (대지조성 mode) */}
      {showLand && inPhase('land_preparation.layer') && (
        <mesh position={[0, -0.85, 0]} onClick={click('land_preparation.layer')}>
          <boxGeometry args={[W + 8, 1.6, D + 8]} />
          <meshStandardMaterial {...styleFor('land_preparation.layer', '#5c4a38', 0.5)} />
        </mesh>
      )}

      {/* Wolji water context (east) — schematic, not a shoreline */}
      {inPhase('context.wolji_water_edge') && (
        <mesh position={[W / 2 + 17, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={click('context.wolji_water_edge')}>
          <planeGeometry args={[18, D + 26]} />
          <meshStandardMaterial {...styleFor('context.wolji_water_edge', '#2b5a78', 0.66)} />
        </mesh>
      )}
      {/* pre-Wolji Dongji context (north) — INTERPRETATION layer */}
      {(showLand || phaseSet?.has('context.pre_wolji_dongji')) && inPhase('context.pre_wolji_dongji') && (
        <mesh position={[3.5, 0.005, -D / 2 - 24]} rotation={[-Math.PI / 2, 0, 0]} onClick={click('context.pre_wolji_dongji')}>
          <planeGeometry args={[34, 16]} />
          <meshStandardMaterial {...styleFor('context.pre_wolji_dongji', '#2b7878', 0.45)} />
        </mesh>
      )}

      {/* ── M2.6 구조 실루엣: constrained proxy (columns/beams/untyped roof) ──
          Heights are scene-unit presets. The omitted zone renders hollow slots,
          never confident posts. Everything routes through styleFor so the
          corruption demo and uncertainty coloring apply here too. */}
      {showProxy && (
        <group>
          {/* proxy column posts at symbolic jeoksim positions */}
          {proxyParts.columns && inPhase('superstructure.proxy.column_posts') && (
            <group onClick={click('superstructure.proxy.column_posts')}>
              {(ps?.column_positions ?? []).map((p) => {
                const x = -W / 2 + p.u * W;
                const z = -D / 2 + p.v * D;
                if (p.in_omitted_zone) {
                  // 감주 영역 — 기둥 없음/미확인: hollow dashed slot, no solid post
                  const s = styleFor('superstructure.proxy.column_posts', '#8d97a8', 0.35 * proxyDim);
                  return (
                    <group key={`slot${p.col}-${p.row}`} position={[x, 0.68, z]}>
                      <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.3, 0.42, 20]} />
                        <meshStandardMaterial color={s.color} opacity={s.opacity} transparent side={2} />
                      </mesh>
                      <mesh position={[0, postH * 0.5, 0]}>
                        <cylinderGeometry args={[0.3, 0.32, postH, 8, 4, true]} />
                        <meshStandardMaterial color={s.color} opacity={s.opacity * 0.3} transparent wireframe />
                      </mesh>
                    </group>
                  );
                }
                const s = styleFor('superstructure.proxy.column_posts', '#c9a36a', colOpac * proxyDim);
                return (
                  <mesh key={`post${p.col}-${p.row}`} position={[x, 0.62 + postH / 2, z]}>
                    <cylinderGeometry args={[0.27, 0.32, postH, 12]} />
                    <meshStandardMaterial color={s.color} opacity={s.opacity} transparent depthWrite={false} />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* beam/purlin rhythm frame — thin translucent rails, wireframe feel */}
          {proxyParts.beams && inPhase('superstructure.proxy.beam_frame') && (
            <group onClick={click('superstructure.proxy.beam_frame')}>
              {Array.from({ length: rows }, (_, j) => {
                const s = styleFor('superstructure.proxy.beam_frame', '#d9c9a8', beamOpac * proxyDim);
                return (
                  <mesh key={`bx${j}`} position={[0, beamY, -D / 2 + j * bayD]}>
                    <boxGeometry args={[W + 0.5, 0.13, 0.14]} />
                    <meshStandardMaterial color={s.color} opacity={s.opacity} transparent depthWrite={false} />
                  </mesh>
                );
              })}
              {Array.from({ length: cols }, (_, i) => {
                const s = styleFor('superstructure.proxy.beam_frame', '#d9c9a8', beamOpac * proxyDim);
                return (
                  <mesh key={`bz${i}`} position={[-W / 2 + i * bayW, beamY, 0]}>
                    <boxGeometry args={[0.14, 0.13, D + 0.5]} />
                    <meshStandardMaterial color={s.color} opacity={s.opacity} transparent depthWrite={false} />
                  </mesh>
                );
              })}
              {/* upper perimeter ring — rhythm only, no joinery claim */}
              {([[0, -D / 2], [0, D / 2]] as const).map(([x, z], k) => {
                const s = styleFor('superstructure.proxy.beam_frame', '#d9c9a8', beamOpac * 0.8 * proxyDim);
                return (
                  <mesh key={`pr${k}`} position={[x, beamY + 0.55, z]}>
                    <boxGeometry args={[W + 0.5, 0.11, 0.12]} />
                    <meshStandardMaterial color={s.color} opacity={s.opacity} transparent depthWrite={false} />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* untyped roof envelope — rectangular translucent volumes + wire box.
              NOT a roof-type silhouette; a visual mass convention only. */}
          {proxyParts.roof && inPhase('superstructure.proxy.roof_envelope') && (() => {
            const s = styleFor('superstructure.proxy.roof_envelope', '#cfc4ae', roofOpac * proxyDim);
            const sw = styleFor('superstructure.proxy.roof_envelope', '#cfc4ae', Math.min(0.5, roofOpac * 2.4) * proxyDim);
            return (
              <group onClick={click('superstructure.proxy.roof_envelope')}>
                <mesh position={[0, beamY + 1.5, 0]}>
                  <boxGeometry args={[W + 2.6, 1.7, D + 2.6]} />
                  <meshStandardMaterial color={s.color} opacity={s.opacity} transparent depthWrite={false} />
                </mesh>
                <mesh position={[0, beamY + 2.7, 0]}>
                  <boxGeometry args={[W * 0.7, 0.9, D * 0.62]} />
                  <meshStandardMaterial color={s.color} opacity={s.opacity * 0.85} transparent depthWrite={false} />
                </mesh>
                <mesh position={[0, beamY + 1.5, 0]}>
                  <boxGeometry args={[W + 2.7, 1.75, D + 2.7]} />
                  <meshStandardMaterial color={sw.color} opacity={sw.opacity} transparent wireframe />
                </mesh>
              </group>
            );
          })()}

          {/* corridor upper silhouette — report-backed west corridor line, lower opacity, dashed extension */}
          {proxyParts.corridor && inPhase('superstructure.proxy.corridor_upper_silhouette') && (() => {
            const cx = -W / 2 - 11.9;
            const span = D + 6;
            const s = styleFor('superstructure.proxy.corridor_upper_silhouette', '#c9a36a', Math.max(0.07, corrOpac * proxyDim));
            const cPostH = postH * 0.62;
            return (
              <group onClick={click('superstructure.proxy.corridor_upper_silhouette')}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <mesh key={`cp${i}`} position={[cx, 0.55 + cPostH / 2, -span / 2 + i * (span / 5)]}>
                    <cylinderGeometry args={[0.2, 0.24, cPostH, 10]} />
                    <meshStandardMaterial color={s.color} opacity={s.opacity} transparent depthWrite={false} />
                  </mesh>
                ))}
                <mesh position={[cx, 0.6 + cPostH + 0.55, 0]}>
                  <boxGeometry args={[2.6, 1.0, span + 1.2]} />
                  <meshStandardMaterial color={s.color} opacity={s.opacity * 0.8} transparent depthWrite={false} />
                </mesh>
                {/* dashed uncertain extension to the north/south */}
                {[-1, 1].map((sgn) =>
                  [0, 1, 2].map((i) => (
                    <mesh key={`ce${sgn}${i}`} position={[cx, 0.6 + cPostH + 0.55, sgn * (span / 2 + 1.6 + i * 2.2)]}>
                      <boxGeometry args={[2.4, 0.9, 1.2]} />
                      <meshStandardMaterial color={s.color} opacity={Math.max(0.02, s.opacity * (0.55 - i * 0.16))} transparent depthWrite={false} />
                    </mesh>
                  ))
                )}
              </group>
            );
          })()}

          {/* material context tray — abstract fragment markers (기와·치미 출토 맥락),
              never scattered on the roof, never source imagery */}
          {inPhase('material_context.roof_tile_fragments') && (() => {
            const tz = D / 2 + 4.2;
            const tx = W / 2 + 7.5;
            const sTile = styleFor('material_context.roof_tile_fragments', '#9a8570', 0.95);
            const sChimi = styleFor('material_context.chimi_fragments', '#b0917a', 0.95);
            return (
              <group position={[tx, 0, tz]}>
                <mesh position={[0, 0.06, 0]} onClick={click('material_context.roof_tile_fragments')}>
                  <boxGeometry args={[5.6, 0.12, 3.0]} />
                  <meshStandardMaterial color="#232833" />
                </mesh>
                {Array.from({ length: 9 }, (_, k) => {
                  const rx = (hash01(`tile${k}x`) - 0.5) * 4.2;
                  const rz = (hash01(`tile${k}z`) - 0.5) * 2.0;
                  const rot = hash01(`tile${k}r`) * Math.PI;
                  return (
                    <mesh key={k} position={[rx - 0.5, 0.2, rz]} rotation={[hash01(`tile${k}t`) * 0.5, rot, 0]} onClick={click('material_context.roof_tile_fragments')}>
                      <cylinderGeometry args={[0.42, 0.42, 0.07, 10, 1, false, 0, Math.PI * (0.5 + hash01(`tile${k}a`) * 0.6)]} />
                      <meshStandardMaterial color={sTile.color} opacity={sTile.opacity} transparent side={2} />
                    </mesh>
                  );
                })}
                {/* chimi fragments: two abstract upright slabs (깃대부·머리부 일부) */}
                {[0, 1].map((k) => (
                  <mesh key={`ch${k}`} position={[2.0 + k * 0.5, 0.36, -0.5 + k * 0.9]} rotation={[0.1, k * 0.7, 0.08]} onClick={click('material_context.chimi_fragments')}>
                    <boxGeometry args={[0.16, 0.62 - k * 0.18, 0.4]} />
                    <meshStandardMaterial color={sChimi.color} opacity={sChimi.opacity} transparent />
                  </mesh>
                ))}
              </group>
            );
          })()}

          {/* human scale helper — neutral grey figure, UI helper only */}
          {proxyParts.scale && inPhase('scale_helper.human_silhouette') && (
            <group position={[W / 2 + 3.4, 0.62, D / 2 - 1.2]} onClick={click('scale_helper.human_silhouette')}>
              <mesh position={[0, 0.7, 0]}>
                <capsuleGeometry args={[0.22, 1.05, 4, 10]} />
                <meshStandardMaterial color="#8d97a8" opacity={0.85} transparent />
              </mesh>
              <mesh position={[0, 1.55, 0]}>
                <sphereGeometry args={[0.16, 12, 12]} />
                <meshStandardMaterial color="#8d97a8" opacity={0.85} transparent />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* ghost superstructure: generic mass ONLY (no roof/bracket typology) */}
      {ghostOn && inPhase('superstructure.roof_mass.ghost') && (() => {
        const ghostColor = bad.has('superstructure.roof_mass.ghost') ? '#d96459' : '#d9d4c8';
        return (
          <group onClick={click('superstructure.roof_mass.ghost')}>
            {pads.map((p: any) => (
              <mesh key={`gc${p.col}-${p.row}`} position={[-W / 2 + p.u * W, 2.2, -D / 2 + p.v * D]}>
                <cylinderGeometry args={[0.22, 0.26, 3.0, 10]} />
                <meshStandardMaterial color={ghostColor} transparent opacity={ghostOpacity * 0.7} depthWrite={false} />
              </mesh>
            ))}
            <mesh position={[0, 4.2, 0]}>
              <boxGeometry args={[W, 1.4, D]} />
              <meshStandardMaterial color={ghostColor} transparent opacity={ghostOpacity} depthWrite={false} />
            </mesh>
            <mesh position={[0, 5.4, 0]}>
              <boxGeometry args={[W + 1.6, 0.8, D + 1.6]} />
              <meshStandardMaterial color={ghostColor} transparent opacity={ghostOpacity * 0.75} depthWrite={false} />
            </mesh>
          </group>
        );
      })()}

      <OrbitControls makeDefault target={[0, 0.5, 0]} maxPolarAngle={Math.PI / 2.05} minDistance={8} maxDistance={110} />
      <CameraRig preset={cameraPreset} />
    </Canvas>
  );
}
