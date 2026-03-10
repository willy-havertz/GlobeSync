import { useEffect, useRef, memo } from "react";
import * as THREE from "three";

/* ── Material factory ─────────────────────────────────────────────────────── */
function neonMat(hex, intensity = 0.75) {
  return new THREE.MeshPhongMaterial({
    color: hex,
    emissive: hex,
    emissiveIntensity: intensity,
    shininess: 140,
    specular: 0xffffff,
  });
}

/* ── Letter builders (block geometry) ─────────────────────────────────────── */
function addBox(group, mat, w, h, d, x, y, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  group.add(m);
}

function buildC(mat) {
  const g = new THREE.Group();
  addBox(g, mat, 0.72, 0.18, 0.22, -0.04,  0.46); // top bar
  addBox(g, mat, 0.72, 0.18, 0.22, -0.04, -0.46); // bottom bar
  addBox(g, mat, 0.18, 0.76, 0.22, -0.41,  0.00); // left vert
  return g;
}

function buildS(mat) {
  const g = new THREE.Group();
  addBox(g, mat, 0.72, 0.18, 0.22,  0.00,  0.46); // top bar
  addBox(g, mat, 0.72, 0.18, 0.22,  0.00,  0.00); // mid bar
  addBox(g, mat, 0.72, 0.18, 0.22,  0.00, -0.46); // bot bar
  addBox(g, mat, 0.18, 0.28, 0.22,  0.27,  0.23); // top-right connector
  addBox(g, mat, 0.18, 0.28, 0.22, -0.27, -0.23); // bot-left connector
  return g;
}

function buildI(mat) {
  const g = new THREE.Group();
  addBox(g, mat, 0.56, 0.18, 0.22,  0.00,  0.46); // top serif
  addBox(g, mat, 0.56, 0.18, 0.22,  0.00, -0.46); // bot serif
  addBox(g, mat, 0.18, 0.76, 0.22,  0.00,  0.00); // vertical
  return g;
}

/* ── Hex-bolt decorations on the torus ring ───────────────────────────────── */
function addHexMarkers(scene, hexMat, r = 2.15, count = 6) {
  const geo = new THREE.CylinderGeometry(0.065, 0.065, 0.06, 6);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const m = new THREE.Mesh(geo, hexMat);
    m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    m.rotation.x = Math.PI / 2;
    scene.add(m);
  }
}

/* ── Main component ───────────────────────────────────────────────────────── */
function CsiLogo({ size = 220 }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    /* --- scene setup --- */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    /* --- lights --- */
    scene.add(new THREE.AmbientLight(0x001144, 2.5));

    const keyLight = new THREE.PointLight(0x00d4ff, 4.0, 20);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xa855f7, 2.8, 18);
    rimLight.position.set(-4, -2, 3);
    scene.add(rimLight);

    const orbitLight = new THREE.PointLight(0x00ffea, 3.2, 12);
    scene.add(orbitLight); // position updated in loop

    /* --- letter materials --- */
    const matC = neonMat(0x00d4ff);
    const matS = neonMat(0xa855f7);
    const matI = neonMat(0x00ffea);

    /* --- letter group --- */
    const letterGrp = new THREE.Group();
    const C = buildC(matC); C.position.x = -1.32;
    const S = buildS(matS); S.position.x =  0.00;
    const I = buildI(matI); I.position.x =  1.32;
    letterGrp.add(C, S, I);
    scene.add(letterGrp);

    /* --- edge glow lines on letters --- */
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.18 });
    letterGrp.children.forEach((ltr) => {
      ltr.children.forEach((mesh) => {
        const edges = new THREE.EdgesGeometry(mesh.geometry);
        const line  = new THREE.LineSegments(edges, edgeMat);
        mesh.add(line);
      });
    });

    /* --- outer torus ring --- */
    const torusMat1 = neonMat(0x00d4ff, 1.0);
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.028, 10, 110),
      torusMat1,
    );
    scene.add(ring1);

    /* --- inner tilted torus --- */
    const torusMat2 = neonMat(0xa855f7, 0.9);
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.82, 0.014, 8, 90),
      torusMat2,
    );
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);

    /* --- hex bolt markers on outer ring --- */
    addHexMarkers(scene, neonMat(0x00ffea, 1.2));

    /* --- wireframe icosahedron background --- */
    const icosa = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 0),
      new THREE.MeshBasicMaterial({
        color: 0x002244,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      }),
    );
    scene.add(icosa);

    /* --- scan line ring (thin flat torus) --- */
    const scanMat = neonMat(0x00ffea, 0.6);
    const scanRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.006, 4, 60),
      scanMat,
    );
    scene.add(scanRing);

    /* --- particle field --- */
    const PARTICLE_COUNT = 180;
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 2.4 + Math.random() * 1.0;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0x00d4ff,
        size: 0.038,
        transparent: true,
        opacity: 0.65,
      }),
    );
    scene.add(particles);

    /* --- animation loop --- */
    let t = 0;
    let raf;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.013;

      /* gentle letter sway */
      letterGrp.rotation.y = Math.sin(t * 0.38) * 0.32;
      letterGrp.rotation.x = Math.sin(t * 0.22) * 0.07;

      /* rings */
      ring1.rotation.z += 0.0038;
      ring2.rotation.y += 0.0055;
      scanRing.rotation.x = Math.sin(t * 0.6) * 0.4;
      scanRing.rotation.z += 0.009;

      /* wireframe */
      icosa.rotation.y += 0.0028;
      icosa.rotation.x += 0.0016;

      /* particles drift */
      particles.rotation.y -= 0.0025;
      particles.rotation.x  = Math.sin(t * 0.15) * 0.05;

      /* orbiting accent light */
      orbitLight.position.set(
        Math.cos(t * 0.72) * 3.8,
        Math.sin(t * 0.55) * 2.6,
        Math.sin(t * 0.82) * 3.2,
      );

      /* emissive pulse on letters */
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.7);
      matC.emissiveIntensity = 0.55 + pulse * 0.55;
      matS.emissiveIntensity = 0.45 + pulse * 0.45;
      matI.emissiveIntensity = 0.55 + pulse * 0.55;
      torusMat1.emissiveIntensity = 0.7 + pulse * 0.4;
      torusMat2.emissiveIntensity = 0.6 + pulse * 0.35;
      scanMat.emissiveIntensity   = 0.3 + pulse * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    /* cleanup */
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [size]);

  return (
    <div
      ref={wrapRef}
      style={{ width: size, height: size, display: "inline-block" }}
    />
  );
}

export default memo(CsiLogo);
