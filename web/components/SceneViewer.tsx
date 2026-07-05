'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import type { Spec, Hypothesis } from '../lib/types';

// All geometry below is RELATIVE placeholder visualization (render confidence
// DEMO). Nothing here encodes measured dimensions; the superstructure appears
// only as a translucent generic ghost mass with no roof/bracket typology.

const BAY = 1; // relative bay unit — not a measurement

function useLayout(spec: Spec) {
  return useMemo(() => {
    const grid = spec.features.find((f) => f.id === spec.meta.target_site.grid_feature_id);
    const bf = grid?.fact_layer.bays_front ?? spec.meta.target_site.expected_bays_front;
    const bs = grid?.fact_layer.bays_side ?? spec.meta.target_site.expected_bays_side;
    return { bf, bs, W: bf * BAY, D: bs * BAY };
  }, [spec]);
}

function GridLines({ W, D, bf, bs }: { W: number; D: number; bf: number; bs: number }) {
  const bars = [];
  for (let i = 0; i <= bf; i++) {
    bars.push(
      <mesh key={`fx${i}`} position={[i * BAY - W / 2, 0.36, 0]}>
        <boxGeometry args={[0.02, 0.02, D]} />
        <meshStandardMaterial color="#d9a441" />
      </mesh>
    );
  }
  for (let j = 0; j <= bs; j++) {
    bars.push(
      <mesh key={`fz${j}`} position={[0, 0.36, j * BAY - D / 2]}>
        <boxGeometry args={[W, 0.02, 0.02]} />
        <meshStandardMaterial color="#d9a441" />
      </mesh>
    );
  }
  return <group>{bars}</group>;
}

function SymbolicColumns({ W, D, bf, bs }: { W: number; D: number; bf: number; bs: number }) {
  // Derived from bays+1 × bays+1 — visualization only, NOT excavated positions.
  const cols = [];
  for (let i = 0; i <= bf; i++) {
    for (let j = 0; j <= bs; j++) {
      cols.push(
        <mesh key={`c${i}-${j}`} position={[i * BAY - W / 2, 0.55, j * BAY - D / 2]}>
          <cylinderGeometry args={[0.05, 0.06, 0.4, 10]} />
          <meshStandardMaterial color="#8a93a5" transparent opacity={0.55} />
        </mesh>
      );
    }
  }
  return <group>{cols}</group>;
}

function OmittedZoneHatch({ W, D }: { W: number; D: number }) {
  // Symbolic central hatch — exact omitted column positions are NOT located yet.
  return (
    <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[W * 0.55, D * 0.45]} />
      <meshStandardMaterial color="#d96459" transparent opacity={0.3} />
    </mesh>
  );
}

function Entrances({ W, D }: { W: number; D: number }) {
  // 3 reported entrance facilities (E1); slots are placeholders, not positions.
  return (
    <group>
      {[-W / 3, 0, W / 3].map((x, i) => (
        <mesh key={i} position={[x, 0.32, D / 2 + 0.35]}>
          <boxGeometry args={[0.6, 0.12, 0.5]} />
          <meshStandardMaterial color="#3fa66a" />
        </mesh>
      ))}
    </group>
  );
}

