import React, { useRef, useEffect } from 'react';

type SnowfallProps = {
  count?: number; // number of snow particles
  color?: string;
  size?: [number, number]; // min,max
  speed?: [number, number]; // min,max
  zIndex?: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function Snowfall({
  count = 80,
  color = '255,255,255',
  size = [1.5, 4.0],
  speed = [0.3, 1.2],
  zIndex = 60
}: SnowfallProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    type Particle = {
      x: number;
      y: number;
      r: number;
      vY: number;
      vX: number;
      o: number;
      sway: number;
    };

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const r = rand(size[0], size[1]);
      particles.push({
        x: rand(0, w),
        y: rand(-h, h),
        r,
        vY: rand(speed[0], speed[1]) * (r / size[1] + 0.6),
        vX: rand(-0.5, 0.5),
        o: rand(0.4, 0.98),
        sway: rand(0.5, 2.5)
      });
    }

    let last = performance.now();

    function loop(t: number) {
      const dt = Math.min(50, t - last);
      last = t;
      ctx.clearRect(0, 0, w, h);

      // subtle vignette / blur behind snow (optional)
      // draw particles
      for (let p of particles) {
        p.y += p.vY * (dt / 16);
        p.x += Math.sin((t / 1000) * p.sway) * 0.6 + p.vX * (dt / 16);

        if (p.y - p.r > h) {
          p.y = -10;
          p.x = rand(0, w);
        }
        if (p.x - p.r > w) p.x = -p.r;
        if (p.x + p.r < 0) p.x = w + p.r;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.r * 1.6
        );
        gradient.addColorStop(0, `rgba(${color}, ${p.o})`);
        gradient.addColorStop(1, `rgba(${color}, ${p.o * 0.02})`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    function onResize() {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [count, color, size, speed]);

  return (
    <canvas
      ref={ref}
      className='pointer-events-none fixed inset-0 w-full h-full'
      style={{ zIndex }}
      aria-hidden
    />
  );
}
