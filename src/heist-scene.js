import * as T from "../assets/vendor/three.module.js";
import { BLOCKS, EXIT, VAULT } from "./heist-sim.js";

const COLORS = [0x7cecf4, 0xff83ab, 0xffd18e];
const UP = new T.Vector3(0, 1, 0);
export function createHeistScene(canvas) {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new T.Scene();
  scene.background = new T.Color(0x101627);
  scene.fog = new T.FogExp2(0x172139, 0.011);
  const camera = new T.PerspectiveCamera(44, 1, 0.1, 180);
  scene.add(new T.HemisphereLight(0xbacfff, 0x4b273d, 2));
  const sun = new T.DirectionalLight(0xffc294, 3.5);
  sun.position.set(-18, 28, 12);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, {
    left: -30,
    right: 30,
    top: 25,
    bottom: -25,
    near: 0.5,
    far: 90,
  });
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const rim = new T.DirectionalLight(0x82aaff, 2);
  rim.position.set(14, 14, -20);
  scene.add(rim);
  const mats = new Map(),
    geos = new Map();
  function material(color, metal = 0.15, rough = 0.65) {
    const key = `${color}/${metal}/${rough}`;
    if (!mats.has(key))
      mats.set(
        key,
        new T.MeshStandardMaterial({
          color,
          metalness: metal,
          roughness: rough,
        }),
      );
    return mats.get(key);
  }
  function glow(color) {
    const key = `glow${color}`;
    if (!mats.has(key))
      mats.set(key, new T.MeshBasicMaterial({ color, toneMapped: false }));
    return mats.get(key);
  }
  function geo(w, h, d) {
    const key = `${w}/${h}/${d}`;
    if (!geos.has(key)) geos.set(key, new T.BoxGeometry(w, h, d));
    return geos.get(key);
  }
  function box(parent, w, h, d, x, y, z, color, metal = 0.15, rough = 0.65) {
    const mesh = new T.Mesh(geo(w, h, d), material(color, metal, rough));
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(parent, r, h, x, y, z, color) {
    const mesh = new T.Mesh(
      new T.CylinderGeometry(r, r, h, 20),
      material(color, 0.45, 0.42),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function ring(parent, r, color, y = 0.06, width = 0.05) {
    const mesh = new T.Mesh(new T.TorusGeometry(r, width, 5, 48), glow(color));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    parent.add(mesh);
    return mesh;
  }
  function sign(parent, text, w, x, y, z, color = 0xff83ab) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#101625";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    ctx.font = "bold 68px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 70, 480);
    const texture = new T.CanvasTexture(c);
    texture.colorSpace = T.SRGBColorSpace;
    const mesh = new T.Mesh(
      new T.PlaneGeometry(w, w / 4),
      new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  // A texture painted in code: asphalt grain, no fetched or borrowed assets.
  const asphalt = document.createElement("canvas");
  asphalt.width = 128;
  asphalt.height = 128;
  const ac = asphalt.getContext("2d");
  ac.fillStyle = "#343e50";
  ac.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2100; i++) {
    const n = (i * 73) % 38;
    ac.fillStyle = `rgba(${100 + n},${110 + n},${125 + n},.13)`;
    ac.fillRect(
      (i * 37) % 128,
      (i * 89 + Math.floor(i / 128) * 11) % 128,
      1,
      1,
    );
  }
  const asphaltMap = new T.CanvasTexture(asphalt);
  asphaltMap.wrapS = asphaltMap.wrapT = T.RepeatWrapping;
  asphaltMap.repeat.set(14, 10);
  asphaltMap.colorSpace = T.SRGBColorSpace;
  const groundMat = new T.MeshPhysicalMaterial({
    color: 0x69788a,
    map: asphaltMap,
    roughness: 0.62,
    metalness: 0.15,
    clearcoat: 0.5,
    clearcoatRoughness: 0.35,
  });
  const ground = new T.Mesh(new T.BoxGeometry(80, 0.35, 68), groundMat);
  ground.position.y = -0.24;
  ground.receiveShadow = true;
  scene.add(ground);
  box(scene, 38, 0.12, 0.35, 0, -0.01, -12.5, 0x8a8e99);
  box(scene, 38, 0.12, 0.35, 0, -0.01, 12.5, 0x8a8e99);
  box(scene, 0.35, 0.12, 25, -18.5, -0.01, 0, 0x8a8e99);
  box(scene, 0.35, 0.12, 25, 18.5, -0.01, 0, 0x8a8e99);
  // Road stripes and drains extend the play space into a small city block.
  for (let x = -32; x < 35; x += 5) {
    box(scene, 2, 0.02, 0.12, x, 0.01, 16, 0xb7a78a);
    box(scene, 2, 0.02, 0.12, x, 0.01, -16, 0xb7a78a);
  }
  for (let i = 0; i < 8; i++)
    box(scene, 0.06, 0.025, 1.2, -17.8 + i * 0.17, 0.04, 10, 0x17202b);
  for (const b of BLOCKS) {
    box(scene, b.w, 1.55, b.d, b.x, 0.77, b.z, 0x364d5a, 0.5, 0.5);
    box(scene, b.w + 0.1, 0.12, b.d + 0.1, b.x, 1.6, b.z, 0x8c9b9e, 0.6, 0.4);
    for (let j = 0; j < 4; j++)
      box(
        scene,
        0.06,
        1.2,
        b.d + 0.04,
        b.x - b.w / 2 + 0.3 + (j * (b.w - 0.6)) / 3,
        0.77,
        b.z,
        0x162e39,
        0.5,
        0.4,
      );
    box(
      scene,
      b.w - 0.3,
      0.13,
      0.12,
      b.x,
      1.45,
      b.z + b.d / 2 + 0.03,
      0x57b5bb,
      0.2,
      0.5,
    );
  }
  // Original storefronts, roof equipment, windows and shallow balconies.
  const skyline = [
    [-25, -11, 8, 11, 8],
    [-25, 1, 7, 8, 8],
    [-25, 12, 8, 13, 7],
    [25, -10, 8, 14, 9],
    [25, 2, 7, 7, 8],
    [25, 12, 8, 11, 7],
    [-12, -23, 9, 9, 9],
    [0, -24, 9, 13, 9],
    [12, -23, 9, 8, 9],
  ];
  skyline.forEach(([x, z, w, h, d], i) => {
    const palette = [0x495269, 0x5a5264, 0x3e5362, 0x706475];
    box(scene, w, h, d, x, h / 2, z, palette[i % 4]);
    box(scene, w + 0.3, 0.25, d + 0.3, x, h + 0.05, z, 0x9b8a92);
    box(scene, w * 0.45, 0.8, d * 0.3, x + 0.6, h + 0.5, z, 0x35414d);
    for (let level = 2; level < h - 1; level += 2.1)
      for (let col = -w / 2 + 1; col < w / 2 - 0.4; col += 1.5) {
        const window = box(
          scene,
          0.9,
          1.1,
          0.035,
          x + col,
          level,
          z + d / 2 + 0.025,
          0x151f35,
          0.6,
          0.22,
        );
        if ((Math.floor(col * 3) + level + i) % 3 > 0)
          window.material = glow(i % 2 ? 0xcbb3ad : 0x84aabb);
      }
    box(scene, w, 0.2, 0.3, x, 2.7, z + d / 2 + 0.2, 0x89a1aa);
    if (i > 5)
      sign(
        scene,
        ["NIGHT SHIFT", "ECHO DISTRICT", "OPEN LATE"][i - 6],
        w - 0.4,
        x,
        3.3,
        z + d / 2 + 0.25,
        i % 2 ? 0x7cecf4 : 0xff83ab,
      );
  });
  function palm(x, z, height) {
    const trunk = cylinder(scene, 0.18, height, x, height / 2, z, 0x776759);
    trunk.rotation.z = 0.06;
    for (let i = 0; i < 7; i++) {
      const leaf = box(scene, 0.42, 0.08, 3, x, height, z, 0x325b56);
      leaf.rotation.y = (i * Math.PI * 2) / 7;
      leaf.rotation.x = 0.3;
      leaf.position.x += Math.sin(leaf.rotation.y) * 1.1;
      leaf.position.z += Math.cos(leaf.rotation.y) * 1.1;
    }
  }
  palm(-19, -10, 5.3);
  palm(19, -10, 5.8);
  palm(-20, 10, 4.7);
  palm(20, 10, 5.2);
  for (const x of [-18, 18]) {
    cylinder(scene, 0.09, 5, x, 2.5, -3, 0x515b6d);
    const lamp = box(scene, 0.6, 0.12, 1.5, x, 5, -2.5, 0xffd4a0);
    lamp.material = glow(0xffd4a0);
    const light = new T.PointLight(0xffa978, 25, 13, 2);
    light.position.set(x, 4.8, -2.5);
    scene.add(light);
  }
  // The getaway van is a real mesh with wheels, glass, lamps and a cargo body.
  function vehicle(x, z, color, van = false) {
    const g = new T.Group();
    scene.add(g);
    g.position.set(x, 0, z);
    box(
      g,
      2.2,
      van ? 1.6 : 0.65,
      van ? 4.2 : 3.8,
      0,
      van ? 1.2 : 0.85,
      0,
      color,
      0.65,
      0.3,
    );
    box(g, 1.9, 0.75, 1.6, 0, 1.35, van ? 0.7 : -0.2, 0x172c3d, 0.7, 0.13);
    for (const dx of [-1.1, 1.1])
      for (const dz of [-1.3, 1.3]) {
        const wheel = cylinder(g, 0.44, 0.28, dx, 0.44, dz, 0x111827);
        wheel.rotation.z = Math.PI / 2;
      }
    for (const dx of [-0.72, 0.72]) {
      const lamp = box(g, 0.4, 0.16, 0.08, dx, 0.9, 2.14, 0xffcaaa);
      lamp.material = glow(0xffcaaa);
    }
    return g;
  }
  vehicle(-22, 15, 0x8b5f76);
  vehicle(23, -16, 0x29596d);
  const van = vehicle(EXIT.x, 10.8, 0x305a58, true);
  sign(van, "GETAWAY", 1.8, 0, 2.13, 2.13, 0x8cffc3);
  const exitRing = ring(scene, 1.65, 0x678b81);
  exitRing.position.set(EXIT.x, 0.07, EXIT.z);
  // Static environment probe supplies metal/glass reflections without a remote HDRI.
  const probeTarget = new T.WebGLCubeRenderTarget(128, {
    type: T.HalfFloatType,
    generateMipmaps: true,
    minFilter: T.LinearMipmapLinearFilter,
  });
  const probe = new T.CubeCamera(0.1, 120, probeTarget);
  probe.position.set(0, 4, 0);
  probe.update(renderer, scene);
  const pmrem = new T.PMREMGenerator(renderer);
  const environment = pmrem.fromCubemap(probeTarget.texture);
  scene.environment = environment.texture;
  pmrem.dispose();
  probeTarget.dispose();
  function actor(color, label) {
    const g = new T.Group();
    scene.add(g);
    const root = new T.Group();
    g.add(root);
    box(root, 0.65, 0.78, 0.4, 0, 1.15, 0, 0x172a3c, 0.3, 0.55);
    box(root, 0.68, 0.16, 0.44, 0, 1.4, 0.02, color);
    const head = new T.Mesh(
      new T.SphereGeometry(0.27, 16, 12),
      material(0x647b8a, 0.6, 0.28),
    );
    head.scale.set(1, 1.1, 1);
    head.position.y = 1.83;
    head.castShadow = true;
    root.add(head);
    const visor = box(
      root,
      0.43,
      0.15,
      0.08,
      0,
      1.85,
      0.25,
      0x0c1c2e,
      0.7,
      0.1,
    );
    visor.material = glow(color);
    const limbs = [];
    for (const side of [-1, 1]) {
      const leg = new T.Group();
      leg.position.set(side * 0.19, 0.81, 0);
      root.add(leg);
      box(leg, 0.23, 0.66, 0.28, 0, -0.32, 0, 0x24354b);
      box(leg, 0.26, 0.15, 0.4, 0, -0.67, 0.06, 0x111927);
      limbs.push(leg);
      const arm = new T.Group();
      arm.position.set(side * 0.47, 1.42, 0);
      root.add(arm);
      box(arm, 0.2, 0.66, 0.22, 0, -0.29, 0, 0x35526a);
      box(arm, 0.22, 0.14, 0.25, 0, -0.58, 0.03, color);
      limbs.push(arm);
    }
    const halo = ring(g, 0.55, color, 0.08, 0.025);
    sign(g, label, 1.4, 0, 2.45, 0, color);
    return { g, root, limbs, halo, previous: { x: 0, z: 0 } };
  }
  const actors = [
    actor(COLORS[0], "YOU"),
    actor(COLORS[1], "ECHO 01"),
    actor(COLORS[2], "ECHO 02"),
  ];
  const cellMeshes = Array.from({ length: 10 }, () => {
    const mesh = new T.Mesh(
      new T.OctahedronGeometry(0.34),
      new T.MeshStandardMaterial({
        color: 0xc1fbff,
        emissive: 0x2fd6eb,
        emissiveIntensity: 1.1,
        metalness: 0.4,
        roughness: 0.25,
      }),
    );
    scene.add(mesh);
    return mesh;
  });
  const relayMeshes = [-4, 4].map((x) => {
    const g = new T.Group();
    g.position.set(x, 0, 0);
    scene.add(g);
    cylinder(g, 0.9, 0.3, 0, 0.15, 0, 0x344455);
    const pillar = box(g, 0.65, 1.4, 0.65, 0, 1, 0, 0x59697c, 0.6, 0.3);
    const shield = new T.Mesh(
      new T.CylinderGeometry(0.86, 0.86, 1.8, 16, 1, true),
      new T.MeshBasicMaterial({
        color: COLORS[1],
        transparent: true,
        opacity: 0.18,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    shield.position.y = 1.1;
    g.add(shield);
    const rim = ring(g, 1.05, COLORS[1], 0.05);
    return { g, pillar, shield, rim };
  });
  const vault = new T.Group();
  vault.position.set(VAULT.x, 0, VAULT.z);
  scene.add(vault);
  sign(vault, "VAULT", 2.2, 0, 2.4, 0, COLORS[2]);
  cylinder(vault, 1.35, 0.65, 0, 0.35, 0, 0x425064);
  const goldRing = ring(vault, 1.5, COLORS[2], 0.08, 0.065);
  const lid = new T.Group();
  lid.position.set(0, 0.73, -1.15);
  vault.add(lid);
  cylinder(lid, 1.2, 0.2, 0, 0, 1.15, 0x8a8490);
  ring(lid, 0.8, COLORS[2], 0.12).position.z = 1.15;
  box(lid, 1.4, 0.07, 0.13, 0, 0.15, 1.15, 0xc2a378);
  box(lid, 0.13, 0.07, 1.4, 0, 0.15, 1.15, 0xc2a378);
  const treasure = box(vault, 0.7, 0.38, 0.7, 0, 0.75, 0, COLORS[2], 0.8, 0.22);
  treasure.visible = false;
  const beamMaterial = COLORS.map(
    (c) =>
      new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.75 }),
  );
  const beams = [1, 2, 2].map((i) => {
    const mesh = new T.Mesh(
      new T.CylinderGeometry(0.035, 0.035, 1, 6),
      beamMaterial[i],
    );
    scene.add(mesh);
    return mesh;
  });
  const triangleGeo = new T.BufferGeometry();
  triangleGeo.setAttribute(
    "position",
    new T.BufferAttribute(new Float32Array(9), 3),
  );
  const triangle = new T.Mesh(
    triangleGeo,
    new T.MeshBasicMaterial({
      color: COLORS[2],
      transparent: true,
      opacity: 0.09,
      side: T.DoubleSide,
      depthWrite: false,
    }),
  );
  scene.add(triangle);
  const drones = Array.from({ length: 3 }, () => {
    const g = new T.Group();
    scene.add(g);
    const body = cylinder(g, 0.5, 0.25, 0, 0, 0, 0x3d4e64);
    body.rotation.z = 0.08;
    const rotors = [];
    for (const dx of [-0.55, 0.55])
      for (const dz of [-0.45, 0.45]) {
        const rotor = box(g, 0.75, 0.03, 0.1, dx, 0.15, dz, 0x8f9baa, 0.7, 0.4);
        rotors.push(rotor);
      }
    const eye = box(g, 0.2, 0.12, 0.06, 0, -0.1, 0.46, 0xff695b);
    eye.material = glow(0xff695b);
    const warning = ring(scene, 0.9, 0xff765b, 0.05, 0.04);
    warning.visible = false;
    const line = new T.Line(
      new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]),
      new T.LineBasicMaterial({
        color: 0xff765b,
        transparent: true,
        opacity: 0.45,
      }),
    );
    scene.add(line);
    return { g, rotors, warning, line };
  });
  const bulletGeometry = new T.SphereGeometry(0.16, 8, 6),
    bulletMaterial = glow(0xff665e);
  const bullets = Array.from({ length: 30 }, () => {
    const b = new T.Mesh(bulletGeometry, bulletMaterial);
    scene.add(b);
    b.visible = false;
    return b;
  });
  const particles = [],
    rings = [];
  let lastTotal = -1,
    vaultTime = null,
    finishTime = null;
  function burst(e, time) {
    const color =
      e.type === "cell"
        ? COLORS[0]
        : e.type === "relay"
          ? COLORS[1]
          : e.type === "damage"
            ? 0xff655c
            : COLORS[2];
    const count = e.type === "vault" ? 26 : 7;
    for (let i = 0; i < count; i++) {
      const mesh = new T.Mesh(
        geo(0.09, 0.09, 0.09),
        new T.MeshBasicMaterial({ color, transparent: true }),
      );
      scene.add(mesh);
      particles.push({
        mesh,
        start: time,
        x: e.x,
        z: e.z,
        vx: Math.sin(i * 2.4) * 3,
        vz: Math.cos(i * 2.4) * 3,
        vy: 2 + (i % 3),
        life: e.type === "vault" ? 1.1 : 0.45,
      });
    }
    if (["vault", "relay", "damage"].includes(e.type)) {
      const mesh = ring(scene, 1, color, 0.1, 0.05);
      mesh.position.set(e.x, 0.1, e.z);
      rings.push({
        mesh,
        start: time,
        life: e.type === "vault" ? 1.2 : 0.45,
        max: e.type === "vault" ? 20 : 3,
      });
    }
  }
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const zoom = Math.max(1, 1.35 / camera.aspect);
    camera.position.set(0, 32 * zoom, 33 * zoom);
    camera.lookAt(0, 0, -1);
    camera.updateProjectionMatrix();
  }
  function render(s, time, effects = true, events = s.events) {
    if (s.total === 0 && lastTotal > 0) {
      vaultTime = null;
      finishTime = null;
    }
    if (lastTotal !== s.total) {
      if (effects)
        for (const event of events)
          if (["cell", "relay", "vault", "damage", "dash"].includes(event.type))
            burst(event, time);
      lastTotal = s.total;
    }
    const crew = [s.player, ...s.ghosts];
    actors.forEach((a, i) => {
      a.g.visible = !!crew[i] && !(i === 0 && s.outcome === "escaped");
      if (!crew[i]) return;
      const p = crew[i],
        moving = !!p.moving;
      a.g.position.set(p.x, 0, p.z);
      a.root.rotation.y = p.heading;
      a.root.rotation.x = p.dash > 0 ? 0.2 : 0;
      const walk = moving ? Math.sin(s.total * 0.33) * 0.55 : 0;
      a.limbs.forEach(
        (limb, j) =>
          (limb.rotation.x = (j < 2 ? 1 : -1) * (j % 2 ? 1 : -1) * walk),
      );
      a.g.visible =
        a.g.visible &&
        !(
          effects &&
          i === 0 &&
          s.player.invulnerable > 0 &&
          Math.floor(s.total / 6) % 2 === 0
        );
      a.previous = { x: p.x, z: p.z };
    });
    cellMeshes.forEach((mesh, i) => {
      const cell = s.cells[i];
      mesh.visible = !cell.taken;
      mesh.position.set(
        cell.x,
        0.7 + (effects ? Math.sin(time * 2.4 + i) * 0.1 : 0),
        cell.z,
      );
      mesh.rotation.y = effects ? time * 0.6 : 0;
    });
    relayMeshes.forEach((r, i) => {
      const relay = s.relays[i];
      r.shield.visible = !relay.open;
      r.pillar.rotation.z = relay.open ? 0.95 : 0;
      r.rim.material = glow(relay.open ? 0x71949a : COLORS[1]);
      r.shield.material.opacity = 0.12 + (relay.charge / 18) * 0.3;
    });
    if (s.vaultOpen && vaultTime === null) vaultTime = time;
    lid.rotation.x = s.vaultOpen
      ? -Math.min(1, (time - vaultTime) * 2) * 1.5
      : 0;
    treasure.visible = s.vaultOpen;
    goldRing.material = glow(s.vaultOpen ? 0x89ffba : COLORS[2]);
    exitRing.material = glow(s.exitOpen ? 0x89ffba : 0x506b6b);
    if (s.outcome === "escaped" && finishTime === null) finishTime = time;
    van.position.x =
      EXIT.x +
      (finishTime !== null && effects
        ? Math.min(12, (time - finishTime) * 8)
        : 0);
    [
      [0, 1],
      [0, 2],
      [1, 2],
    ].forEach(([i, j], k) => {
      const beam = beams[k];
      beam.visible = !!crew[j];
      if (!beam.visible) return;
      const from = new T.Vector3(crew[i].x, 0.7, crew[i].z),
        to = new T.Vector3(crew[j].x, 0.7, crew[j].z),
        direction = to.clone().sub(from);
      beam.position.copy(from).add(to).multiplyScalar(0.5);
      beam.scale.set(1, direction.length(), 1);
      beam.quaternion.setFromUnitVectors(UP, direction.normalize());
    });
    triangle.visible = crew.length === 3;
    if (triangle.visible) {
      const pos = triangle.geometry.attributes.position;
      crew.forEach((p, i) => pos.setXYZ(i, p.x, 0.08, p.z));
      pos.needsUpdate = true;
      triangle.geometry.computeBoundingSphere();
    }
    drones.forEach((mesh, i) => {
      const d = s.drones[i];
      mesh.g.position.set(
        d.x,
        2.7 + (effects ? Math.sin(time * 2 + i) * 0.08 : 0),
        d.z,
      );
      mesh.g.rotation.z = d.stun > 0 ? 0.25 : 0;
      mesh.rotors.forEach(
        (rotor) => (rotor.rotation.y = effects ? time * 32 : 0),
      );
      mesh.warning.visible = !!d.aim && d.stun === 0;
      mesh.line.visible = mesh.warning.visible;
      if (d.aim) {
        mesh.warning.position.set(d.aim.x, 0.07, d.aim.z);
        mesh.warning.scale.setScalar(0.6 + ((60 - d.windup) / 60) * 0.7);
        mesh.line.geometry.setFromPoints([
          new T.Vector3(d.x, 2.7, d.z),
          new T.Vector3(d.aim.x, 0.1, d.aim.z),
        ]);
      }
    });
    bullets.forEach((b, i) => {
      b.visible = !!s.shots[i];
      if (b.visible) b.position.set(s.shots[i].x, 0.8, s.shots[i].z);
    });
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i],
        age = time - p.start;
      if (age > p.life || !effects) {
        scene.remove(p.mesh);
        p.mesh.material.dispose();
        particles.splice(i, 1);
        continue;
      }
      p.mesh.position.set(
        p.x + p.vx * age,
        0.5 + p.vy * age - 3 * age * age,
        p.z + p.vz * age,
      );
      p.mesh.material.opacity = 1 - age / p.life;
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i],
        f = (time - r.start) / r.life;
      if (f > 1 || !effects) {
        scene.remove(r.mesh);
        r.mesh.geometry.dispose();
        rings.splice(i, 1);
        continue;
      }
      r.mesh.scale.setScalar(1 + f * r.max);
    }
    renderer.render(scene, camera);
  }
  function setQuality(effects) {
    renderer.shadowMap.enabled = effects;
    renderer.setPixelRatio(
      Math.min(devicePixelRatio || 1, effects ? 1.75 : 1.25),
    );
    resize();
  }
  resize();
  return { render, resize, setQuality, renderer };
}
