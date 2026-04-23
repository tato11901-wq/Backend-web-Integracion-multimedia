import { isPlantInfoOpen } from "../../store/resourceStore";
import { plantPhase } from "../../store/plantStore";
import { SpriteAnimator } from './SpriteAnimator';

// Importar spritesheets de las diferentes fases
import semillaSpriteSheet from '../../assets/Recursos planta/semilla_idle_spritesheet.png';
import fase2SpriteSheet from '../../assets/Recursos planta/fase2_idle_spritesheet.png';
import fase3SpriteSheet from '../../assets/Recursos planta/fase3_idle_spritesheet.png';
import entSpriteSheet from '../../assets/Recursos planta/end_idle_spritesheet.png';

export const Plant = () => {
  // Mapear cada fase a su spritesheet y configuración
  const getSpriteConfig = () => {
    switch (plantPhase.value) {
      case "semilla":
        return {
          src: semillaSpriteSheet.src,
          frameWidth: 477,
          frameHeight: 510,
          frameCount: 18,
        };
      case "arbusto_pequeño":
        return {
          src: fase2SpriteSheet.src,
          frameWidth: 477,
          frameHeight: 510,
          frameCount: 18,
        };
      case "arbusto_grande":
        return {
          src: fase3SpriteSheet.src,
          frameWidth: 477,
          frameHeight: 510,
          frameCount: 18,
        };
      case "ent":
      default:
        return {
          src: entSpriteSheet.src,
          frameWidth: 477,
          frameHeight: 510,
          frameCount: 18,
        };
    }
  };

  const config = getSpriteConfig();

  return (
    <div
      onClick={() => (isPlantInfoOpen.value = true)}
      className="relative mb-24 flex flex-col items-center pointer-events-auto cursor-pointer hover:scale-105 transition-transform duration-200"
    >
      {/* Plant Image (SpriteSheet) */}
      <div className="w-80 h-auto flex items-center justify-center z-20">
        <SpriteAnimator
          key={plantPhase.value} // Forzar re-montaje cuando cambia la fase
          src={config.src}
          frameWidth={config.frameWidth}
          frameHeight={config.frameHeight}
          frameCount={config.frameCount}
          fps={20}
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default Plant;
