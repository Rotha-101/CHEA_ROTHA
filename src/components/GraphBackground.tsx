import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

export default function GraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useThemeStore();
  const themeRef = useRef(theme);
  
  // Transition states
  const opacities = useRef({
    node: theme === 'dark' ? 0.4 : 0.2,
    line: theme === 'dark' ? 0.15 : 0.1
  });

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const connectionDistance = 150;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 77, 77, ${opacities.current.node})`;
        ctx.fill();
      }
    }

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

      const targetNode = themeRef.current === 'dark' ? 0.4 : 0.2;
      const targetLine = themeRef.current === 'dark' ? 0.15 : 0.08;
      
      opacities.current.node += (targetNode - opacities.current.node) * 0.1;
      opacities.current.line += (targetLine - opacities.current.line) * 0.1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw();

        // Limit connections to keep O(N^2) light
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = connectionDistance * connectionDistance;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            const strength = (1 - dist / connectionDistance);
            ctx.strokeStyle = `rgba(255, 77, 77, ${opacities.current.line * strength})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    let lastWidth = window.innerWidth;
    const handleResize = () => {
      // Only re-init if width changes (prevents mobile scroll jump due to address bar)
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        init();
      }
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
      className="fixed inset-0 z-0 pointer-events-none bg-white dark:bg-[#050810] transition-colors duration-200 will-change-transform"
    />
  );
}
