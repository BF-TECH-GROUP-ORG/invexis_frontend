/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

const AntigravityInner = ({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = '#FF9FFC',
  autoAnimate = false,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = 'capsule',
  fieldStrength = 10
}) => {
  const meshRef = useRef(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });

  // P0: t, P1: speed, P2: mx, P3: my, P4: mz, P5: cx, P6: cy, P7: cz, P8: randomRadiusOffset
  const STRIDE = 9;
  const particleData = useMemo(() => {
    const data = new Float32Array(count * STRIDE);
    const width = viewport.width || 100;
    const height = viewport.height || 100;

    for (let i = 0; i < count; i++) {
      const idx = i * STRIDE;
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 20;

      data[idx + 0] = Math.random() * 100; // t
      data[idx + 1] = 0.01 + Math.random() / 200; // speed
      data[idx + 2] = x; // mx
      data[idx + 3] = y; // my
      data[idx + 4] = z; // mz
      data[idx + 5] = x; // cx
      data[idx + 6] = y; // cy
      data[idx + 7] = z; // cz
      data[idx + 8] = (Math.random() - 0.5) * 2; // randomRadiusOffset
    }
    return data;
  }, [count, viewport.width, viewport.height]);

  useFrame(state => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { viewport: v, pointer: m } = state;
    const now = Date.now();

    const mouseDistSq = Math.pow(m.x - lastMousePos.current.x, 2) + Math.pow(m.y - lastMousePos.current.y, 2);

    if (mouseDistSq > 0.000001) {
      lastMouseMoveTime.current = now;
      lastMousePos.current = { x: m.x, y: m.y };
    }

    let destX = (m.x * v.width) * 0.5;
    let destY = (m.y * v.height) * 0.5;

    if (autoAnimate && now - lastMouseMoveTime.current > 2000) {
      const time = state.clock.getElapsedTime();
      destX = Math.sin(time * 0.5) * (v.width * 0.25);
      destY = Math.cos(time * 0.5 * 2) * (v.height * 0.25);
    }

    virtualMouse.current.x += (destX - virtualMouse.current.x) * 0.05;
    virtualMouse.current.y += (destY - virtualMouse.current.y) * 0.05;

    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;
    const time = state.clock.getElapsedTime();
    const globalRotation = time * rotationSpeed;
    const magnetRadiusSq = magnetRadius * magnetRadius;
    const fieldDeviationFactor = 5 / (fieldStrength + 0.1);

    for (let i = 0; i < count; i++) {
      const idx = i * STRIDE;

      let t = particleData[idx + 0] += particleData[idx + 1] * 0.5;
      const mx = particleData[idx + 2];
      const my = particleData[idx + 3];
      const mz = particleData[idx + 4];
      const cz = particleData[idx + 7];
      const randomRadiusOffset = particleData[idx + 8];

      const projectionFactor = 1 - cz * 0.02; // cz / 50
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const distSq = dx * dx + dy * dy;

      let tx = mx;
      let ty = my;
      let tz = mz * depthFactor;

      if (distSq < magnetRadiusSq) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const deviation = randomRadiusOffset * fieldDeviationFactor;
        const r = ringRadius + wave + deviation;

        tx = projectedTargetX + r * Math.cos(angle);
        ty = projectedTargetY + r * Math.sin(angle);
        tz = mz * depthFactor + Math.sin(t) * waveAmplitude * depthFactor;
      }

      particleData[idx + 5] += (tx - particleData[idx + 5]) * lerpSpeed;
      particleData[idx + 6] += (ty - particleData[idx + 6]) * lerpSpeed;
      particleData[idx + 7] += (tz - particleData[idx + 7]) * lerpSpeed;

      const cx = particleData[idx + 5];
      const cy = particleData[idx + 6];
      const curCz = particleData[idx + 7];

      dummy.position.set(cx, cy, curCz);
      dummy.lookAt(projectedTargetX, projectedTargetY, curCz);
      dummy.rotateX(Math.PI * 0.5);

      const dx2 = cx - projectedTargetX;
      const dy2 = cy - projectedTargetY;
      const currentDistToMouse = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      const distFromRing = Math.abs(currentDistToMouse - ringRadius);
      const scaleFactor = Math.max(0, Math.min(1, 1 - distFromRing * 0.1));
      const finalScale = scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize;

      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={true}>
      {particleShape === 'capsule' && <capsuleGeometry args={[0.1, 0.4, 4, 8]} />}
      {particleShape === 'sphere' && <sphereGeometry args={[0.2, 16, 16]} />}
      {particleShape === 'box' && <boxGeometry args={[0.3, 0.3, 0.3]} />}
      {particleShape === 'tetrahedron' && <tetrahedronGeometry args={[0.3]} />}
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </instancedMesh>
  );
};

const Antigravity = ({ count = 500, ...props }) => {
  return (
    <Canvas
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: true
      }}
      dpr={[1, 1.5]} // Limit DPR for performance
      camera={{ position: [0, 0, 50], fov: 35 }}
    >
      <AntigravityInner count={count} {...props} />
    </Canvas>
  );
};

export default Antigravity;
