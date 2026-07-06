'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import type { Spec } from '../lib/types';
import { CONF_COLOR } from '../lib/relations';

// All geometry is in metres, scaled from REPORT-STATED dimensions
// (structural-spec.derived.report_dimension_scaled — 25.5m × 15.2m, p.84).
// Individual foundation coordinates are NOT digitized: pad positions derive
// from the symbolic bay grid; everything here is evidence-separated display,
// never a definitive reconstruction. No roof or bracket typology exists.

const MODES = {
  REMAINS: '발굴유구', GRID: '제원/그리드', OMITTED: '내진감주', MOVE: '출입/동선',
  WING: '익랑·회랑', LAND: '대지조성·트렌치', AXIS: '해석축', UNCERT: '불확실성', VERIFY: '검증결과'
} as const;

// deterministic tiny RNG (no Math.random — stable renders)
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return (h % 10000) / 10000;
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
}

export default function SceneViewer(props: SceneProps) {
  const { spec, mode, highlightIds, corruptedIds, phaseFeatures, ghostOn, ghostOpacity, onSelect } = props;
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
    </Canvas>
  );
}