function Wings({ W, D }: { W: number; D: number }) {
  return (
    <group>
      <mesh position={[W / 2 + 1.2, 0.35, 0]}>
        <boxGeometry args={[1.6, 0.3, D * 0.7]} />
        <meshStandardMaterial color="#6b7484" transparent opacity={0.85} />
      </mesh>
      <mesh position={[-W / 2 - 1.2, 0.35, 0]}>
        <boxGeometry args={[1.6, 0.3, D * 0.7]} />
        <meshStandardMaterial color="#6b7484" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function Walkway({ W, D }: { W: number; D: number }) {
  return (
    <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[W + 3.6, D + 3.6]} />
      <meshStandardMaterial color="#4a4038" />
    </mesh>
  );
}

function SouthBuildings({ W, D }: { W: number; D: number }) {
  return (
    <group>
      {[-W / 4, W / 4].map((x, i) => (
        <mesh key={i} position={[x, 0.2, D / 2 + 2.6]}>
          <boxGeometry args={[2.2, 0.16, 1.1]} />
          <meshStandardMaterial color="#5c5648" />
        </mesh>
      ))}
    </group>
  );
}

function WoljiWater({ W, D }: { W: number; D: number }) {
  // Wolji pond context to the EAST — relative placement, not a real shoreline.
  return (
    <mesh position={[W / 2 + 6.5, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7, D + 8]} />
      <meshStandardMaterial color="#2b5a78" transparent opacity={0.75} />
    </mesh>
  );
}

function MovementAxes({ W, D }: { W: number; D: number }) {
  return (
    <group>
      <mesh position={[0, 0.42, D / 2 + 1.4]}>
        <boxGeometry args={[0.1, 0.04, 2.6]} />
        <meshStandardMaterial color="#3fa66a" transparent opacity={0.9} />
      </mesh>
      <mesh position={[W / 2 + 0.9, 0.42, 0]}>
        <boxGeometry args={[1.8, 0.04, 0.1]} />
        <meshStandardMaterial color="#3fa66a" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-W / 2 - 0.9, 0.42, 0]}>
        <boxGeometry args={[1.8, 0.04, 0.1]} />
        <meshStandardMaterial color="#3fa66a" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function GhostSuperstructure({ W, D, opacity }: { W: number; D: number; opacity: number }) {
  // Generic translucent ghost mass. No roof typology, no bracket typology —
  // those are not assigned for this site (unresolved, source required).
  return (
    <group>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[W, 1.1, D]} />
        <meshStandardMaterial color="#d9d4c8" transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[W + 0.8, 0.6, D + 0.8]} />
        <meshStandardMaterial color="#d9d4c8" transparent opacity={opacity * 0.8} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function SceneViewer({
  spec,
  mode,
  activeHypothesis,
  phaseFeatures
}: {
  spec: Spec;
  mode: string;
  activeHypothesis: Hypothesis | null;
  phaseFeatures: string[] | null;
}) {
  const { W, D, bf, bs } = useLayout(spec);
  const show = (featureId: string, fallback = true) =>
    phaseFeatures ? phaseFeatures.includes(featureId) : fallback;

  const gridTab = spec.derived.mode_tabs[1];
  const isPhaseMode = mode === 'phase timeline';
  const showGrid = mode === gridTab || mode === '내진감주' || (isPhaseMode && show('layout.grid.seven_by_four', false));
  const showHatch = mode === '내진감주' || (isPhaseMode && show('layout.omitted_inner_columns', false));
  const showMovement = mode === '동선/출입';
  const ghostOpacity = mode === '위계/기능 해석'
    ? (activeHypothesis?.ui_treatment?.superstructure_opacity ?? 0.15)
    : mode === '불확실성' ? 0.08 : 0;

  return (
    <Canvas camera={{ position: [10, 9, 12], fov: 42 }}>
      <color attach="background" args={['#14161a']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 12, 6]} intensity={1.1} />

      {/* ground */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#20242b" />
      </mesh>

      {(!isPhaseMode || show('walkway.brick_paved', false)) && <Walkway W={W} D={D} />}

      {/* platform + foundation footprint (reported layout, relative size) */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[W + 1, 0.2, D + 1]} />
        <meshStandardMaterial color="#3a3f49" />
      </mesh>

      {showGrid && <GridLines W={W} D={D} bf={bf} bs={bs} />}
      {(showGrid || mode === '위계/기능 해석') && <SymbolicColumns W={W} D={D} bf={bf} bs={bs} />}
      {showHatch && <OmittedZoneHatch W={W} D={D} />}

      {(!isPhaseMode || show('entrance.facility.01', false)) && <Entrances W={W} D={D} />}
      {(!isPhaseMode || show('corridor.east_wing', false)) && <Wings W={W} D={D} />}
      {(!isPhaseMode || show('site_context.wolji_west', false) || show('context.wolji_water_edge', false)) && (
        <WoljiWater W={W} D={D} />
      )}
      {!isPhaseMode && <SouthBuildings W={W} D={D} />}
      {showMovement && <MovementAxes W={W} D={D} />}

      {ghostOpacity > 0 && <GhostSuperstructure W={W} D={D} opacity={ghostOpacity} />}

      <OrbitControls makeDefault target={[0, 0.4, 0]} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}
