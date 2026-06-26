import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { heatColor } from "../algorithms/muscleScores";
import type { MuscleGroup, MuscleScore } from "../types";

const muscleGroups: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Calves"];

type GroupSummary = {
  group: MuscleGroup;
  score: number;
  recovery: MuscleScore["recoveryStatus"];
  items: MuscleScore[];
};

const groupLabels: Record<MuscleGroup, string> = {
  Chest: "Pectorals",
  Back: "Lats / upper back",
  Shoulders: "Delts",
  Arms: "Arms",
  Core: "Core",
  Legs: "Quads / glutes",
  Calves: "Calves"
};

function summaryToScore(summary?: GroupSummary): MuscleScore | undefined {
  if (!summary) return undefined;
  return {
    muscleId: summary.group,
    muscleName: summary.items[0]?.muscleName ?? "Shoulders",
    groupName: summary.group,
    volumeScore: summary.score,
    frequencyScore: 0,
    finalScore: summary.score,
    recoveryPenalty: 0,
    recoveryStatus: summary.recovery
  };
}

function material(color: string, opacity = 0.94) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.46,
    metalness: 0.08,
    transparent: opacity < 1,
    opacity
  });
}

function capsule(name: MuscleGroup | "Neutral", radius: number, depth: number, color: string) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, depth, 18, 28), material(color));
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(name: MuscleGroup | "Neutral", radius: number, color: string, scale: [number, number, number] = [1, 1, 1]) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), material(color));
  mesh.name = name;
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function box(name: MuscleGroup | "Neutral", size: [number, number, number], color: string) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size, 4, 4, 4), material(color));
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addSymmetric(parent: THREE.Group, meshFactory: () => THREE.Mesh, x: number, y: number, z: number, rotation: [number, number, number] = [0, 0, 0]) {
  const left = meshFactory();
  left.position.set(-x, y, z);
  left.rotation.set(...rotation);
  parent.add(left);

  const right = meshFactory();
  right.position.set(x, y, z);
  right.rotation.set(rotation[0], -rotation[1], -rotation[2]);
  parent.add(right);
}

function buildBody(colors: Record<MuscleGroup, string>) {
  const body = new THREE.Group();
  const neutral = "#5f6673";
  const dark = "#20242c";

  const head = sphere("Neutral", 0.26, "#8a9099", [0.9, 1.08, 0.86]);
  head.position.y = 2.55;
  body.add(head);

  const neck = capsule("Neutral", 0.12, 0.16, neutral);
  neck.position.y = 2.23;
  body.add(neck);

  const ribcage = sphere("Neutral", 0.78, dark, [0.86, 1.08, 0.5]);
  ribcage.position.y = 1.45;
  body.add(ribcage);

  const pelvis = sphere("Neutral", 0.58, dark, [0.9, 0.48, 0.55]);
  pelvis.position.y = 0.45;
  body.add(pelvis);

  addSymmetric(body, () => sphere("Chest", 0.34, colors.Chest, [1.16, 0.72, 0.38]), 0.28, 1.72, 0.38, [0.08, 0.08, 0.05]);
  addSymmetric(body, () => capsule("Back", 0.22, 0.82, colors.Back), 0.34, 1.45, -0.36, [0.1, 0, 0.08]);
  addSymmetric(body, () => sphere("Shoulders", 0.26, colors.Shoulders, [1.18, 0.84, 0.82]), 0.78, 1.86, 0.03, [0.05, 0, 0.2]);

  const abs = box("Core", [0.48, 0.78, 0.16], colors.Core);
  abs.position.set(0, 0.94, 0.46);
  body.add(abs);
  addSymmetric(body, () => box("Core", [0.16, 0.66, 0.12], colors.Core), 0.28, 0.95, 0.4, [0, 0.04, 0.08]);

  addSymmetric(body, () => capsule("Arms", 0.14, 0.74, colors.Arms), 0.94, 1.22, 0.02, [0.08, 0.03, -0.22]);
  addSymmetric(body, () => capsule("Arms", 0.12, 0.58, colors.Arms), 1.06, 0.55, 0.04, [0.05, 0.02, -0.06]);
  addSymmetric(body, () => sphere("Arms", 0.13, colors.Arms, [0.9, 1.15, 0.8]), 1.08, 0.12, 0.05);

  addSymmetric(body, () => capsule("Legs", 0.22, 0.9, colors.Legs), 0.3, -0.24, 0.12, [0.02, 0.02, -0.04]);
  addSymmetric(body, () => capsule("Legs", 0.2, 0.78, colors.Legs), 0.3, -0.96, -0.02, [-0.05, 0, 0.03]);
  addSymmetric(body, () => capsule("Calves", 0.15, 0.62, colors.Calves), 0.31, -1.54, -0.08, [-0.08, 0, 0.02]);
  addSymmetric(body, () => box("Neutral", [0.42, 0.12, 0.72], neutral), 0.31, -1.98, 0.1, [0, 0, 0]);

  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(2.35, 4.85, 1.15)),
    new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.04 })
  );
  outline.position.y = 0.24;
  body.add(outline);

  return body;
}

