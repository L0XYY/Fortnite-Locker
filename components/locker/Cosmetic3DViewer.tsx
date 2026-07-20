"use client";

import { useMemo, useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, useTexture } from "@react-three/drei";

interface ViewerProps {
  imageUrl: string;
  color: string;
  spin: boolean;
  light: number; // 0-100
  resetSignal?: number;
}

/** Real WebGL 3D showcase: the official render lives as a lit standee inside a
 *  fully 3D diorama (rotating pedestal, particles, shadows) you can orbit + zoom. */
export function Cosmetic3DViewer(props: ViewerProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.5, 7.3], fov: 32 }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}

function Scene({ imageUrl, color, spin, light, resetSignal }: ViewerProps) {
  const c = useMemo(() => new THREE.Color(color), [color]);
  const dir = Math.max(0.35, (light / 100) * 2.4);
  const amb = 0.32 + (light / 100) * 0.5;

  return (
    <>
      <ambientLight intensity={amb} />
      <directionalLight
        position={[3.5, 6, 4]}
        intensity={dir}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-3, 2, -3]} intensity={dir * 0.6} color={c} />
      <pointLight position={[0, 1.5, -2.6]} intensity={dir * 0.9} color={c} />

      <GlowDisc color={c} />
      <Hero imageUrl={imageUrl} spin={spin} />
      <Pedestal color={c} />
      <Particles color={c} />

      <ContactShadows position={[0, 0, 0]} scale={6} blur={2.8} far={3.5} opacity={0.4} resolution={512} />

      <Rig resetSignal={resetSignal} />
    </>
  );
}

function Hero({ imageUrl, spin }: { imageUrl: string; spin: boolean }) {
  const tex = useTexture(imageUrl);
  const ref = useRef<THREE.Group>(null);

  const { w, h } = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const img = tex.image as HTMLImageElement | undefined;
    const aspect = img && img.width ? img.height / img.width : 1.7;
    // Normalize to a fixed on-stage height so every skin frames the same.
    const height = 2.8;
    return { w: height / aspect, h: height };
  }, [tex]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = ref.current;
    if (!g) return;
    const targetY = spin ? Math.sin(t * 0.55) * 0.4 : 0;
    g.rotation.y += (targetY - g.rotation.y) * 0.06;
    g.position.y = h / 2 + Math.sin(t * 0.9) * 0.06;
  });

  return (
    <group ref={ref} position={[0, h / 2, 0]}>
      <mesh castShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          map={tex}
          transparent
          alphaTest={0.5}
          roughness={0.68}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Pedestal({ color }: { color: THREE.Color }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.y += delta * 0.35;
  });
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, -0.07, 0]}>
        <cylinderGeometry args={[1.4, 1.62, 0.14, 64]} />
        <meshStandardMaterial color="#26262f" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh ref={ring} position={[0, 0.02, 0]}>
        <torusGeometry args={[1.5, 0.045, 16, 96]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.42, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Particles({ color }: { color: THREE.Color }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const N = 90;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 1.6 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = Math.random() * 4.2;
      arr[i * 3 + 2] = Math.sin(theta) * r;
    }
    return arr;
  }, []);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GlowDisc({ color }: { color: THREE.Color }) {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.4, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(canvas);
    return t;
  }, []);
  return (
    <mesh position={[0, 1.5, -1.6]}>
      <planeGeometry args={[6.5, 6.5]} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Rig({ resetSignal }: { resetSignal?: number }) {
  const controls = useRef<any>(null);
  const { camera } = useThree();
  useEffect(() => {
    if (controls.current) {
      camera.position.set(0, 1.5, 7.3);
      controls.current.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 1.4, 0]}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={11}
      minPolarAngle={0.75}
      maxPolarAngle={1.72}
      minAzimuthAngle={-0.7}
      maxAzimuthAngle={0.7}
    />
  );
}
