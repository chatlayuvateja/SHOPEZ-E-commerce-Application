import React, { useRef, useEffect } from 'react';

const ParticleCanvas = ({ count = 80, color = '255,107,53', speed = 0.5, className = '' }) => {
  const canvasRef = useRef();
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * 2;
      h = canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));
    particlesRef.current = particles;

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    window.addEventListener('mousemove', handleMouse);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x / 2, p.y / 2, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x / 2, particles[i].y / 2);
            ctx.lineTo(particles[j].x / 2, particles[j].y / 2);
            ctx.strokeStyle = `rgba(${color}, ${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [count, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default ParticleCanvas;