export function MuscleHeatmap({ scores }: { scores: MuscleScore[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bodyRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const [selected, setSelected] = useState<MuscleGroup>("Chest");

  const grouped = useMemo<GroupSummary[]>(() => {
    return muscleGroups.map((group) => {
      const items = scores.filter((score) => score.groupName === group);
      const total = items.reduce((sum, item) => sum + item.finalScore, 0);
      const recovery = items.some((item) => item.recoveryStatus === "Fatigued") ? "Fatigued" : items[0]?.recoveryStatus ?? "Ready";
      return { group, score: total, recovery, items };
    });
  }, [scores]);

  const colorByGroup = useMemo(() => {
    return muscleGroups.reduce<Record<MuscleGroup, string>>((acc, group) => {
      acc[group] = heatColor(summaryToScore(grouped.find((item) => item.group === group)));
      return acc;
    }, {} as Record<MuscleGroup, string>);
  }, [grouped]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#08090b", 5, 9);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.55, 6.3);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const keyLight = new THREE.DirectionalLight("#ffffff", 3.2);
    keyLight.position.set(2.8, 4.2, 4.8);
    keyLight.castShadow = true;
    scene.add(keyLight);
    scene.add(new THREE.HemisphereLight("#b6ff4d", "#16181f", 1.2));

    const rim = new THREE.DirectionalLight("#ff5b4a", 1.3);
    rim.position.set(-3.5, 1.4, -3);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1.75, 64),
      new THREE.MeshBasicMaterial({ color: "#b6ff4d", transparent: true, opacity: 0.08 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.08;
    scene.add(floor);

    const body = buildBody(colorByGroup);
    body.position.y = -0.08;
    bodyRef.current = body;
    scene.add(body);

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const width = Math.max(280, rect?.width ?? 420);
      const height = Math.max(420, rect?.height ?? 560);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const hit = raycasterRef.current.intersectObjects(body.children, true).find((item) => muscleGroups.includes(item.object.name as MuscleGroup));
      canvas.style.cursor = hit ? "pointer" : "default";
    };

    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const hit = raycasterRef.current.intersectObjects(body.children, true).find((item) => muscleGroups.includes(item.object.name as MuscleGroup));
      if (hit) setSelected(hit.object.name as MuscleGroup);
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", resize);
    resize();

    let frame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      body.rotation.y = Math.sin(t * 0.32) * 0.38;
      body.position.y = -0.08 + Math.sin(t * 1.15) * 0.025;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
          else object.material.dispose();
        }
      });
    };
  }, [colorByGroup]);

  const details = scores.filter((score) => score.groupName === selected);
  const selectedSummary = grouped.find((item) => item.group === selected);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(320px,480px)_1fr]">
      <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_18%,rgba(182,255,77,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-3">
        <canvas ref={canvasRef} className="h-[520px] w-full touch-none" aria-label="Animated 3D muscle heatmap" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-white/10 bg-iron-950/70 px-3 py-2 backdrop-blur">
          <p className="text-xs uppercase text-zinc-400">Selected</p>
          <p className="font-bold text-volt-500">{groupLabels[selected]}</p>
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 grid grid-cols-5 gap-2 text-[11px] text-zinc-400">
          {[
            ["#3f3f46", "None"],
            ["#bef264", "Low"],
            ["#84cc16", "Good"],
            ["#3f6212", "High"],
            ["#ef4444", "Fatigued"]
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {muscleGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelected(group)}
              className={`rounded-md px-3 py-2 text-sm transition ${selected === group ? "bg-volt-500 text-iron-950" : "bg-white/8 text-zinc-200 hover:bg-white/12"}`}
            >
              {group}
            </button>
          ))}
        </div>
        <div className="mb-5 rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-zinc-400">{groupLabels[selected]}</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-black">{selected}</h2>
            <span className="rounded-md px-3 py-1 text-sm font-bold text-iron-950" style={{ backgroundColor: colorByGroup[selected] }}>
              {selectedSummary?.recovery ?? "Ready"}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">Score {Math.round(selectedSummary?.score ?? 0)}</p>
        </div>
        <div className="space-y-3">
          {details.length === 0 ? (
            <p className="text-zinc-400">No training recorded for this group yet.</p>
          ) : (
            details.map((score) => (
              <div key={score.muscleId}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{score.muscleName}</span>
                  <span className="text-zinc-400">{score.recoveryStatus}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(100, score.finalScore / 25)}%`, backgroundColor: heatColor(score) }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
