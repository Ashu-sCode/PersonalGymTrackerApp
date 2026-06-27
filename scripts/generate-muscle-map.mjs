import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const outDir = path.resolve("public/models");
const outFile = path.join(outDir, "anatomical-muscle-map.glb");

const scene = new THREE.Scene();

const neutral = new THREE.MeshStandardMaterial({ color: "#2b3038", roughness: 0.72, metalness: 0.05 });
const muscle = new THREE.MeshStandardMaterial({ color: "#5f6874", roughness: 0.55, metalness: 0.08 });

function superEllipsoid(width, height, depth, options = {}) {
  const {
    segments = 24,
    rings = 18,
    topTaper = 0,
    bottomTaper = 0,
    waist = 0,
    skewX = 0,
    frontBias = 0,
    power = 0.78
  } = options;
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let iy = 0; iy <= rings; iy += 1) {
    const v = iy / rings;
    const phi = -Math.PI / 2 + v * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const yNorm = sinPhi;
    const taper = yNorm > 0 ? 1 - topTaper * yNorm : 1 + bottomTaper * yNorm;
    const waistPull = 1 - waist * (1 - Math.abs(yNorm));
    const ringScale = Math.pow(Math.max(0.001, cosPhi), power) * taper * waistPull;

    for (let ix = 0; ix <= segments; ix += 1) {
      const u = ix / segments;
      const theta = u * Math.PI * 2;
      const x = Math.cos(theta) * ringScale * width;
      const z = Math.sin(theta) * ringScale * depth + frontBias * (1 - Math.abs(yNorm));
      const y = yNorm * height + skewX * x;
      vertices.push(x, y, z);
      normals.push(x / width, y / height, z / depth);
      uvs.push(u, v);
    }
  }

  for (let iy = 0; iy < rings; iy += 1) {
    for (let ix = 0; ix < segments; ix += 1) {
      const a = iy * (segments + 1) + ix;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function addMesh(name, material, dims, position, rotation = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(superEllipsoid(...dims, options), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function pair(key, dims, x, y, z, rotation = [0, 0, 0], options = {}) {
  addMesh(`${key}_L`, muscle, dims, [-x, y, z], rotation, options);
  addMesh(`${key}_R`, muscle, dims, [x, y, z], [rotation[0], -rotation[1], -rotation[2]], options);
}

function neutralPair(key, dims, x, y, z, rotation = [0, 0, 0], options = {}) {
  addMesh(`${key}_L`, neutral, dims, [-x, y, z], rotation, options);
  addMesh(`${key}_R`, neutral, dims, [x, y, z], [rotation[0], -rotation[1], -rotation[2]], options);
}

addMesh("Body_Rib_Cage", neutral, [0.62, 0.78, 0.34], [0, 1.35, -0.03], [0, 0, 0], { topTaper: 0.12, bottomTaper: 0.38, waist: 0.12, frontBias: 0.05 });
addMesh("Body_Abdomen", neutral, [0.43, 0.55, 0.25], [0, 0.66, 0.02], [0, 0, 0], { topTaper: 0.06, bottomTaper: 0.24, waist: 0.2 });
addMesh("Body_Pelvis", neutral, [0.62, 0.33, 0.36], [0, 0.13, 0], [0, 0, 0], { topTaper: 0.26, bottomTaper: 0.08, waist: 0.04 });
addMesh("Body_Neck", neutral, [0.14, 0.22, 0.13], [0, 2.08, 0], [0, 0, 0], { topTaper: 0.08, bottomTaper: 0.1 });
addMesh("Body_Head", neutral, [0.25, 0.34, 0.23], [0, 2.48, 0.01], [0, 0, 0], { topTaper: 0.08, bottomTaper: 0.18 });

pair("Upper_Pectoralis", [0.28, 0.14, 0.075], 0.23, 1.63, 0.34, [-0.15, 0.06, 0.17], { topTaper: 0.18, bottomTaper: 0.08, waist: 0.12, frontBias: 0.02 });
pair("Middle_Pectoralis", [0.34, 0.17, 0.085], 0.25, 1.43, 0.38, [-0.06, 0.05, 0.06], { topTaper: 0.08, bottomTaper: 0.1, waist: 0.08, frontBias: 0.025 });
pair("Lower_Pectoralis", [0.28, 0.12, 0.07], 0.22, 1.24, 0.34, [0.08, 0.04, -0.08], { topTaper: 0.04, bottomTaper: 0.22, waist: 0.08 });

pair("Front_Deltoid", [0.18, 0.22, 0.11], 0.64, 1.66, 0.24, [0.05, -0.16, -0.38], { topTaper: 0.16, bottomTaper: 0.18, waist: 0.14 });
pair("Side_Deltoid", [0.21, 0.24, 0.16], 0.76, 1.69, 0.02, [0.02, 0, -0.18], { topTaper: 0.12, bottomTaper: 0.18, waist: 0.12 });
pair("Rear_Deltoid", [0.18, 0.2, 0.105], 0.66, 1.67, -0.24, [-0.03, 0.2, -0.24], { topTaper: 0.12, bottomTaper: 0.2, waist: 0.12 });

pair("Biceps_Long_Head", [0.09, 0.38, 0.07], 0.82, 1.13, 0.13, [0.03, -0.03, -0.18], { topTaper: 0.22, bottomTaper: 0.3, waist: 0.06 });
pair("Biceps_Short_Head", [0.075, 0.32, 0.062], 0.72, 1.11, 0.18, [0.02, -0.08, -0.16], { topTaper: 0.24, bottomTaper: 0.28, waist: 0.06 });
pair("Brachialis", [0.072, 0.28, 0.06], 0.9, 1.0, 0.02, [0.02, 0, -0.12], { topTaper: 0.22, bottomTaper: 0.28, waist: 0.06 });
pair("Triceps_Long_Head", [0.085, 0.38, 0.07], 0.77, 1.09, -0.15, [0.01, 0.06, -0.16], { topTaper: 0.24, bottomTaper: 0.32, waist: 0.08 });
pair("Triceps_Lateral_Head", [0.078, 0.31, 0.064], 0.89, 1.08, -0.08, [0, 0.03, -0.16], { topTaper: 0.2, bottomTaper: 0.3, waist: 0.07 });
pair("Triceps_Medial_Head", [0.064, 0.25, 0.054], 0.77, 0.9, -0.04, [0, 0.04, -0.12], { topTaper: 0.2, bottomTaper: 0.3, waist: 0.07 });
pair("Brachioradialis", [0.07, 0.34, 0.058], 0.91, 0.54, 0.1, [0.02, -0.08, -0.05], { topTaper: 0.2, bottomTaper: 0.38, waist: 0.06 });
pair("Forearm_Flexors", [0.075, 0.39, 0.06], 0.8, 0.48, 0.14, [0.02, -0.03, -0.05], { topTaper: 0.18, bottomTaper: 0.42, waist: 0.08 });
pair("Forearm_Extensors", [0.07, 0.38, 0.055], 0.94, 0.47, -0.02, [0.02, 0.04, -0.04], { topTaper: 0.2, bottomTaper: 0.42, waist: 0.08 });
neutralPair("Body_Hand", [0.095, 0.14, 0.052], 0.88, -0.02, 0.08, [0, 0, -0.04], { topTaper: 0.08, bottomTaper: 0.14 });

pair("Upper_Trapezius", [0.19, 0.24, 0.07], 0.27, 1.86, -0.28, [0.08, 0.18, -0.42], { topTaper: 0.1, bottomTaper: 0.18, waist: 0.12 });
pair("Middle_Trapezius", [0.24, 0.19, 0.065], 0.23, 1.53, -0.39, [0.05, 0.08, -0.2], { topTaper: 0.08, bottomTaper: 0.14, waist: 0.1 });
pair("Lower_Trapezius", [0.2, 0.3, 0.06], 0.17, 1.18, -0.36, [-0.12, 0.06, 0.18], { topTaper: 0.18, bottomTaper: 0.32, waist: 0.12 });
pair("Latissimus_Dorsi", [0.27, 0.48, 0.07], 0.37, 1.05, -0.35, [-0.05, 0.08, 0.18], { topTaper: 0.1, bottomTaper: 0.34, waist: 0.1 });
pair("Rhomboids", [0.17, 0.19, 0.055], 0.22, 1.49, -0.43, [0.04, 0.1, -0.32], { topTaper: 0.08, bottomTaper: 0.12, waist: 0.08 });
pair("Teres_Major", [0.13, 0.18, 0.055], 0.5, 1.42, -0.34, [0.03, 0.14, -0.36], { topTaper: 0.1, bottomTaper: 0.2, waist: 0.08 });
pair("Erector_Spinae", [0.08, 0.58, 0.055], 0.1, 0.88, -0.32, [0, 0.03, 0.03], { topTaper: 0.18, bottomTaper: 0.22, waist: 0.08 });

pair("Rectus_Abdominis", [0.12, 0.19, 0.055], 0.12, 0.92, 0.32, [0, 0, 0], { topTaper: 0.1, bottomTaper: 0.14, waist: 0.12 });
pair("External_Obliques", [0.13, 0.32, 0.055], 0.34, 0.84, 0.24, [0.02, -0.08, 0.22], { topTaper: 0.08, bottomTaper: 0.26, waist: 0.12 });
pair("Internal_Obliques", [0.105, 0.26, 0.045], 0.27, 0.62, 0.28, [0.03, -0.06, -0.16], { topTaper: 0.12, bottomTaper: 0.2, waist: 0.1 });
pair("Serratus_Anterior", [0.095, 0.22, 0.045], 0.47, 1.13, 0.24, [0.08, -0.18, 0.3], { topTaper: 0.1, bottomTaper: 0.18, waist: 0.1 });
addMesh("Transverse_Abdominis", muscle, [0.28, 0.27, 0.045], [0, 0.58, 0.31], [0, 0, 0], { topTaper: 0.14, bottomTaper: 0.18, waist: 0.2 });

pair("Gluteus_Maximus", [0.26, 0.29, 0.13], 0.25, 0.09, -0.31, [-0.08, 0.05, 0.04], { topTaper: 0.14, bottomTaper: 0.18, waist: 0.08, frontBias: -0.03 });
pair("Gluteus_Medius", [0.18, 0.18, 0.085], 0.38, 0.32, -0.21, [-0.05, 0.08, -0.2], { topTaper: 0.1, bottomTaper: 0.16, waist: 0.1 });
pair("Hip_Flexors", [0.115, 0.24, 0.055], 0.22, 0.22, 0.29, [0.08, -0.04, -0.1], { topTaper: 0.14, bottomTaper: 0.2, waist: 0.08 });
pair("Rectus_Femoris", [0.115, 0.55, 0.08], 0.24, -0.45, 0.18, [0.02, -0.02, -0.03], { topTaper: 0.16, bottomTaper: 0.32, waist: 0.08 });
pair("Vastus_Lateralis", [0.13, 0.52, 0.08], 0.39, -0.46, 0.06, [0.02, -0.02, -0.08], { topTaper: 0.14, bottomTaper: 0.32, waist: 0.08 });
pair("Vastus_Medialis", [0.1, 0.37, 0.07], 0.13, -0.54, 0.12, [0.02, -0.02, 0.08], { topTaper: 0.16, bottomTaper: 0.34, waist: 0.1 });
pair("Vastus_Intermedius", [0.1, 0.42, 0.055], 0.25, -0.47, 0.08, [0.01, -0.01, -0.02], { topTaper: 0.18, bottomTaper: 0.34, waist: 0.1 });
pair("Hamstrings", [0.13, 0.52, 0.085], 0.28, -0.5, -0.18, [-0.02, 0.02, 0.02], { topTaper: 0.14, bottomTaper: 0.34, waist: 0.08 });
pair("Adductors", [0.105, 0.42, 0.065], 0.12, -0.48, -0.02, [0.02, 0.02, 0.08], { topTaper: 0.16, bottomTaper: 0.32, waist: 0.08 });
pair("Abductors", [0.1, 0.38, 0.06], 0.47, -0.36, -0.03, [0.02, 0.02, -0.08], { topTaper: 0.16, bottomTaper: 0.3, waist: 0.08 });
pair("Gastrocnemius", [0.12, 0.37, 0.08], 0.29, -1.22, -0.12, [-0.03, 0.02, 0.02], { topTaper: 0.24, bottomTaper: 0.38, waist: 0.03 });
pair("Soleus", [0.095, 0.31, 0.062], 0.28, -1.47, -0.08, [-0.02, 0.01, 0.02], { topTaper: 0.2, bottomTaper: 0.42, waist: 0.06 });
pair("Tibialis_Anterior", [0.075, 0.43, 0.052], 0.24, -1.27, 0.13, [0.02, -0.01, 0], { topTaper: 0.22, bottomTaper: 0.42, waist: 0.08 });
neutralPair("Body_Foot", [0.16, 0.075, 0.28], 0.28, -1.83, 0.14, [0.08, 0, 0.02], { topTaper: 0.04, bottomTaper: 0.08 });

fs.mkdirSync(outDir, { recursive: true });

const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (result) => {
    const buffer = Buffer.from(result);
    fs.writeFileSync(outFile, buffer);
    console.log(`Wrote ${outFile} (${Math.round(buffer.byteLength / 1024)} KB)`);
  },
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
  { binary: true }
);
