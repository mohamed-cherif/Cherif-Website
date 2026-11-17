"use client";

// The WebGL part of the model viewer. Loaded lazily (no SSR) by ModelViewer.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getModel, type ModelMeta, type ModelView, type PartRole } from "@/data/models";

type Palette = Record<PartRole | "edge", string>;

const FOV = 28;
const FIT_DISTANCE = 1.12 / Math.sin(THREE.MathUtils.degToRad(FOV / 2));

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    structure: v("--part-structure", "#c4c7cc"),
    detail: v("--part-detail", "#8d939b"),
    actuator: v("--part-actuator", "#4b5159"),
    mechanism: v("--part-mechanism", "#ff5a1f"),
    reference: v("--part-reference", "#6b7480"),
    edge: v("--part-edge", "#0a0b0d"),
  };
}

function usePalette(): Palette | null {
  const [palette, setPalette] = useState<Palette | null>(null);
  useEffect(() => {
    const update = () => setPalette(readPalette());
    update();
    // next-themes flips a class on <html>; re-read the part colours when it does
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return palette;
}

interface PreparedPart {
  geometry: THREE.BufferGeometry;
  edges: THREE.BufferGeometry;
}

function usePreparedParts(src: string, edgeAngle: number): PreparedPart[] {
  const gltf = useGLTF(src, false, true);
  return useMemo(() => {
    const out: PreparedPart[] = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      // Positions arrive quantised (normalised int16 + a node transform).
      // Expand to floats in model space before baking the transform in.
      const src = mesh.geometry.getAttribute("position");
      const positions = new Float32Array(src.count * 3);
      const v = new THREE.Vector3();
      for (let i = 0; i < src.count; i++) {
        v.fromBufferAttribute(src, i).applyMatrix4(mesh.matrixWorld);
        positions[i * 3] = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
      }
      const base = new THREE.BufferGeometry();
      base.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      base.setIndex(mesh.geometry.getIndex());
      const geometry = toCreasedNormals(base, THREE.MathUtils.degToRad(40));
      const edges = new THREE.EdgesGeometry(base, edgeAngle);
      out.push({ geometry, edges });
    });
    return out;
  }, [gltf, edgeAngle]);
}

