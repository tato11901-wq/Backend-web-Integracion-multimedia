import { useState, useEffect, useRef } from "preact/hooks";
import { isInventoryOpen, isHelpModalOpen, plantName, activePlantId } from '../../store/resourceStore';
import { fetchMyActivePlant, renamePlant } from '../../store/apiClient';
import panelHudSuperior from '../../assets/Recursos web media/Panel_HUD_superior.png';
import panelNombrePlanta from '../../assets/Recursos web media/Panel_NombrePlanta.png';
import panelAvisoPlanta from '../../assets/Recursos web media/Panel_AvisoPlanta.png';
import btnInventario from '../../assets/Recursos web media/btn_Inventario.png';
import btnAyuda from '../../assets/Recursos web media/btn_ayuda.png';

export default function TopHeader() {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch plant name on mount
  useEffect(() => {
    fetchMyActivePlant()
      .then((plant: any) => {
        if (plant?.name) {
          plantName.value = plant.name;
        }
        if (plant?.id) {
          activePlantId.value = plant.id;
        }
      })
      .catch(() => {
        // No active plant yet — keep default
      });
  }, []);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditValue(plantName.value);
    setIsEditing(true);
  };

  const handleConfirm = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setIsEditing(false);
      return;
    }

    plantName.value = trimmed;
    setIsEditing(false);

    // Persist to backend if we have an active plant
    if (activePlantId.value) {
      try {
        await renamePlant(activePlantId.value, trimmed);
      } catch {
        // Silently fail — name is already updated locally
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-row justify-between items-start w-full px-6 pt-0 z-30 relative pointer-events-none">

      {/* Top Header Background - Panel HUD Superior */}
      <div className="absolute top-0 left-4 right-4 h-30 z-0 flex items-center justify-center">
        <img src={panelHudSuperior.src} alt="Panel HUD Superior" className="w-full h-full object-fill" />
      </div>

      <div className="relative z-10 flex w-full justify-between items-center px-8 mt-6 pointer-events-auto">
        {/* Nombre de planta - Left */}
        <div
          className="relative w-52 h-16 flex items-center justify-center cursor-pointer ml-10 group"
          onClick={!isEditing ? handleStartEditing : undefined}
          title="Haz clic para cambiar el nombre"
        >
          <img src={panelNombrePlanta.src} alt="Nombre Planta" className="w-full h-full object-contain" />

          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              maxLength={12}
              onInput={(e) => setEditValue((e.target as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              onBlur={handleConfirm}
              className="absolute inset-0 bg-transparent text-white font-bold text-base text-center pt-1 outline-none border-none caret-yellow-300"
              style={{ background: "transparent" }}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-base pt-1 group-hover:text-yellow-200 transition-colors duration-200">
              {plantName.value}
            </span>
          )}
        </div>

        {/* Aviso de planta - Center */}
        <div className="relative w-full h-16 flex items-center justify-center mx-4">
          <img src={panelAvisoPlanta.src} alt="Aviso Planta" className="w-full h-full object-contain" />
          <span className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm pt-1">
            ¡Bienvenido al invernadero Imaginatio!
          </span>
        </div>

        {/* Right buttons: Inventario y Ayuda */}
        <div className="flex gap-5 shrink-0 mr-10">
          <div
            onClick={() => isInventoryOpen.value = true}
            className="w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90"
          >
            <img src={btnInventario.src} alt="Inventario" className="w-full h-full object-contain" />
          </div>
          <div
            onClick={() => isHelpModalOpen.value = true}
            className="w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90"
          >
            <img src={btnAyuda.src} alt="Ayuda" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
