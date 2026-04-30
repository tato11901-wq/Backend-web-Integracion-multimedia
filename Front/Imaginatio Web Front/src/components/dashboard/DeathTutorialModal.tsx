import { useEffect, useState } from "preact/hooks";
import { isDeathTutorialOpen } from "../../store/resourceStore";
import { plantHealth } from "../../store/plantStore";

const DEATH_TUTORIAL_KEY = "imaginatio_death_tutorial_seen";

function hasSeenDeathTutorial(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(DEATH_TUTORIAL_KEY) === "1";
}

function markDeathTutorialSeen() {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEATH_TUTORIAL_KEY, "1");
  }
}

export default function DeathTutorialModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Si la planta actual está muerta y no hemos visto el tutorial
    const unsub = plantHealth.subscribe((hp) => {
      // Solo disparamos si hp es exactamente 0 (muerta) y no hemos visto el tutorial
      if (hp <= 0 && !hasSeenDeathTutorial()) {
        setVisible(true);
      }
    });
    
    // También nos suscribimos al signal manual por si se abre desde otro lado
    const unsubSignal = isDeathTutorialOpen.subscribe((val) => {
      if (val) setVisible(true);
    });

    return () => {
      unsub();
      unsubSignal();
    };
  }, []);

  const handleClose = () => {
    markDeathTutorialSeen();
    isDeathTutorialOpen.value = false;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className="relative bg-gradient-to-b from-[#2d1f0e] to-[#1a1208] border-4 border-amber-600/70
                   rounded-3xl shadow-[0_0_60px_rgba(217,119,6,0.3)] max-w-md w-full mx-4 p-8
                   flex flex-col items-center gap-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-7xl select-none">
          🥀
        </div>

        <h2 className="mt-6 text-2xl font-black text-amber-500 uppercase tracking-widest drop-shadow-md">
          Tu planta se ha marchitado
        </h2>

        <div className="w-full h-px bg-amber-500/30" />

        <div className="flex flex-col gap-3 text-sm text-amber-100/90 leading-relaxed">
          <p>
            ¡No te desanimes! En <span className="font-black text-amber-400">Plantagochi</span>, la muerte es parte del ciclo.
          </p>
          
          <div className="bg-black/30 p-4 rounded-2xl border border-amber-900/50 text-left space-y-3">
             <div className="flex gap-2">
               <span className="text-xl">♻️</span>
               <p className="text-xs leading-tight">Ve a tu <strong>Inventario</strong> para reciclar esta planta y obtener <strong>composta</strong>.</p>
             </div>
             <div className="flex gap-2">
               <span className="text-xl">🌱</span>
               <p className="text-xs leading-tight">Si es tu única planta, al reciclarla recibirás una <strong>nueva semilla</strong> para volver a empezar.</p>
             </div>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="mt-2 bg-amber-600 hover:bg-amber-500 active:scale-95
                     text-white font-black py-3 px-10 rounded-2xl shadow-lg
                     transition-all duration-150 uppercase tracking-wider text-sm"
        >
          ¡LO TENGO! 🌿
        </button>

        <p className="text-[10px] text-amber-600/50 uppercase tracking-widest">
          Aprende más en el botón de ayuda del inventario
        </p>
      </div>
    </div>
  );
}
