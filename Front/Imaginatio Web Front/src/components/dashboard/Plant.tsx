import { useEffect, useState, useRef } from "preact/hooks";
import { isPlantInfoOpen } from "../../store/resourceStore";
import { plantPhase, type PlantPhase, waterAnimationTrigger, fertilizerAnimationTrigger, sunAnimationTrigger, isWatering, isFertilizing, isSunning, isEvolving } from "../../store/plantStore";
import { SpriteAnimator } from './SpriteAnimator';

// Importar spritesheets de las diferentes fases
import semillaSpriteSheet from '../../assets/Recursos planta/semilla_idle_spritesheet.png';
import fase2SpriteSheet from '../../assets/Recursos planta/fase2_idle_spritesheet.png';
import fase3SpriteSheet from '../../assets/Recursos planta/fase3_idle_spritesheet.png';
import entSpriteSheet from '../../assets/Recursos planta/end_idle_spritesheet.png';
import evolucionSpriteSheet from '../../assets/Recursos estadosPlanta/Evolucion.png';
import watherSpriteSheet from '../../assets/Recursos estadosPlanta/Wather.png';
import abonoSpriteSheet from '../../assets/Recursos estadosPlanta/Abono.png';
import solSpriteSheet from '../../assets/Recursos estadosPlanta/Sol.png';

export const Plant = () => {
  const [displayPhase, setDisplayPhase] = useState<PlantPhase>(plantPhase.value);
  const prevPhaseRef = useRef(plantPhase.value);

  // Detect phase changes to trigger evolution animation
  useEffect(() => {
    if (prevPhaseRef.current !== plantPhase.value) {
      // Delay visual change of the plant to sync with the evolution animation explosion (approx 1.5s)
      const newPhase = plantPhase.value;
      const phaseTimer = setTimeout(() => {
        setDisplayPhase(newPhase);
      }, 1500);

      prevPhaseRef.current = plantPhase.value;

      return () => {
        clearTimeout(phaseTimer);
      };
    }
  }, [plantPhase.value]);

  // Mapear cada fase a su spritesheet y configuración usando displayPhase
  const getSpriteConfig = () => {
    switch (displayPhase) {
      case "semilla":
        return {
          src: semillaSpriteSheet.src,
          frameWidth: 477,
          frameHeight: 510,
          frameCount: 18,
          scale: 2.5,
          hitbox: "w-32 h-32",
        };
      case "arbusto_pequeño":
        return {
          src: fase2SpriteSheet.src,
          frameWidth: 477,
          frameHeight: 510,
          frameCount: 18,
          scale: 2.3,
          hitbox: "w-48 h-48",
        };
      case "arbusto_grande":
        return {
          src: fase3SpriteSheet.src,
          frameWidth: 477,
          frameHeight: 510,
          frameCount: 18,
          scale: 2,
          hitbox: "w-56 h-64",
        };
      case "ent":
      default:
        return {
          src: entSpriteSheet.src,
          frameWidth: 477,
          frameHeight: 510,
          frameCount: 18,
          scale: 1.2,
          hitbox: "w-64 h-80",
        };
    }
  };

  const config = getSpriteConfig();

  return (
    <div className="relative mb-24 flex flex-col items-center pointer-events-none group">
      {/* Plant Container (Visual) */}
      <div className="w-80 h-auto flex items-center justify-center z-20 relative transition-transform duration-300 group-hover:scale-105">
        <SpriteAnimator
          key={displayPhase} // Forzar re-montaje cuando cambia la fase visual
          src={config.src}
          frameWidth={config.frameWidth}
          frameHeight={config.frameHeight}
          frameCount={config.frameCount}
          scale={config.scale}
          fps={20}
          className="w-full h-full object-contain drop-shadow-2xl"
        />

        {/* Evolution Animation Overlay */}
        {isEvolving.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5]">
            <SpriteAnimator
              src={evolucionSpriteSheet.src}
              frameWidth={500}
              frameHeight={500}
              frameCount={43}
              fps={20}
              className="w-full h-full object-contain mix-blend-screen"
            />
          </div>
        )}

        {/* Water Animation Overlay */}
        {isWatering.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5] -translate-y-55">
            <SpriteAnimator
              src={watherSpriteSheet.src}
              frameWidth={500}
              frameHeight={500}
              frameCount={16}
              fps={12}
              className="w-full h-full object-contain mix-blend-screen"
            />
          </div>
        )}

        {/* Fertilizer Animation Overlay */}
        {isFertilizing.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2] -translate-y-40">
            <SpriteAnimator
              src={abonoSpriteSheet.src}
              frameWidth={500}
              frameHeight={500}
              frameCount={25}
              fps={20}
              className="w-full h-full object-contain mix-blend-screen"
            />
          </div>
        )}

        {/* Sun Animation Overlay */}
        {isSunning.value && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5] -translate-y-50">
            <SpriteAnimator
              src={solSpriteSheet.src}
              frameWidth={500}
              frameHeight={500}
              frameCount={35}
              fps={20}
              className="w-full h-full object-contain mix-blend-screen opacity-50"
            />
          </div>
        )}
      </div>

      {/* Invisible Hitbox (Interaction) */}
      <div
        onClick={() => (isPlantInfoOpen.value = true)}
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto cursor-pointer ${config.hitbox}`}
        title="Ver detalles de la planta"
      />
    </div>
  );
};

export default Plant;
