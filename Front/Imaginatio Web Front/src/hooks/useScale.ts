import { useState, useEffect } from 'preact/hooks';

interface ScaleResult {
  scale: number;
  virtualWidth: number;
  virtualHeight: number;
}

export function useScale(baseHeight = 1080): ScaleResult {
  const [scaleState, setScaleState] = useState<ScaleResult>({
    scale: 1,
    virtualWidth: 1920,
    virtualHeight: baseHeight,
  });

  useEffect(() => {
    const calculateScale = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      // Scale strictly based on height to preserve vertical proportions
      const newScale = winH / baseHeight;

      // The virtual width expands to fill the horizontal space at the current scale
      const newVirtualWidth = winW / newScale;

      setScaleState({
        scale: newScale,
        virtualWidth: newVirtualWidth,
        virtualHeight: baseHeight,
      });
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [baseHeight]);

  return scaleState;
}
