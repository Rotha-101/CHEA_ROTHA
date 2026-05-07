import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

export default function GraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useThemeStore();
  const themeRef = useRef(theme);
  
  // Transition states
  const opacities = useRef({
    node: theme === 'dark' ? 0.6 : 0.3,
    line: theme === 'dark' ? 0.25 : 0.12
  });

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Performance optimization
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let lastWidth = window.innerWidth;
    
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 80 : 200;
    const connectionDistance = isMobile ? 180 : 280;
    const connectionDistanceSq = connectionDistance * connectionDistance;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.size = Math.random() * 2 + 1;
      }

      update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;
      }
    }

    const init = (isResize = false) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // On mobile, browser UI changes (address bar) trigger resize.
      // We only want to reset particles if the width changes (orientation change).
      if (isResize && isMobile && Math.abs(width - lastWidth) < 50) {
        // Just adjust canvas size without resetting particles
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        return;
      }

      lastWidth = width;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(width, height));
      }
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      ctx.fillStyle = themeRef.current === 'dark' ? '#050810' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const targetNode = themeRef.current === 'dark' ? 0.6 : 0.3;
      const targetLine = themeRef.current === 'dark' ? 0.25 : 0.12;
      
      opacities.current.node += (targetNode - opacities.current.node) * 0.1;
      opacities.current.line += (targetLine - opacities.current.line) * 0.1;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 77, 77, ${opacities.current.node})`;
      for (const p of particles) {
        p.update(w, h);
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistanceSq) {
            const dist = Math.sqrt(distSq);
            const strength = (1 - dist / connectionDistance);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 77, 77, ${opacities.current.line * strength})`;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init(true);
    };

    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none bg-white dark:bg-[#050810] transition-colors duration-200 transform-gpu will-change-transform"
    />
  );
}
