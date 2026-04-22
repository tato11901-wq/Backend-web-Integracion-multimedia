import { useEffect, useState, useRef } from 'preact/hooks';

interface SpriteAnimatorProps {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps?: number;
  columns?: number;
  scale?: number;
  className?: string;
}

export function SpriteAnimator({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  fps = 12,
  columns,
  scale = 1,
  className = ''
}: SpriteAnimatorProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const cols = columns || frameCount;
  const rows = Math.ceil(frameCount / cols);

  const fpsRef = useRef(fps);
  fpsRef.current = fps;

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let timeAccumulator = 0;

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      const currentFps = fpsRef.current;
      
      if (currentFps > 0) {
        timeAccumulator += deltaTime;
        const frameDuration = 1000 / currentFps;
        
        // Evita saltos gigantes de frames si la pestaña estuvo inactiva
        if (timeAccumulator > frameDuration * 10) {
          timeAccumulator = frameDuration;
        }

        if (timeAccumulator >= frameDuration) {
          const framesToAdvance = Math.floor(timeAccumulator / frameDuration);
          timeAccumulator -= framesToAdvance * frameDuration;
          setCurrentFrame((prev) => (prev + framesToAdvance) % frameCount);
        }
      } else {
        timeAccumulator = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (frameCount > 1) {
      animationFrameId = requestAnimationFrame(animate);
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [frameCount]);

  const row = Math.floor(currentFrame / cols);
  const col = currentFrame % cols;

  const bgPosX = cols > 1 ? (col / (cols - 1)) * 100 : 0;
  const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 0;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      ref={containerRef}
      style={{
        aspectRatio: `${frameWidth} / ${frameHeight}`,
        width: className?.includes('w-') ? undefined : `${frameWidth}px`,
        backgroundImage: `url("${src}")`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundRepeat: 'no-repeat',
        transform: `scale(${scale})`,
        transformOrigin: 'center bottom',
      }}
    />
  );
}
