"use client";

/**
 * Procedural primitive fallbacks — rendered while GLBs load and whenever
 * a model is missing or fails to parse. Dark metallic PBR materials so
 * the purple/cyan rim lights still read.
 */

const dark = "#26222a";
const darker = "#1a171d";

function Plate({ x, r }: { x: number; r: number }) {
  return (
    <mesh position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[r, r, 0.22, 48]} />
      <meshStandardMaterial color={dark} metalness={0.9} roughness={0.28} />
    </mesh>
  );
}

export function ProceduralDumbbell() {
  return (
    <group rotation={[0.1, 0, -0.35]}>
      {/* handle */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 2.5, 32]} />
        <meshStandardMaterial color="#4a454d" metalness={1} roughness={0.32} />
      </mesh>
      {/* grip knurling hint */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.9, 32]} />
        <meshStandardMaterial color={darker} metalness={0.85} roughness={0.5} />
      </mesh>
      {/* plates */}
      <Plate x={-1.05} r={0.58} />
      <Plate x={-0.82} r={0.46} />
      <Plate x={1.05} r={0.58} />
      <Plate x={0.82} r={0.46} />
      {/* end caps */}
      <mesh position={[-1.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
        <meshStandardMaterial color="#5a005f" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[1.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
        <meshStandardMaterial color="#5a005f" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function ProceduralKettlebell() {
  return (
    <group position={[0, -0.25, 0]}>
      {/* body */}
      <mesh castShadow>
        <sphereGeometry args={[0.85, 48, 48]} />
        <meshStandardMaterial color={dark} metalness={0.85} roughness={0.3} />
      </mesh>
      {/* flat base */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.45, 0.5, 0.18, 32]} />
        <meshStandardMaterial color={darker} metalness={0.85} roughness={0.4} />
      </mesh>
      {/* handle */}
      <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.52, 0.11, 20, 48, Math.PI]} />
        <meshStandardMaterial color="#4a454d" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function ProceduralPlateStack() {
  return (
    <group rotation={[0.25, 0.4, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.4 + i * 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.9 - i * 0.18, 0.9 - i * 0.18, 0.22, 48]} />
          <meshStandardMaterial color={i === 1 ? "#5a005f" : dark} metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
