"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";

function WaterDroplet({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.4 * speed) * 0.15;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8 * speed) * 0.15;
    }
  });

  return (
    <Float speed={1.8 * speed} rotationIntensity={0.5} floatIntensity={1.4}>
      <Sphere ref={meshRef} args={[1.2 * scale, 64, 64]} position={position}>
        <MeshDistortMaterial
          color="#1a7fb8"
          attach="material"
          distort={0.4}
          speed={2.5}
          roughness={0.05}
          metalness={0.9}
          transparent
          opacity={0.75}
        />
      </Sphere>
    </Float>
  );
}

function RippleRing({ radius, speed }: { radius: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = (state.clock.elapsedTime * speed) % 1;
      const scale = 0.5 + t * 2.5;
      ref.current.scale.set(scale, scale, 1);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - t) * 0.25;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <ringGeometry args={[radius, radius + 0.08, 64]} />
      <meshBasicMaterial color="#4ecdc4" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Particles({ count = 400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.06;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#4ecdc4" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function FlowTorus() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.3;
      ref.current.rotation.z = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Torus ref={ref} args={[2.8, 0.02, 16, 100]} position={[0, 0, -1]}>
      <meshBasicMaterial color="#4ecdc4" transparent opacity={0.15} />
    </Torus>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#e8f4f8" />
      <pointLight position={[-5, -3, -5]} intensity={0.6} color="#4ecdc4" />
      <spotLight position={[0, 10, 2]} angle={0.4} penumbra={1} intensity={1} color="#1a7fb8" />
      <WaterDroplet position={[0, 0, 0]} scale={1.4} speed={1} />
      <WaterDroplet position={[-2.2, 0.8, -1]} scale={0.5} speed={1.3} />
      <WaterDroplet position={[2, -0.5, 0.5]} scale={0.35} speed={0.9} />
      <WaterDroplet position={[1.2, 1.5, -0.8]} scale={0.25} speed={1.1} />
      <RippleRing radius={0.8} speed={0.6} />
      <RippleRing radius={1.2} speed={0.45} />
      <FlowTorus />
      <Particles count={400} />
    </>
  );
}

export function WaterScene3D({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