function Part({
  part,
  meta,
  center,
  view,
  palette,
  showLabel,
}: {
  part: PreparedPart;
  meta: ModelMeta["parts"][number];
  center: THREE.Vector3;
  view: ModelView;
  palette: Palette;
  showLabel: boolean;
}) {
  const offsetRef = useRef<THREE.Group>(null);
  const hingeRef = useRef<THREE.Group>(null);
  const fillRef = useRef<THREE.MeshStandardMaterial>(null);
  const lineRef = useRef<THREE.LineBasicMaterial>(null);

  const partCenter = useMemo(() => new THREE.Vector3(...meta.center), [meta]);
  const direction = useMemo(() => partCenter.clone().sub(center), [partCenter, center]);
  const pivotAt = useMemo(() => (meta.pivot ? new THREE.Vector3(...meta.pivot.at) : null), [meta]);
  const pivotAxis = useMemo(
    () => (meta.pivot ? new THREE.Vector3(...meta.pivot.axis).normalize() : null),
    [meta]
  );

  const slideAxis = useMemo(
    () => (meta.slide ? new THREE.Vector3(...meta.slide.axis).normalize() : null),
    [meta]
  );

  const highlighted = !view.highlight || view.highlight.includes(meta.name);
  const targetOpacity = highlighted ? 1 : 0.1;
  const state = useRef({ explode: 0, open: 0, opacity: 1 });

  useFrame((_, dt) => {
    const s = state.current;
    const k = 1 - Math.exp(-dt * 6);
    s.explode += ((view.explode ?? 0) - s.explode) * k;
    s.open += ((view.open ?? 0) - s.open) * k;
    s.opacity += (targetOpacity - s.opacity) * k;

    offsetRef.current?.position.copy(direction).multiplyScalar(s.explode * 0.9);
    if (offsetRef.current && slideAxis && meta.slide) {
      offsetRef.current.position.addScaledVector(slideAxis, meta.slide.mm * s.open);
    }
    if (hingeRef.current && pivotAxis && meta.pivot) {
      hingeRef.current.quaternion.setFromAxisAngle(pivotAxis, THREE.MathUtils.degToRad(meta.pivot.open * s.open));
    }
    if (fillRef.current) {
      fillRef.current.opacity = s.opacity;
      fillRef.current.transparent = s.opacity < 0.99;
      fillRef.current.depthWrite = s.opacity > 0.5;
    }
    if (lineRef.current) lineRef.current.opacity = 0.25 + 0.75 * s.opacity;
  });

  const body = (
    <>
      <mesh geometry={part.geometry}>
        <meshStandardMaterial
          ref={fillRef}
          color={palette[meta.role]}
          roughness={0.82}
          metalness={0.05}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <lineSegments geometry={part.edges}>
        <lineBasicMaterial ref={lineRef} color={palette.edge} transparent />
      </lineSegments>
    </>
  );

  return (
    <group ref={offsetRef}>
      {pivotAt ? (
        <group position={pivotAt}>
          <group ref={hingeRef}>
            <group position={pivotAt.clone().negate()}>{body}</group>
          </group>
        </group>
      ) : (
        body
      )}
      {showLabel && (
        <Html
          position={[partCenter.x, partCenter.y + (meta.size[1] / 2) * 0.6, partCenter.z]}
          center
          zIndexRange={[5, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "2px 6px",
              color: "var(--color-text)",
              background: "color-mix(in srgb, var(--color-bg) 82%, transparent)",
              borderLeft: "2px solid var(--color-accent)",
            }}
          >
            {meta.name}
          </span>
        </Html>
      )}
    </group>
  );
}

/** A model made of separate CAD parts: coloured by role, exploded and animated per view. */
function Parts({
  meta,
  center,
  view,
  palette,
  labels,
}: {
  meta: ModelMeta;
  center: THREE.Vector3;
  view: ModelView;
  palette: Palette;
  labels: boolean;
}) {
  const parts = usePreparedParts(meta.src, 28);
  return (
    <>
      {parts.map((part, i) =>
        meta.parts[i] ? (
          <Part
            key={meta.parts[i].name}
            part={part}
            meta={meta.parts[i]}
            center={center}
            view={view}
            palette={palette}
            showLabel={labels && !!view.highlight?.includes(meta.parts[i].name)}
          />
        ) : null
      )}
    </>
  );
}

/** A finished GLB (for example a PCB export) shown with its own materials. */
function RawModel({ src }: { src: string }) {
  const gltf = useGLTF(src, false, true);
  return <primitive object={gltf.scene} />;
}

