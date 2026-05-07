import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

export default function GraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useThemeStore();
  const themeRef = useRef(theme);
  
  // Transition states for smooth theme switching
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

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let lastWidth = window.innerWidth;
    
    // Balanced counts for maximum smoothness at 4K/60fps
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 65 : 155;
    const connectionDistance = isMobile ? 170 : 250;
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
        // Slower speed = more "premium" and smoother perception
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
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
      
      if (isResize && isMobile && Math.abs(width - lastWidth) < 50) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for performance on ultra-high-res
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        return;
      }

      lastWidth = width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); 
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
      
      opacities.current.node += (targetNode - opacities.current.node) * 0.05;
      opacities.current.line += (targetLine - opacities.current.line) * 0.05;

      // Draw nodes in a single batch
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 77, 77, ${opacities.current.node})`;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(w, h);
        // Using rect for nodes is significantly faster than arc for many items
        ctx.rect(p.x, p.y, p.size, p.size);
      }
      ctx.fill();

      // Optimized connection loop
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          // Early exit if horizontal distance is already too large
          if (Math.abs(dx) > connectionDistance) continue;
          
          const dy = p1.y - p2.y;
          if (Math.abs(dy) > connectionDistance) continue;

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
      className="fixed inset-0 z-0 pointer-events-none bg-white dark:bg-[#050810] transform-gpu will-change-transform"
    />
  );
}
