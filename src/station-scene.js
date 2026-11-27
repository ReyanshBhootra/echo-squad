import * as T from "../assets/vendor/three.module.js";
import { BLOCKS, EXIT, VAULT } from "./heist-sim.js";
import { escapeRoute } from "./heist-guide.js";
import { cameraMovement, cameraPosition } from "./station-camera.js";
import { interpolatePose, footPose, legJoints } from "./station-motion.js";

const PALETTE = [0x65e8e1, 0xf695b9, 0xffc967];
const UP = new T.Vector3(0, 1, 0);

export function createStationScene(canvas) {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new T.Scene();
  scene.background = new T.Color(0x080f1c);
  scene.fog = new T.Fog(0x101e32, 28, 85);
  const camera = new T.PerspectiveCamera(57, 1, 0.08, 140);
  let yaw = 0,
    overview = false,
    live = false,
    quiet = false;
  scene.add(new T.HemisphereLight(0xd9f3ff, 0x344458, 2.5));
  const key = new T.DirectionalLight(0xf0f7ff, 3.2);
  key.position.set(-10, 25, 12);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {
    left: -24,
    right: 24,
    top: 20,
    bottom: -20,
    near: 0.1,
    far: 65,
  });
  key.shadow.normalBias = 0.035;
  scene.add(key);
  const rim = new T.DirectionalLight(0x8ed7ff, 1.8);
  rim.position.set(10, 10, -15);
  scene.add(rim);
  const mats = new Map();
  function mat(color, metalness = 0.15, roughness = 0.55) {
    const id = `${color}/${metalness}/${roughness}`;
    if (!mats.has(id))
      mats.set(id, new T.MeshStandardMaterial({ color, metalness, roughness }));
    return mats.get(id);
  }
  function glow(color) {
    const id = `e${color}`;
    if (!mats.has(id))
      mats.set(id, new T.MeshBasicMaterial({ color, toneMapped: false }));
    return mats.get(id);
  }
  function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function box(parent, w, h, d, x, y, z, color, emissive = false) {
    return mesh(
      parent,
      new T.BoxGeometry(w, h, d),
      emissive ? glow(color) : mat(color),
      x,
      y,
      z,
    );
  }
  function sphere(parent, rx, ry, rz, x, y, z, color, material) {
    const m = mesh(
      parent,
      new T.SphereGeometry(1, 24, 16),
      material || mat(color, 0.2, 0.3),
      x,
      y,
      z,
    );
    m.scale.set(rx, ry, rz);
    return m;
  }
  function cylinder(parent, r, h, x, y, z, color) {
    return mesh(
      parent,
      new T.CylinderGeometry(r, r, h, 24),
      mat(color, 0.5, 0.4),
      x,
      y,
      z,
    );
  }
  function ring(parent, r, color, y = 0.04, width = 0.035) {
    const m = mesh(
      parent,
      new T.TorusGeometry(r, width, 6, 48),
      glow(color),
      0,
      y,
      0,
    );
    m.rotation.x = -Math.PI / 2;
    return m;
  }
  const labels = [];
  function label(parent, text, width, x, y, z, color = 0xd6eeff) {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 768, 128);
    ctx.fillStyle = "#091521";
    ctx.fillRect(0, 0, 768, 128);
    ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText(text, 384, 68, 730);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    const m = mesh(
      parent,
      new T.PlaneGeometry(width, width / 6),
      new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide }),
      x,
      y,
      z,
    );
    labels.push(m);
    return m;
  }
  // A real enclosed deck with windowed bulkheads, no downloaded art.
  box(scene, 39, 0.5, 27, 0, -0.28, 0, 0x253e50);
  for (let x = -18; x < 18; x += 3)
    for (let z = -12; z < 12; z += 3) {
      box(
        scene,
        2.96,
        0.035,
        2.96,
        x + 1.5,
        0.005,
        z + 1.5,
        ((x + z) / 3) % 2 ? 0x344e60 : 0x3e596b,
      );
    }
  // Floor districts are open circulation zones. Collision cargo matches the sim.
  const zones = [
    [-10, -6, 10, 9, 0x315d6c, "NAVIGATION"],
    [10, -6, 10, 9, 0x4f4968, "COMMS"],
    [-10, 5, 10, 7, 0x395e58, "LIFE SUPPORT"],
    [10, 6, 10, 6, 0x695b3e, "AIRLOCK"],
  ];
  for (const [x, z, w, d, color, name] of zones) {
    box(scene, w, 0.025, d, x, 0.04, z, color);
    for (const side of [-1, 1])
      box(scene, w, 0.025, 0.07, x, 0.06, z + (side * d) / 2, 0xa6b6a8);
    const g = new T.Group();
    g.position.set(x, 0.075, z);
    scene.add(g);
    const floor = label(g, name, w * 0.8, 0, 0, 0, 0xb6d3dc);
    floor.rotation.x = -Math.PI / 2;
  }
  for (const x of [-18.9, 18.9]) {
    box(scene, 0.8, 1.2, 26, x, 0.6, 0, 0x203344);
    box(scene, 0.8, 0.4, 26, x, 5.8, 0, 0x526777);
    for (let z = -12; z <= 12; z += 4) {
      box(scene, 1, 6, 0.45, x, 3, z, 0x415a6c);
      box(
        scene,
        0.07,
        0.08,
        3.35,
        x - Math.sign(x) * 0.44,
        1.3,
        z + 1.9,
        0x68c6d7,
        true,
      );
    }
    // Glass windows are translucent, open onto the generated star field.
    const glass = new T.MeshPhysicalMaterial({
      color: 0x3b91b5,
      transparent: true,
      opacity: 0.14,
      metalness: 0.3,
      roughness: 0.08,
      depthWrite: false,
      side: T.DoubleSide,
    });
    mesh(
      scene,
      new T.BoxGeometry(0.04, 4.2, 24),
      glass,
      x - Math.sign(x) * 0.42,
      3.4,
      0,
    );
  }
  for (const z of [-12.9, 12.9]) {
    box(scene, 38, 6, 0.7, 0, 3, z, 0x23394c);
    box(scene, 37, 0.12, 0.15, 0, 5.2, z - Math.sign(z) * 0.4, 0x9adce7, true);
    for (let x = -18; x <= 18; x += 6) {
      box(scene, 0.5, 6, 1, x, 3, z, 0x4c6275);
      box(
        scene,
        3.5,
        2.7,
        0.12,
        x + 2.5,
        2.9,
        z - Math.sign(z) * 0.4,
        0x132535,
      );
      box(
        scene,
        2.7,
        0.035,
        0.15,
        x + 2.5,
        2,
        z - Math.sign(z) * 0.5,
        0x45828c,
        true,
      );
    }
  }
  // High overhead ribs suggest a ceiling while keeping the planning view open.
  for (const x of [-12, 0, 12]) {
    box(scene, 0.4, 0.45, 25, x, 6.8, 0, 0x4f6b7e);
    for (const z of [-7, 0, 7])
      box(scene, 3, 0.1, 0.55, x, 6.52, z, 0xc5e7ea, true);
  }
  const starGeo = new T.BufferGeometry();
  const stars = [];
  for (let i = 0; i < 420; i++) {
    const a = i * 2.399963,
      rad = 48 + (i % 19);
    stars.push(Math.cos(a) * rad, 6 + ((i * 43) % 47), Math.sin(a) * rad);
  }
  starGeo.setAttribute("position", new T.Float32BufferAttribute(stars, 3));
  scene.add(
    new T.Points(
      starGeo,
      new T.PointsMaterial({
        color: 0xbadfff,
        size: 0.13,
        sizeAttenuation: true,
      }),
    ),
  );
  const planet = sphere(scene, 9, 9, 9, -37, 16, -35, 0x315b83);
  const halo = ring(scene, 14, 0x668ca6);
  halo.position.copy(planet.position);
  halo.rotation.set(0.6, 0.2, 0.25);
  label(scene, "ECHO / ORBITAL RECOVERY", 11, 0, 4.6, -12.45, 0xc6eee7);
  // Cargo pods use the exact four collision volumes from the simulation.
  for (const b of BLOCKS) {
    box(scene, b.w, 1.9, b.d, b.x, 0.95, b.z, 0x344b61);
    box(scene, b.w + 0.04, 0.16, b.d + 0.04, b.x, 1.95, b.z, 0x8097a7);
    for (const side of [-1, 1]) {
      box(
        scene,
        0.15,
        1.7,
        b.d + 0.06,
        b.x + side * (b.w / 2 - 0.3),
        1,
        b.z,
        0x253647,
      );
      box(
        scene,
        0.22,
        0.3,
        0.04,
        b.x + side * 0.65,
        1.2,
        b.z + b.d / 2 + 0.03,
        0xffc967,
        true,
      );
    }
  }
  // Wall-mounted task consoles lie outside the playable collision boundary.
  for (const x of [-11, -6, 6, 11]) {
    box(scene, 2.4, 1.3, 0.7, x, 0.7, -12.1, 0x526d80);
    const screen = box(scene, 1.9, 0.85, 0.06, x, 1.65, -11.8, 0x5dd5c5, true);
    screen.rotation.x = -0.22;
    for (let j = 0; j < 4; j++)
      box(scene, 0.23, 0.08, 0.08, x - 0.6 + j * 0.4, 1.7, -11.72, 0x163c45);
  }
  function crew(color, name) {
    const g = new T.Group();
    scene.add(g);
    const body = new T.Group();
    g.add(body);
    const upper = new T.Group();
    body.add(upper);
    // Original salvage suit: tapered torso, split visor, two side seals and tank.
    sphere(upper, 0.53, 0.75, 0.4, 0, 1.08, 0, color);
    sphere(upper, 0.48, 0.45, 0.42, 0, 1.61, 0, color);
    const visorMat = new T.MeshPhysicalMaterial({
      color: 0xa8e8ff,
      metalness: 0.65,
      roughness: 0.12,
      clearcoat: 1,
    });
    sphere(upper, 0.4, 0.23, 0.15, 0, 1.65, 0.36, 0, visorMat);
    box(upper, 0.035, 0.38, 0.09, 0, 1.65, 0.5, 0x1c3349);
    sphere(
      upper,
      0.16,
      0.07,
      0.045,
      -0.16,
      1.74,
      0.49,
      0xf0ffff,
      glow(0xe9ffff),
    );
    box(upper, 0.66, 0.69, 0.4, 0, 1.19, -0.42, 0x31485a);
    for (const side of [-1, 1]) {
      cylinder(upper, 0.12, 0.55, side * 0.24, 1.2, -0.65, 0xc0d8dd);
      sphere(upper, 0.12, 0.12, 0.12, side * 0.53, 1.6, 0, 0x172c40);
    }
    const limbs = [];
    for (const side of [-1, 1]) {
      const leg = new T.Group();
      leg.position.x = side * 0.28;
      body.add(leg);
      const thigh = mesh(
        leg,
        new T.CapsuleGeometry(0.17, 0.2, 6, 12),
        mat(color, 0.2, 0.4),
      );
      const shin = mesh(
        leg,
        new T.CapsuleGeometry(0.145, 0.2, 6, 12),
        mat(color, 0.2, 0.4),
      );
      const knee = sphere(leg, 0.18, 0.18, 0.18, 0, 0.42, 0, 0x314a5e);
      const boot = sphere(leg, 0.24, 0.14, 0.32, 0, 0.14, 0.07, 0x203648);
      limbs.push({ thigh, shin, knee, boot });
    }
    const band = ring(g, 0.68, color);
    const tag = label(g, name, 1.3, 0, 2.4, 0, color);
    return {
      g,
      body,
      upper,
      limbs,
      band,
      tag,
      last: null,
      distance: 0,
      landing: 0,
      airborne: false,
    };
  }
  const actors = PALETTE.map((c, i) =>
    crew(c, ["YOU", "ECHO 01", "ECHO 02"][i]),
  );
  const cells = Array.from({ length: 10 }, () => {
    const g = new T.Group();
    scene.add(g);
    box(g, 0.55, 0.8, 0.1, 0, 0, 0, 0x70dae8);
    box(g, 0.36, 0.25, 0.04, 0, 0.16, 0.08, 0xe0ffff, true);
    box(g, 0.25, 0.05, 0.04, 0, -0.2, 0.08, 0x183e57);
    const r = ring(g, 0.65, 0x70eaff, -0.75);
    return { g, r };
  });
  const loot = Array.from({ length: 8 }, () => {
    const g = new T.Group();
    scene.add(g);
    cylinder(g, 0.4, 0.5, 0, 0.35, 0, 0x518f66);
    box(g, 0.55, 0.12, 0.55, 0, 0.65, 0, 0xb0f3a3, true);
    box(g, 0.13, 0.25, 0.05, 0, 0.39, 0.4, 0xe7ffb9, true);
    ring(g, 0.7, 0x9df4a1);
    return g;
  });
  const relays = [-4, 4].map((x, i) => {
    const g = new T.Group();
    g.position.set(x, 0, 0);
    scene.add(g);
    cylinder(g, 0.8, 0.3, 0, 0.15, 0, 0x40576c);
    box(g, 0.6, 1.8, 0.6, 0, 1.1, 0, 0x667f97);
    sphere(g, 0.4, 0.4, 0.4, 0, 2.2, 0, 0xf48fb6, glow(0xf48fb6));
    const shield = mesh(
      g,
      new T.CylinderGeometry(0.8, 0.8, 2.5, 32, 1, true),
      new T.MeshBasicMaterial({
        color: 0xff8bb7,
        transparent: true,
        opacity: 0.2,
        side: T.DoubleSide,
        depthWrite: false,
      }),
      0,
      1.3,
      0,
    );
    ring(g, 1, 0xff8bb7);
    label(g, i ? "COMMS / B" : "POWER / A", 2.7, 0, 3, 0, 0xffb1ce);
    return { g, shield };
  });
  const vault = new T.Group();
  vault.position.set(VAULT.x, 0, VAULT.z);
  scene.add(vault);
  cylinder(vault, 1.35, 0.7, 0, 0.35, 0, 0x4e677c);
  ring(vault, 1.5, 0xffc967);
  const core = sphere(
    vault,
    0.6,
    0.85,
    0.6,
    0,
    1.4,
    0,
    0xffc967,
    glow(0xffc967),
  );
  const coreShield = mesh(
    vault,
    new T.CylinderGeometry(0.95, 0.95, 1.6, 24, 1, true),
    new T.MeshBasicMaterial({
      color: 0x9edcdb,
      transparent: true,
      opacity: 0.17,
      side: T.DoubleSide,
      depthWrite: false,
    }),
    0,
    1.4,
    0,
  );
  label(vault, "REACTOR VAULT", 3.7, 0, 3.2, 0, 0xffdc90);
  const extraction = new T.Group();
  extraction.position.set(EXIT.x, 0, EXIT.z);
  scene.add(extraction);
  ring(extraction, 1.7, 0x91b5a7);
  box(extraction, 3.4, 0.15, 3.4, 0, 0.05, 0, 0x4b6970);
  const exitGlow = ring(extraction, 1.4, 0x7b8f8d, 0.16, 0.07);
  for (const side of [-1, 1]) {
    box(extraction, 0.3, 3.5, 0.4, side * 1.7, 1.8, 1.1, 0x8ca5ad);
    box(extraction, 0.07, 2.8, 0.1, side * 1.51, 1.8, 0.85, 0x88eacb, true);
  }
  box(extraction, 3.6, 0.35, 0.5, 0, 3.55, 1.1, 0x77959f);
  const doors = [-1, 1].map((side) =>
    box(extraction, 1.5, 3.2, 0.18, side * 0.77, 1.8, 1.16, 0x3d666b),
  );
  label(extraction, "EXTRACTION", 3.5, 0, 4.2, 1.1, 0xadf4d2);
  const droneMeshes = Array.from({ length: 5 }, () => {
    const g = new T.Group();
    scene.add(g);
    sphere(g, 0.6, 0.32, 0.45, 0, 0, 0, 0x574d67);
    sphere(g, 0.2, 0.13, 0.1, 0, 0, 0.42, 0xff776e, glow(0xff776e));
    for (const side of [-1, 1])
      box(g, 0.55, 0.09, 0.35, side * 0.7, 0, 0, 0x97a9c3);
    const warning = ring(scene, 0.85, 0xff836a);
    warning.visible = false;
    return { g, warning };
  });
  const shotMeshes = Array.from({ length: 30 }, () =>
    sphere(scene, 0.15, 0.15, 0.15, 0, 0, 0, 0xff886b, glow(0xff886b)),
  );
  const beams = Array.from({ length: 3 }, () =>
    mesh(scene, new T.CylinderGeometry(0.045, 0.045, 1, 6), glow(0xf4b8d3)),
  );
  const triangleGeo = new T.BufferGeometry();
  triangleGeo.setAttribute(
    "position",
    new T.BufferAttribute(new Float32Array(9), 3),
  );
  const triangle = mesh(
    scene,
    triangleGeo,
    new T.MeshBasicMaterial({
      color: 0xffdb91,
      transparent: true,
      opacity: 0.1,
      side: T.DoubleSide,
      depthWrite: false,
    }),
  );
  const routeGeo = new T.BufferGeometry();
  routeGeo.setAttribute(
    "position",
    new T.BufferAttribute(new Float32Array(54), 3),
  );
  const route = new T.Line(
    routeGeo,
    new T.LineBasicMaterial({ color: 0xacff9b }),
  );
  route.frustumCulled = false;
  scene.add(route);
  const beacons = [-16, 16].map((x) => {
    const m = sphere(
      scene,
      0.16,
      0.22,
      0.16,
      x,
      3.8,
      7,
      0x6c443e,
      glow(0x6c443e),
    );
    const light = new T.PointLight(0xff755b, 0, 12);
    light.position.copy(m.position);
    scene.add(light);
    return { m, light };
  });
  const targetLight = new T.PointLight(0xffd798, 12, 9);
  targetLight.position.set(0, 3, -2);
  scene.add(targetLight);
  function resize() {
    const w = canvas.clientWidth || innerWidth,
      h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  let lastFrame = 0;
  function render(s, time, effects = true, events = [], motion = {}) {
    const dt = lastFrame ? Math.min(0.05, Math.max(0, time - lastFrame)) : 0;
    lastFrame = time;
    const crew = [s.player, ...s.ghosts].map((p, i) =>
      interpolatePose(motion.previous?.[i], p, motion.alpha ?? 1),
    );
    actors.forEach((a, i) => {
      const p = crew[i];
      a.g.visible = !!p;
      if (!p) return;
      const distance = a.last ? Math.hypot(p.x - a.last.x, p.z - a.last.z) : 0;
      if (distance < 2) a.distance += distance;
      const moving = !!p.moving,
        airborne = (p.y || 0) > 0.001;
      if (a.airborne && !airborne) a.landing = 0.1;
      a.landing = Math.max(0, a.landing - dt * 0.55);
      a.airborne = airborne;
      a.g.position.set(p.x, 0.08 + (p.y || 0), p.z);
      const turn = Math.atan2(
        Math.sin(p.heading - a.body.rotation.y),
        Math.cos(p.heading - a.body.rotation.y),
      );
      a.body.rotation.y += Math.max(-18 * dt, Math.min(18 * dt, turn));
      a.upper.position.y = -a.landing;
      a.limbs.forEach((l, j) => {
        const foot = footPose(a.distance, j, moving, airborne),
          pose = legJoints(foot, 0.84 - a.landing);
        for (const [bone, from, to] of [
          [l.thigh, pose.hip, pose.knee],
          [l.shin, pose.knee, pose.ankle],
        ]) {
          const v = new T.Vector3(0, to.y - from.y, to.z - from.z);
          bone.position.set(0, (from.y + to.y) / 2, (from.z + to.z) / 2);
          bone.scale.y = v.length() / 0.54;
          bone.quaternion.setFromUnitVectors(UP, v.normalize());
        }
        l.knee.position.set(0, pose.knee.y, pose.knee.z);
        l.boot.position.set(0, pose.ankle.y, pose.ankle.z + 0.07);
      });
      const overlaps =
        i > 0 && Math.hypot(p.x - crew[0].x, p.z - crew[0].z) < 0.85;
      a.body.visible = !overlaps;
      a.band.visible = i > 0 || overview;
      a.tag.visible = (i > 0 || overview) && !overlaps;
      a.last = { x: p.x, z: p.z };
    });
    cells.forEach(({ g }, i) => {
      const c = s.cells[i];
      g.visible = !!c && !c.taken;
      if (!c) return;
      g.position.set(
        c.x,
        0.85 + (effects ? Math.sin(time * 2 + i) * 0.08 : 0),
        c.z,
      );
      g.rotation.y = effects ? time * 0.5 : 0;
    });
    loot.forEach((g, i) => {
      const p = s.loot[i];
      g.visible = !!p && !p.taken;
      if (p) g.position.set(p.x, 0, p.z);
    });
    relays.forEach((r, i) => {
      r.shield.visible = !s.relays[i].open;
      r.shield.material.opacity = 0.15 + s.relays[i].charge / 60;
    });
    coreShield.visible = !s.vaultOpen;
    core.scale.y = s.vaultOpen ? 1.3 : 0.85;
    core.position.y = 1.4 + (effects ? Math.sin(time) * 0.12 : 0);
    exitGlow.material = glow(s.exitOpen ? 0xa2ffc4 : 0x526d70);
    doors.forEach((d, i) => {
      d.position.x = (i ? 1 : -1) * (s.exitOpen ? 2.3 : 0.77);
    });
    const alarm = s.escapeDeadline !== null && !s.done;
    beacons.forEach(({ m, light }) => {
      m.material = glow(alarm ? 0xff805e : 0x6c443e);
      light.intensity = alarm ? 18 : 0;
    });
    droneMeshes.forEach((m, i) => {
      const d = s.drones[i];
      m.g.visible = !!d;
      m.warning.visible = false;
      if (!d) return;
      m.g.position.set(
        d.x,
        2.8 + (effects ? Math.sin(time * 2 + i) * 0.08 : 0),
        d.z,
      );
      m.warning.visible = !!d.aim && !s.done && !d.stun;
      if (d.aim) m.warning.position.set(d.aim.x, 0.09, d.aim.z);
    });
    shotMeshes.forEach((m, i) => {
      const p = s.shots[i];
      m.visible = !!p;
      if (p) m.position.set(p.x, 0.8, p.z);
    });
    [
      [0, 1],
      [0, 2],
      [1, 2],
    ].forEach(([i, j], k) => {
      const m = beams[k];
      m.visible = !!crew[j];
      if (!m.visible) return;
      const a = new T.Vector3(crew[i].x, 0.9, crew[i].z),
        b = new T.Vector3(crew[j].x, 0.9, crew[j].z),
        d = b.clone().sub(a);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.scale.y = d.length();
      m.quaternion.setFromUnitVectors(UP, d.normalize());
    });
    triangle.visible = crew.length === 3;
    if (triangle.visible) {
      crew.forEach((p, i) =>
        triangleGeo.attributes.position.setXYZ(i, p.x, 0.09, p.z),
      );
      triangleGeo.attributes.position.needsUpdate = true;
      triangleGeo.computeBoundingSphere();
    }
    route.visible = alarm;
    if (alarm) {
      const p = escapeRoute(s.player);
      p.forEach((q, i) =>
        routeGeo.attributes.position.setXYZ(i, q.x, 0.17, q.z),
      );
      routeGeo.attributes.position.needsUpdate = true;
      routeGeo.setDrawRange(0, p.length);
    }
    const raised = overview || !live;
    if (raised) {
      camera.fov = 44;
      const narrow = Math.max(0, 1.5 - camera.aspect);
      camera.position.set(0, 30 + narrow * 15, 29 + narrow * 15);
      camera.lookAt(live ? s.player.x * 0.15 : 0, 0, 0);
    } else {
      camera.fov = 57;
      const p = cameraPosition(crew[0], yaw);
      camera.position.set(p.x, p.y, p.z);
      camera.lookAt(p.target.x, p.target.y, p.target.z);
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    labels.forEach((m) => {
      if (
        m.parent === actors[0].g ||
        m.parent === actors[1].g ||
        m.parent === actors[2].g
      )
        m.quaternion.copy(camera.quaternion);
    });
    renderer.render(scene, camera);
  }
  function project(x, z, y = 1.7) {
    const p = new T.Vector3(x, y, z).project(camera),
      r = canvas.getBoundingClientRect();
    return {
      x: r.left + ((p.x + 1) * r.width) / 2,
      y: r.top + ((1 - p.y) * r.height) / 2,
      visible: p.z > -1 && p.z < 1 && Math.abs(p.x) < 1 && Math.abs(p.y) < 1,
    };
  }
  function setQuality(effects) {
    quiet = !effects;
    renderer.shadowMap.enabled = effects;
    renderer.setPixelRatio(
      Math.min(devicePixelRatio || 1, effects ? 1.75 : 1.25),
    );
    resize();
  }
  resize();
  return {
    render,
    resize,
    project,
    setQuality,
    renderer,
    movement: (x, z) => cameraMovement(x, z, yaw, overview),
    turnCamera: (delta) => {
      yaw += Math.max(-0.35, Math.min(0.35, delta));
    },
    setOverview: (value) => {
      overview = value;
    },
    setLive: (value) => {
      live = value;
    },
    resetCamera: () => {
      yaw = 0;
    },
    getOverview: () => overview,
    bearing: (target, player) => {
      const relative =
        Math.atan2(target.x - player.x, -(target.z - player.z)) + yaw;
      const angle = Math.atan2(Math.sin(relative), Math.cos(relative));
      return Math.abs(angle) > 2.35
        ? "BEHIND YOU"
        : angle > 0.35
          ? "TURN RIGHT"
          : angle < -0.35
            ? "TURN LEFT"
            : "AHEAD";
    },
  };
}
