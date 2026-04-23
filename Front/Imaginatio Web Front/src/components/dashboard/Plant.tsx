import { useEffect, useState, useRef } from "preact/hooks";
import { isPlantInfoOpen } from "../../store/resourceStore";
import { plantPhase, type PlantPhase, waterAnimationTrigger } from "../../store/plantStore";
import { SpriteAnimator } from './SpriteAnimator';

// Importar spritesheets de las diferentes fases
import semillaSpriteSheet from '../../assets/Recursos planta/semilla_idle_spritesheet.png';
import fase2SpriteSheet from '../../assets/Recursos planta/fase2_idle_spritesheet.png';
import fase3SpriteSheet from '../../assets/Recursos planta/fase3_idle_spritesheet.png';
import entSpriteSheet from '../../assets/Recursos planta/end_idle_spritesheet.png';
import evolucionSpriteSheet from '../../assets/Recursos estadosPlanta/Evolucion.png';
import watherSpriteSheet from '../../assets/Recursos estadosPlanta/Wather.png';

export const Plant = () => {
  const [isEvolving, setIsEvolving] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [displayPhase, setDisplayPhase] = useState<PlantPhase>(plantPhase.value);
  const prevPhaseRef = useRef(plantPhase.value);
  const prevWaterRef = useRef(waterAnimationTrigger.value);

  // Detect phase changes to trigger evolution animation
  useEffect(() => {
    if (prevPhaseRef.current !== plantPhase.value) {
      setIsEvolving(true);

      // Delay visual change of the plant to sync with the evolution animation explosion (approx 1.5s)
      const newPhase = plantPhase.value;
      const phaseTimer = setTimeout(() => {
        setDisplayPhase(newPhase);
      }, 1500);

      prevPhaseRef.current = plantPhase.value;

      // La animación tiene 43 frames. A 20 fps son 2.15 segundos.
      const timer = setTimeout(() => {
        setIsEvolving(false);
      }, 2150);

      return () => {
        clearTimeout(timer);
        clearTimeout(phaseTimer);
      };
    }
  }, [plantPhase.value]);

  // Detect watering action
  useEffect(() => {
    if (prevWaterRef.current !== waterAnimationTrigger.value) {
      setIsWatering(true);
      prevWaterRef.current = waterAnimationTrigger.value;

      // La animación de Wather tiene 8 frames. A 12 fps son ~667ms.
      const timer = setTimeout(() => {
        setIsWatering(false);
      }, 667);

      return () => clearTimeout(timer);
    }
  }, [waterAnimationTrigger.value]);

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
        {isEvolving && (
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
        {isWatering && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none scale-[2.5] -translate-y-55">
            <SpriteAnimator
              src={watherSpriteSheet.src}
              frameWidth={500}
              frameHeight={500}
              frameCount={8}
              fps={12}
              className="w-full h-full object-contain"
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
