import { useState, useEffect, useRef } from "preact/hooks";
import { isNamingModalOpen, plantName, activePlantId, refreshInventory } from "../../store/resourceStore";
import { renamePlant } from "../../store/apiClient";
import panelNombrePlanta from "../../assets/Recursos web media/Panel_NombrePlanta.png";

export default function PlantNamingModal() {
  const [tempName, setTempName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNamingModalOpen.value) {
      setTempName("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isNamingModalOpen.value]);

  const handleSave = async (e?: Event) => {
    e?.preventDefault();
    const finalName = tempName.trim() || "Mi Planta";
    plantName.value = finalName;
    isNamingModalOpen.value = false;

    if (activePlantId.value) {
      try {
        await renamePlant(activePlantId.value, finalName);
        refreshInventory();
      } catch (err) {
        console.error("Error naming plant", err);
      }
    }
  };

  if (!isNamingModalOpen.value) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div
        className="bg-[#2d4a1d] border-8 border-[#4e341b] rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative animate-in zoom-in duration-300"
      >
        {/* Decoración superior */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-7xl select-none drop-shadow-xl animate-bounce">
          🌱
        </div>

        <h2 className="mt-4 text-2xl font-black text-[#f5e6c8] uppercase text-center drop-shadow-md">
          ¡Una nueva vida!
        </h2>

        <p className="text-center text-[#f5e6c8]/90 font-medium leading-relaxed">
          Has plantado una nueva semilla. ¿Qué nombre le vas a poner para empezar esta aventura?
        </p>

        <form onSubmit={handleSave} className="flex flex-col w-full gap-4 items-center mt-2">
          <div className="relative w-56 h-16 flex items-center justify-center">
            <img src={panelNombrePlanta.src} alt="Fondo input" className="w-full h-full object-contain" />
            <input
              ref={inputRef}
              type="text"
              value={tempName}
              maxLength={12}
              onInput={(e) => setTempName((e.target as HTMLInputElement).value)}
              placeholder="Ej: Planty"
              className="absolute inset-0 bg-transparent text-white font-black text-lg text-center outline-none border-none caret-yellow-300 px-6 pt-1 placeholder-white/40"
              style={{ background: "transparent" }}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-[#4e341b] font-black py-3 rounded-xl shadow-lg transition-transform text-lg"
          >
            ¡Bautizar Planta!
          </button>
        </form>
      </div>
    </div>
  );
}
