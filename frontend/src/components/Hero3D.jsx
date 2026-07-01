import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial, Sparkles, Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const HELMET_URL = "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb";

function Helmet({ position = [0, 0, 0], scale = 1.05 }) {
  const gltf = useGLTF(HELMET_URL);
  const ref = useRef();
  useFrame((state, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.35;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.12;
    }
  });
  return (
    <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.6}>
      <primitive ref={ref} object={gltf.scene} position={position} scale={scale} />
    </Float>
  );
}
useGLTF.preload(HELMET_URL);

function CoreFallback({ color = "#00F0FF", color2 = "#9D00FF" }) {
  const ref = useRef();
  useFrame((s, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.4;
      ref.current.rotation.x += d * 0.15;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial color={color} emissive={color2} emissiveIntensity={0.7} roughness={0.15} metalness={0.95} wireframe />
      </mesh>
    </Float>
  );
}

function EnergyRing({ position = [0, 0, 0], color = "#00F0FF", scale = 1 }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.15;
      ref.current.rotation.y += delta * 0.25;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1.6, 0.02, 32, 200]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        roughness={0.2}
        metalness={0.9}
      />
    </mesh>
  );
}

function Holo({ position, color, args = [0.6, 0.6, 0.6] }) {
  const ref = useRef();
  useFrame((s, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.4;
      ref.current.rotation.x += d * 0.2;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={2}>
      <mesh ref={ref} position={position}>
        <boxGeometry args={args} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.9}
          distort={0.35}
          speed={2}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

function Icosa({ position, color }) {
  const ref = useRef();
  useFrame((s, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.3;
      ref.current.rotation.z += d * 0.15;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={1.4} floatIntensity={2.4}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.9}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function CameraRig() {
  const { camera, mouse } = useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 0.8, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.mouse.y * 0.5, 0.05);
    state.camera.lookAt(0, 0, 0);
  }) || {};
  return null;
}

export default function Hero3D({ accent = "#00F0FF", accent2 = "#9D00FF" }) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 5], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#05070B", 6, 14]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 3, 3]} intensity={2} color={accent} />
      <pointLight position={[-3, -2, 2]} intensity={1.6} color={accent2} />
      <directionalLight position={[0, 5, 5]} intensity={0.6} />

      <Suspense fallback={<CoreFallback color={accent} color2={accent2} />}>
        <Stars radius={30} depth={20} count={1200} factor={2.2} saturation={0} fade speed={0.4} />
        <Sparkles count={80} scale={[8, 5, 5]} size={2} speed={0.4} color={accent} />

        <Helmet position={[0, 0.1, 0]} scale={1.1} />

        <EnergyRing position={[0, 0.1, 0]} color={accent} scale={1.35} />
        <EnergyRing position={[0, 0.1, 0]} color={accent2} scale={1.75} />

        <Holo position={[-2.6, 0.6, -0.6]} color={accent} args={[0.5, 0.9, 0.5]} />
        <Holo position={[2.6, -0.5, -0.4]} color={accent2} args={[0.7, 0.4, 0.6]} />
        <Icosa position={[2.0, 1.3, 0.2]} color={accent} />
        <Icosa position={[-2.0, -1.2, 0.4]} color={accent2} />

        <Environment preset="night" />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
