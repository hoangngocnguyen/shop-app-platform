'use client';

import { useEffect, useRef } from 'react';
import { RegisterForm } from '@/features/auth';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface MouseState {
  x: number;
  y: number;
  smoothX: number;
  smoothY: number;
  radius: number;
  isPressed: boolean;
}

declare global {
  interface Window {
    __AUTH_PARTICLES__?: Particle[];
    __AUTH_MOUSE__?: MouseState;
  }
}

export default function RegisterPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Đọc vị trí Spotlight cũ đã lưu
    const mouse: MouseState = window.__AUTH_MOUSE__ || {
      x: -1000,
      y: -1000,
      smoothX: -1000,
      smoothY: -1000,
      radius: 220,
      isPressed: false,
    };

    const palette = [
      'rgba(255, 255, 255, ',
      'rgba(52, 211, 153, ',  // Emerald
      'rgba(56, 189, 248, ',  // Sky
      'rgba(167, 139, 250, ', // Violet
    ];

    const particleCount = 70;

    let particles: Particle[] = [];
    if (window.__AUTH_PARTICLES__ && window.__AUTH_PARTICLES__.length === particleCount) {
      particles = window.__AUTH_PARTICLES__;
    } else {
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1,
        alpha: Math.random() * 0.6 + 0.3,
        color: palette[Math.floor(Math.random() * palette.length)],
        pulseSpeed: Math.random() * 0.02 + 0.01,
      }));
      window.__AUTH_PARTICLES__ = particles;
    }

    let trailParticles: TrailParticle[] = [];
    let ripples: Ripple[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      for (let i = 0; i < 2; i++) {
        trailParticles.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: Math.random() * 2 + 0.8,
          alpha: 0.85,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    const handleMouseDown = () => { mouse.isPressed = true; };
    const handleMouseUp = () => { mouse.isPressed = false; };

    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 260,
        alpha: 0.8,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (mouse.x !== -1000) {
        if (mouse.smoothX === -1000) {
          mouse.smoothX = mouse.x;
          mouse.smoothY = mouse.y;
        } else {
          mouse.smoothX += (mouse.x - mouse.smoothX) * 0.12;
          mouse.smoothY += (mouse.y - mouse.smoothY) * 0.12;
        }
      }

      // 1. Spotlight
      if (mouse.smoothX > 0 && mouse.smoothY > 0) {
        const mouseGlow = ctx.createRadialGradient(
          mouse.smoothX,
          mouse.smoothY,
          0,
          mouse.smoothX,
          mouse.smoothY,
          mouse.isPressed ? mouse.radius * 1.3 : mouse.radius
        );

        if (mouse.isPressed) {
          mouseGlow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
          mouseGlow.addColorStop(0.5, 'rgba(167, 139, 250, 0.12)');
        } else {
          mouseGlow.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
          mouseGlow.addColorStop(0.5, 'rgba(52, 211, 153, 0.07)');
        }
        mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(
          mouse.smoothX,
          mouse.smoothY,
          mouse.isPressed ? mouse.radius * 1.3 : mouse.radius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = mouseGlow;
        ctx.fill();
      }

      // 2. Trail
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const tp = trailParticles[i];
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.alpha -= 0.022;
        tp.size *= 0.96;

        if (tp.alpha <= 0 || tp.size <= 0.2) {
          trailParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
        ctx.fillStyle = `${tp.color}${tp.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 5.5;
        r.alpha -= 0.014;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        particles.forEach((p) => {
          const rdx = p.x - r.x;
          const rdy = p.y - r.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);

          if (Math.abs(rDist - r.radius) < 30) {
            const angle = Math.atan2(rdy, rdx);
            p.x += Math.cos(angle) * 4.5;
            p.y += Math.sin(angle) * 4.5;
          }
        });
      }

      // 4. Particles Network
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.007;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dx = mouse.smoothX - p.x;
        const dy = mouse.smoothY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);

          if (mouse.isPressed) {
            p.x += Math.cos(angle) * force * 5.5;
            p.y += Math.sin(angle) * force * 5.5;
          } else {
            p.x -= Math.cos(angle) * force * 2.2;
            p.y -= Math.sin(angle) * force * 2.2;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.15, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pDist < 140) {
            const lineAlpha = 0.22 * (1 - pDist / 140);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        if (dist < mouse.radius) {
          const mouseLineAlpha = (mouse.isPressed ? 0.65 : 0.38) * (1 - dist / mouse.radius);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.smoothX, mouse.smoothY);
          ctx.strokeStyle = mouse.isPressed
            ? `rgba(56, 189, 248, ${mouseLineAlpha})`
            : `rgba(255, 255, 255, ${mouseLineAlpha})`;
          ctx.lineWidth = mouse.isPressed ? 1.5 : 1;
          ctx.stroke();
        }
      }

      window.__AUTH_PARTICLES__ = particles;
      window.__AUTH_MOUSE__ = mouse;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-hover via-primary to-text-main p-4 sm:p-6 select-none">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-primary-light/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}