import React, { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Box, Sphere, Torus } from '@react-three/drei';

const RotatingModel = ({ color, shape = 'sphere', scale = 1 }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    ref.current.rotation.y = t * 0.3;
  });

  const Component = shape === 'box' ? Box : shape === 'torus' ? Torus : Sphere;
  const args = shape === 'torus' ? [1, 0.4, 16, 48] : shape === 'box' ? [1.2, 1.2, 1.2] : [1, 32, 32];

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <Component ref={ref} args={args} scale={scale}>
        <MeshDistortMaterial
          color={color}
          metalness={0.95}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          distort={0.2}
          speed={3}
          envMapIntensity={2}
        />
      </Component>
    </Float>
  );
};

const ProductLighting = () => (
  <>
    <ambientLight intensity={0.3} />
    <pointLight position={[5, 5, 5]} intensity={1} color="#FF6B35" />
    <pointLight position={[-5, -2, 3]} intensity={0.6} color="#4A90D9" />
    <pointLight position={[0, 5, -3]} intensity={0.4} color="#FFB088" />
    <spotLight position={[0, 8, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#ffffff" />
  </>
);

const ProductViewer = ({ color = '#FF6B35', shape = 'sphere', scale = 1.2 }) => {
  const [autoRotate, setAutoRotate] = useState(true);

  const handleInteraction = useCallback(() => {
    setAutoRotate(false);
    setTimeout(() => setAutoRotate(true), 3000);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, rgba(255,107,53,0.08) 0%, transparent 70%)',
        cursor: 'grab',
        position: 'relative',
      }}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ProductLighting />
        <RotatingModel color={color} shape={shape} scale={scale} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enableDamping
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  );
};

const ProductViewerSkeleton = () => (
  <div style={{
    width: '100%',
    height: '400px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div className="skeleton-pulse" style={{
      width: 120,
      height: 120,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)',
    }} />
  </div>
);

export { ProductViewer, ProductViewerSkeleton };
export default ProductViewer;
