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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    // Significantly increased for a dense "technical" feel
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 45 : 110;
    const connectionDistance = isMobile ? 150 : 220;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2 + 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
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
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const targetNode = themeRef.current === 'dark' ? 0.6 : 0.3;
      const targetLine = themeRef.current === 'dark' ? 0.25 : 0.12;
      
      opacities.current.node += (targetNode - opacities.current.node) * 0.1;
      opacities.current.line += (targetLine - opacities.current.line) * 0.1;

      // Draw nodes
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 77, 77, ${opacities.current.node})`;
      particles.forEach(p => {
        p.update();
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      });
      ctx.fill();

      // Draw connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
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
      init();
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
