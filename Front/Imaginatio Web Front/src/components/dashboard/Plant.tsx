import { useEffect, useState, useRef } from "preact/hooks";
import { isPlantInfoOpen } from "../../store/resourceStore";
import {
  plantPhase,
  plantSpeciesId,
  type PlantPhase,
  isWatering,
  isFertilizing,
  isSunning,
  isEvolving
} from "../../store/plantStore";
import { SpriteAnimator } from './SpriteAnimator';
import { getSpriteConfig } from '../../config/plantSpriteRegistry';

// Efectos de estado compartidos por todas las especies
import evolucionSpriteSheet from '../../assets/Recursos estadosPlanta/Evolucion.png';
import watherSpriteSheet    from '../../assets/Recursos estadosPlanta/Wather.png';
import abonoSpriteSheet     from '../../assets/Recursos estadosPlanta/Abono.png';
import solSpriteSheet       from '../../assets/Recursos estadosPlanta/Sol.png';

export const Plant = () => {
  const [displayPhase, setDisplayPhase] = useState<PlantPhase>(plantPhase.value);
  const [displaySpecies, setDisplaySpecies] = useState<string>(plantSpeciesId.value);
  const prevPhaseRef = useRef(plantPhase.value);

  // Retrasar el cambio visual de fase para sincronizarlo con la animación de evolución
  useEffect(() => {
    if (prevPhaseRef.current !== plantPhase.value) {
      const newPhase = plantPhase.value;
      const timer = setTimeout(() => setDisplayPhase(newPhase), 1500);
      prevPhaseRef.current = plantPhase.value;
      return () => clearTimeout(timer);
    }
  }, [plantPhase.value]);

  useEffect(() => {
    setDisplaySpecies(plantSpeciesId.value);
  }, [plantSpeciesId.value]);

  const config = getSpriteConfig(displaySpecies, displayPhase);
  const isAnimated = config.frameCount > 1;

  return (
    <div className="relative mb-24 flex flex-col items-center pointer-events-none group">
      <div className="w-80 h-auto flex items-center justify-center z-20 relative transition-transform duration-300 group-hover:scale-105">

        {/* Sprite principal: animado o estático según la especie */}
        {isAnimated ? (
          <SpriteAnimator
            key={`${displaySpecies}-${displayPhase}`}
            src={config.src}
            frameWidth={config.frameWidth}
            frameHeight={config.frameHeight}
            frameCount={config.frameCount}
            scale={config.scale}
            fps={20}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        ) : (
          <img
            key={`${displaySpecies}-${displayPhase}`}
            src={config.src}
            alt={`${displaySpecies} – ${displayPhase}`}
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{ transform: `scale(${config.scale})`, transformOrigin: "bottom center" }}
          />
        )}

        {/* Overlays de animaciones de interacción */}
        {isEvolving.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5]">
            <SpriteAnimator src={evolucionSpriteSheet.src} frameWidth={500} frameHeight={500} frameCount={43} fps={20} className="w-full h-full object-contain mix-blend-screen" />
          </div>
        )}
        {isWatering.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5] -translate-y-55">
            <SpriteAnimator src={watherSpriteSheet.src} frameWidth={500} frameHeight={500} frameCount={16} fps={12} className="w-full h-full object-contain mix-blend-screen" />
          </div>
        )}
        {isFertilizing.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2] -translate-y-40">
            <SpriteAnimator src={abonoSpriteSheet.src} frameWidth={500} frameHeight={500} frameCount={25} fps={20} className="w-full h-full object-contain mix-blend-screen" />
          </div>
        )}
        {isSunning.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5] -translate-y-50">
            <SpriteAnimator src={solSpriteSheet.src} frameWidth={500} frameHeight={500} frameCount={35} fps={20} className="w-full h-full object-contain mix-blend-screen opacity-50" />
          </div>
        )}
      </div>

      {/* Hitbox invisible para abrir el panel de información */}
      <div
        onClick={() => (isPlantInfoOpen.value = true)}
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto cursor-pointer ${config.hitbox}`}
        title="Ver detalles de la planta"
      />
    </div>
  );
};

export default Plant;
