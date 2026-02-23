import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Pipe {
  x: number;
  y: number;
  direction: 0 | 1 | 2 | 3;
  length: number;
  progress: number;
  speed: number;
  color: string;
  width: number;
}

const DIR_OFFSETS = [
  [0, -1], // up
  [0, 1],  // down
  [-1, 0], // left
  [1, 0],  // right
];

export function PipesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const pipesRef = useRef<Pipe[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);
  const rafRef = useRef<number | undefined>(undefined);

  const colors = isDark 
    ? ['#ffa200', '#ebeb2d', '#e94200', '#f3c576ef', '#f4e196']
    : ['#3B82F6', '#60A5FA', '#2563EB', '#93C5FD', '#BFDBFE'];

  const createPipe = useCallback((startX?: number, startY?: number): Pipe => ({
    x: startX ?? Math.random() * window.innerWidth,
    y: startY ?? Math.random() * window.innerHeight,
    direction: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
    length: 80 + Math.random() * 200,
    progress: 0,
    speed: 5 + Math.random() * 1.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    width: 1 + Math.random() * 2,
  }), [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 🔥 FIXED: Simplified sizing - no DPR scaling issues
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const maxPipes = 12; // Reduced for performance
    const pipes = pipesRef.current;
    
    // Init pipes
    for (let i = 0; i < 6; i++) {
      pipes.push(createPipe());
    }

    let lastTime = performance.now();
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime < frameInterval) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastTime = currentTime - (deltaTime % frameInterval);
      frameRef.current++;

      // 🔥 FIXED: Clear dengan ukuran canvas yang benar
      ctx.fillStyle = isDark ? '#020617' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn new pipe
      if (frameRef.current % 20 === 0 && pipes.length < maxPipes) {
        pipes.push(createPipe());
      }

      ctx.lineCap = 'round';
      
      for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.progress += pipe.speed;
        
        const dx = mouseRef.current.x - pipe.x;
        const dy = mouseRef.current.y - pipe.y;
        if (dx * dx + dy * dy < 40000) {
          pipe.progress += 0.5;
        }

        if (pipe.progress >= pipe.length) {
          pipes.splice(i, 1);
          continue;
        }

        const [dxDir, dyDir] = DIR_OFFSETS[pipe.direction];
        const endX = pipe.x + dxDir * pipe.progress;
        const endY = pipe.y + dyDir * pipe.progress;

        ctx.beginPath();
        ctx.strokeStyle = pipe.color;
        ctx.lineWidth = pipe.width;
        ctx.globalAlpha = 0.5;
        
        ctx.moveTo(pipe.x, pipe.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw packet
        if (pipe.progress > 30) {
          const packetDist = pipe.progress * 0.85;
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(
            pipe.x + dxDir * packetDist,
            pipe.y + dyDir * packetDist,
            3, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      pipes.length = 0;
    };
  }, [isDark, createPipe]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        width: '100vw', 
        height: '100vh',
        display: 'block'
      }}
    />
  );
}