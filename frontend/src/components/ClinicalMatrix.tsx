import React, { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function ClinicalMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let columns = 0;
    let drops: number[] = [];
    const fontSize = 16;

    const initMatrix = (width: number, height: number) => {
      canvas.width = width;
      canvas.height = height;
      columns = Math.floor(width / fontSize) + 1;
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        initMatrix(width, height);
      }
    });

    resizeObserver.observe(container);

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789🧬🩺💊🔬🧪🩹';

    const draw = () => {
      ctx.fillStyle = 'rgba(14, 14, 14, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10B981'; // Clinical Green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.8;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0E0E0E]">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          className="relative"
        >
          {/* Main Logo: Medical Plus */}
          <div className="relative z-10 p-10 rounded-full glass-panel border-white/10 bg-white/5 backdrop-blur-md">
            <Plus size={160} className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]" strokeWidth={3} />
          </div>

          {/* Decorative Rings */}
          <div className="absolute inset-0 border-4 border-clinical-green/30 rounded-full scale-110 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-0 border-2 border-tech-navy/20 rounded-full scale-125 animate-[spin_30s_linear_infinite_reverse]" />
        </motion.div>
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E0E] via-transparent to-[#0E0E0E]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-transparent to-[#0E0E0E]" />
    </div>
  );
}
