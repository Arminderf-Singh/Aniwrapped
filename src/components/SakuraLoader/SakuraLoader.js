'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './SakuraLoader.module.css';

const TOTAL_FRAMES  = 20;
const FPS           = 10;     // 20 frames × 10 fps ≈ 2 s bloom
const BLOSSOM_CROP  = 0.90;   // top 90 % of each frame = blossom; rest is stem

// ─────────────────────────────────────────────────────────────
//  SakuraLoader
//
//  Phases:
//    blooming → draws frames 0 → 15 on canvas
//    hold     → last frame shown, waits for dataReady
//    out      → cream wash then onComplete
// ─────────────────────────────────────────────────────────────
export default function SakuraLoader({ dataReady, onComplete, loadSteps, stepIndex }) {
  const [phase, setPhase] = useState('blooming');

  const canvasRef      = useRef(null);
  const framesRef      = useRef([]);
  const loadedRef      = useRef(0);
  const allReadyRef    = useRef(false);
  const rafRef         = useRef(null);
  const frameRef       = useRef(0);
  const lastTimeRef    = useRef(0);
  const bloomedRef     = useRef(false);

  // ── Preload every frame image ──────────────────────────────
  useEffect(() => {
    const imgs = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = `/sakura-frames/flower_bloom_${String(i + 1).padStart(2, '0')}.png`;
      img.onload = () => {
        loadedRef.current += 1;
        if (loadedRef.current === TOTAL_FRAMES) {
          allReadyRef.current = true;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const first = imgs[0];
          // Size canvas to the cropped blossom region so the flower
          // fills the frame without the stem dominating or getting clipped.
          const displayH = Math.min(340, Math.round(window.innerHeight * 0.56));
          const displayW = Math.round(
            displayH * (first.naturalWidth / (first.naturalHeight * BLOSSOM_CROP))
          );
          canvas.width  = displayW;
          canvas.height = displayH;
        }
      };
      return img;
    });
    framesRef.current = imgs;
  }, []);

  // ── Animation loop ─────────────────────────────────────────
  useEffect(() => {
    function animate(ts) {
      rafRef.current = requestAnimationFrame(animate);
      if (!allReadyRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      if (ts - lastTimeRef.current < 1000 / FPS) return;
      lastTimeRef.current = ts;

      const frame = frameRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img = framesRef.current[frame];
      // Draw only the blossom region (top BLOSSOM_CROP of the source frame)
      ctx.drawImage(
        img,
        0, 0, img.naturalWidth, Math.round(img.naturalHeight * BLOSSOM_CROP),
        0, 0, canvas.width, canvas.height
      );

      if (frame < TOTAL_FRAMES - 1) {
        frameRef.current = frame + 1;
      } else if (!bloomedRef.current) {
        bloomedRef.current = true;
        setPhase('hold');
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── hold → out once data arrives ──────────────────────────
  useEffect(() => {
    if (phase === 'hold' && dataReady) {
      const t = setTimeout(() => setPhase('out'), 400);
      return () => clearTimeout(t);
    }
  }, [phase, dataReady]);

  // ── Fire onComplete after wash ─────────────────────────────
  useEffect(() => {
    if (phase === 'out') {
      const t = setTimeout(() => onComplete?.(), 900);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const showText = phase === 'blooming' || phase === 'hold';

  return (
    <div className={`${styles.overlay} ${phase === 'out' ? styles.overlayOut : ''}`}>

      <canvas
        ref={canvasRef}
        className={styles.spriteCanvas}
        aria-hidden="true"
      />

      {loadSteps && showText && (
        <p key={stepIndex} className={styles.loadText}>
          {loadSteps[stepIndex]}
        </p>
      )}

      <div className={`${styles.creamWash} ${phase === 'out' ? styles.creamWashOn : ''}`} />
    </div>
  );
}
