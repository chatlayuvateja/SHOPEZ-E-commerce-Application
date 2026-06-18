import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

const FloatingObject = ({ position, scale, color, shape, speed, distort }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * speed * 0.3;
    ref.current.rotation.y = t * speed * 0.5;
    ref.current.position.y += Math.sin(t * speed + position[0]) * 0.002;
  });

  const Component = shape === 'box' ? Box : shape === 'torus' ? Torus : Sphere;

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.5}>
      <Component ref={ref} position={position} scale={scale} args={shape === 'torus' ? [1, 0.4, 16, 32] : [1, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          envMapIntensity={1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          metalness={0.9}
          roughness={0.1}
          distort={distort || 0.3}
          speed={2}
        />
      </Component>
    </Float>
  );
};

const Particles = ({ count = 200 }) => {
  const ref = useRef();
  const { viewport } = useThree();
  const vw = viewport.width;
  const vh = viewport.height;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#FF6B35'),
      new THREE.Color('#FF8F65'),
      new THREE.Color('#FFB088'),
      new THREE.Color('#4A90D9'),
      new THREE.Color('#7EB8F0'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * vw * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * vh * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const c = palette[Math.floor(Math.random() * palette.length)];
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return [pos, cols];
  }, [count, vw, vh]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors sizeAttenuation transparent opacity={0.8} />
    </points>
  );
};

const Rings = () => {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.3;
    ref.current.rotation.y = clock.getElapsedTime() * 0.05;
    ref.current.rotation.z = Math.cos(clock.getElapsedTime() * 0.08) * 0.2;
  });

  return (
    <group ref={ref}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Torus
          key={i}
          args={[2.5 + i * 0.6, 0.02, 16, 64]}
          position={[0, 0, 0]}
          rotation={[Math.PI / 3 + i * 0.4, Math.PI / 4 + i * 0.3, 0]}
        >
          <meshPhysicalMaterial
            color={`hsl(${20 + i * 12}, 100%, ${60 + i * 5}%)`}
            transparent
            opacity={0.3 - i * 0.05}
            metalness={0.8}
            roughness={0.2}
            wireframe
          />
        </Torus>
      ))}
    </group>
  );
};

const HeroScene = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#FF6B35" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4A90D9" />
        <pointLight position={[0, 5, -5]} intensity={0.5} color="#FFB088" />
        <Rings />
        <Particles count={120} />
        <FloatingObject position={[-3.5, 1.5, -2]} scale={0.8} color="#FF6B35" shape="sphere" speed={0.3} distort={0.4} />
        <FloatingObject position={[3.8, -1.2, -3]} scale={0.6} color="#4A90D9" shape="box" speed={0.4} distort={0.2} />
        <FloatingObject position={[2.5, 2.5, -4]} scale={0.5} color="#FF8F65" shape="torus" speed={0.5} distort={0.3} />
        <FloatingObject position={[-2.8, -2.3, -3.5]} scale={0.7} color="#7EB8F0" shape="sphere" speed={0.25} distort={0.35} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
