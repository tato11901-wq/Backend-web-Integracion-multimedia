import { isPlantInfoOpen } from "../../store/resourceStore";
import plantaSpriteSheet from '../../assets/Recursos planta/end_idle_spritesheet.png';
import { SpriteAnimator } from './SpriteAnimator';

export const Plant = () => {
  return (
    <div
      onClick={() => (isPlantInfoOpen.value = true)}
      className="relative mb-24 flex flex-col items-center pointer-events-auto cursor-pointer hover:scale-105 transition-transform duration-200"
    >
      {/* Plant Image (SpriteSheet) */}
      <div className="w-80 h-auto flex items-center justify-center z-20">
        <SpriteAnimator
          src={plantaSpriteSheet.src}
          frameWidth={477} // 2863 ancho total / 6 cuadros aprox.
          frameHeight={510} // Altura de la imagen completa
          frameCount={18}    // Cantidad de fotogramas
          fps={20}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default Plant;
