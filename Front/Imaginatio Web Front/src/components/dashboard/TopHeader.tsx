import { isInventoryOpen, isHelpModalOpen, username } from '../../store/resourceStore';
import panelHudSuperior from '../../assets/Recursos web media/Panel_HUD_superior.png';
import panelNombrePlanta from '../../assets/Recursos web media/Panel_NombrePlanta.png';
import panelAvisoPlanta from '../../assets/Recursos web media/Panel_AvisoPlanta.png';
import btnInventario from '../../assets/Recursos web media/btn_Inventario.png';
import btnAyuda from '../../assets/Recursos web media/btn_ayuda.png';

export default function TopHeader() {
  return (
    <div className="flex flex-row justify-between items-start w-full px-6 pt-0 z-30 relative pointer-events-none">

      {/* Top Header Background - Panel HUD Superior */}
      <div className="absolute top-0 left-2 right-2 lg:left-4 lg:right-4 h-30 z-0 flex items-center justify-center">
        <img src={panelHudSuperior.src} alt="Panel HUD Superior" className="w-full h-full object-fill" />
      </div>

      <div className="relative z-10 flex w-full justify-between items-center px-8 mt-6 pointer-events-auto">
        {/* Nombre de planta - Left */}
        <div className="relative w-44 h-14 lg:w-52 lg:h-16 flex items-center justify-center cursor-pointer ml-10">
          <img src={panelNombrePlanta.src} alt="Nombre Planta" className="w-full h-full object-contain" />
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm lg:text-base pt-1">
            {username.value || "Jardinero"}
          </span>
        </div>

        {/* Aviso de planta - Center */}
        <div className="relative w-full h-14 lg:h-16 flex items-center justify-center mx-4">
          <img src={panelAvisoPlanta.src} alt="Aviso Planta" className="w-full h-full object-contain" />
          <span className="absolute inset-0 flex items-center justify-center text-white font-medium text-xs lg:text-sm pt-1">
            ¡Bienvenido al invernadero Imaginatio!
          </span>
        </div>

        {/* Right buttons: Inventario y Ayuda */}
        <div className="flex gap-5 shrink-0 mr-10">
          <div
            onClick={() => isInventoryOpen.value = true}
            className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90"
          >
            <img src={btnInventario.src} alt="Inventario" className="w-full h-full object-contain" />
          </div>
          <div
            onClick={() => isHelpModalOpen.value = true}
            className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90"
          >
            <img src={btnAyuda.src} alt="Ayuda" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