function Reference({ id, palette, visible }: { id: string; palette: Palette; visible: boolean }) {
  const meta = getModel(id);
  const parts = usePreparedParts(meta.src, 55);
  const fill = useRef<THREE.MeshStandardMaterial>(null);
  const line = useRef<THREE.LineBasicMaterial>(null);
  const opacity = useRef(0);
  useFrame((_, dt) => {
    opacity.current += ((visible ? 1 : 0) - opacity.current) * (1 - Math.exp(-dt * 5));
    if (fill.current) fill.current.opacity = 0.16 * opacity.current;
    if (line.current) line.current.opacity = 0.35 * opacity.current;
  });
  return (
    <group>
      {parts.map((part, i) => (
        <group key={i}>
          <mesh geometry={part.geometry} renderOrder={-1}>
            <meshStandardMaterial ref={fill} color={palette.reference} transparent depthWrite={false} roughness={1} />
          </mesh>
          <lineSegments geometry={part.edges} renderOrder={-1}>
            <lineBasicMaterial ref={line} color={palette.reference} transparent depthWrite={false} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function Rig({
  view,
  spin,
  controlsRef,
}: {
  view: ModelView;
  spin: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const driving = useRef(true);
  const first = useRef(true);
  const target = useMemo(() => {
    const az = THREE.MathUtils.degToRad(view.az ?? 35);
    const el = THREE.MathUtils.degToRad(view.el ?? 20);
    const dist = FIT_DISTANCE / (view.zoom ?? 1);
    return { az, el, dist };
  }, [view.az, view.el, view.zoom]);

  // A new step takes the camera back; dragging hands control to the user.
  useEffect(() => {
    driving.current = true;
  }, [target]);
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const stop = () => (driving.current = false);
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  });

  const sphericalRef = useRef(new THREE.Spherical());
  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const spherical = sphericalRef.current;
    if (driving.current) {
      spherical.setFromVector3(camera.position);
      const phi = Math.PI / 2 - target.el;
      const k = first.current ? 1 : 1 - Math.exp(-dt * 4);
      first.current = false;
      // shortest way round for azimuth
      let dTheta = target.az - spherical.theta;
      dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
      spherical.theta += dTheta * k;
      spherical.phi += (phi - spherical.phi) * k;
      spherical.radius += (target.dist - spherical.radius) * k;
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
      if (Math.abs(dTheta) < 0.004 && Math.abs(phi - spherical.phi) < 0.004 && Math.abs(target.dist - spherical.radius) < 0.01) {
        driving.current = false;
      }
      controls.autoRotate = false;
    } else {
      controls.autoRotate = spin;
    }
    controls.update();
  });
  return null;
}

function Scene({
  modelId,
  referenceId,
  view,
  spin,
  labels,
  palette,
}: {
  modelId: string;
  referenceId?: string;
  view: ModelView;
  spin: boolean;
  labels: boolean;
  palette: Palette;
}) {
  const meta = getModel(modelId);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const { center, scale } = useMemo(() => {
    const min = new THREE.Vector3(...meta.min);
    const max = new THREE.Vector3(...meta.max);
    const c = min.clone().add(max).multiplyScalar(0.5);
    const radius = max.clone().sub(min).length() / 2;
    return { center: c, scale: 1 / radius };
  }, [meta]);

  return (
    <>
      <hemisphereLight args={["#ffffff", "#3a3d42", 1.15]} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, 2, -4]} intensity={0.55} />
      <group scale={scale}>
        <group position={center.clone().negate()}>
          {meta.raw ? (
            <RawModel src={meta.src} />
          ) : (
            <Parts meta={meta} center={center} view={view} palette={palette} labels={labels} />
          )}
          {referenceId && <Reference id={referenceId} palette={palette} visible={!!view.ghost} />}
        </group>
      </group>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        autoRotateSpeed={0.9}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI - 0.15}
      />
      <Rig view={view} spin={spin} controlsRef={controlsRef} />
    </>
  );
}

// Background tabs get no animation frames. With ?tick in the URL the scene is
// advanced from a timer instead, which is what the capture scripts use.
function Ticker() {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    const id = setInterval(() => advance(performance.now() / 1000), 40);
    return () => clearInterval(id);
  }, [advance]);
  return null;
}

export default function ModelCanvas({
  modelId,
  referenceId,
  view,
  spin = true,
  labels = true,
  active = true,
}: {
  modelId: string;
  referenceId?: string;
  view: ModelView;
  spin?: boolean;
  labels?: boolean;
  active?: boolean;
}) {
  const palette = usePalette();
  const [tick] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("tick"));
  if (!palette) return null;
  return (
    <Canvas
      frameloop={tick ? "never" : active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ fov: FOV, near: 0.05, far: 100, position: [3, 2, 6] }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      // let vertical swipes scroll the page on touch screens
      style={{ touchAction: "pan-y" }}
    >
      {tick && <Ticker />}
      <Scene
        key={modelId}
        modelId={modelId}
        referenceId={referenceId}
        view={view}
        spin={spin}
        labels={labels}
        palette={palette}
      />
    </Canvas>
  );
}
