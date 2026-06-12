"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * WebGL hover distortion for photo cards marked with [data-distort].
 *
 * RAM-conscious by design: ONE renderer for the whole site, created lazily
 * on the first hover, whose canvas is re-parented into whichever card is
 * hovered (a <canvas> keeps its GL context when moved in the DOM). The
 * photo is uploaded as a texture on enter and disposed on leave, so at
 * most one card-sized texture lives on the GPU at any time. The rAF loop
 * only runs while the effect is visible.
 */

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uProg;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uCover;

vec2 cover(vec2 uv) {
  return (uv - 0.5) * uCover + 0.5;
}

void main() {
  vec2 uv = vUv;
  float p = uProg;

  // liquid wave
  uv.y += sin(uv.x * 6.2831 + uTime * 2.2) * 0.018 * p;
  uv.x += sin(uv.y * 9.0 + uTime * 1.7) * 0.012 * p;
  // slight zoom-in
  uv = (uv - 0.5) * (1.0 - 0.07 * p) + 0.5;

  // chromatic split toward the cursor
  vec2 dir = (uMouse - 0.5) * 0.016 * p;
  float r = texture2D(uTex, cover(uv + dir)).r;
  float g = texture2D(uTex, cover(uv)).g;
  float b = texture2D(uTex, cover(uv - dir)).b;

  // faint holographic scanline shimmer
  float scan = sin((uv.y + uTime * 0.16) * 220.0) * 0.018 * p;

  gl_FragColor = vec4(vec3(r, g, b) + scan, p);
}`;

export default function HoverDistortion() {
  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let material: THREE.ShaderMaterial | null = null;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    let active: HTMLElement | null = null;
    let tex: THREE.Texture | null = null;
    let raf = 0;
    let prog = 0;
    let target = 0;

    const ensure = () => {
      if (renderer) return;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      const c = renderer.domElement;
      c.style.position = "absolute";
      c.style.inset = "0";
      c.style.width = "100%";
      c.style.height = "100%";
      c.style.pointerEvents = "none";
      material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        uniforms: {
          uTex: { value: null },
          uProg: { value: 0 },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uCover: { value: new THREE.Vector2(1, 1) },
        },
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      prog = 0;
      renderer?.domElement.remove();
      tex?.dispose();
      tex = null;
      if (material) material.uniforms.uTex.value = null;
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      prog += (target - prog) * 0.09;
      if (material && renderer) {
        material.uniforms.uProg.value = prog;
        material.uniforms.uTime.value = time / 1000;
        renderer.render(scene, camera);
      }
      if (target === 0 && prog < 0.012) stop();
    };

    const enter = (el: HTMLElement) => {
      active = el;
      const img = el.querySelector("img");
      const mount = el.querySelector<HTMLElement>("[data-distort-mount]") ?? el;
      if (!img || !img.currentSrc) return;
      ensure();

      loader.load(img.currentSrc, (texture) => {
        if (active !== el || !renderer || !material) {
          texture.dispose();
          return;
        }
        tex?.dispose();
        tex = texture;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;

        const rect = mount.getBoundingClientRect();
        const imgEl = texture.image as HTMLImageElement;
        const imageAspect = imgEl.naturalWidth / imgEl.naturalHeight;
        const planeAspect = rect.width / rect.height;
        // object-fit: cover mapping
        material.uniforms.uCover.value.set(
          imageAspect > planeAspect ? planeAspect / imageAspect : 1,
          imageAspect > planeAspect ? 1 : imageAspect / planeAspect
        );
        material.uniforms.uTex.value = tex;

        renderer.setSize(rect.width, rect.height, false);
        mount.appendChild(renderer.domElement);
        target = 1;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-distort]") as HTMLElement | null;
      if (el && el !== active) enter(el);
    };
    const onOut = (e: MouseEvent) => {
      if (!active) return;
      const to = e.relatedTarget as HTMLElement | null;
      if (to && active.contains(to)) return;
      if ((e.target as HTMLElement).closest?.("[data-distort]") !== active) return;
      active = null;
      target = 0;
    };
    const onMove = (e: MouseEvent) => {
      if (!active || !material) return;
      const r = active.getBoundingClientRect();
      material.uniforms.uMouse.value.set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height
      );
    };

    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    document.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousemove", onMove);
      stop();
      renderer?.dispose();
      material?.dispose();
    };
  }, []);

  return null;
}
