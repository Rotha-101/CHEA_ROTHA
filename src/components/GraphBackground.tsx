import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

export default function GraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useThemeStore();
  const themeRef = useRef(theme);
  
  // Transition states
  const opacities = useRef({
    node: theme === 'dark' ? 0.5 : 0.2,
    line: theme === 'dark' ? 0.2 : 0.08
  });

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 60 : 150; // Balanced for "RGB" and smoothness
    const connectionDistance = isMobile ? 120 : 180;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      hue: number;
      hueSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width / (window.devicePixelRatio || 1);
        this.y = Math.random() * canvas!.height / (window.devicePixelRatio || 1);
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2 + 1;
        this.hue = Math.random() * 360;
        this.hueSpeed = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.hue += this.hueSpeed;
        if (this.hue > 360) this.hue = 0;

        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
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
      // Draw background (no clearRect for performance with alpha:false)
      ctx.fillStyle = themeRef.current === 'dark' ? '#050810' : '#ffffff';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      const targetNode = themeRef.current === 'dark' ? 0.6 : 0.3;
      const targetLine = themeRef.current === 'dark' ? 0.25 : 0.12;
      
      opacities.current.node += (targetNode - opacities.current.node) * 0.1;
      opacities.current.line += (targetLine - opacities.current.line) * 0.1;

      // Draw connections first
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistance * connectionDistance) {
            const dist = Math.sqrt(distSq);
            const strength = (1 - dist / connectionDistance);
            ctx.beginPath();
            // Gradient connection for "RGB" effect
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, `hsla(${p1.hue}, 80%, 60%, ${opacities.current.line * strength})`);
            grad.addColorStop(1, `hsla(${p2.hue}, 80%, 60%, ${opacities.current.line * strength})`);
            ctx.strokeStyle = grad;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      particles.forEach(p => {
        p.update();
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${opacities.current.node})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

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
      className="fixed inset-0 z-0 pointer-events-none transition-colors duration-200 transform-gpu will-change-transform"
    />
  );
}
