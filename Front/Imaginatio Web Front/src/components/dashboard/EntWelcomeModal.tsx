import { useEffect, useState } from "preact/hooks";
import { isEntActive } from "../../store/plantStore";

const ENT_WELCOME_KEY = "imaginatio_ent_welcomed";

function hasSeenEntWelcome(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ENT_WELCOME_KEY) === "1";
}

function markEntWelcomeSeen() {
  if (typeof window !== "undefined") {
    localStorage.setItem(ENT_WELCOME_KEY, "1");
  }
}

export default function EntWelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Suscribirse reactivamente al signal usando .subscribe()
    // Se dispara cada vez que isEntActive cambia de valor
    const unsub = isEntActive.subscribe((active) => {
      if (active && !hasSeenEntWelcome()) {
        setVisible(true);
      }
    });
    return () => unsub();
  }, []);

  const handleClose = () => {
    markEntWelcomeSeen();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* Panel principal — clic interno no propaga para no cerrar por accidente */}
      <div
        className="relative bg-gradient-to-b from-[#1a3a0a] to-[#0d2005] border-4 border-emerald-400/70
                   rounded-3xl shadow-[0_0_60px_rgba(52,211,153,0.3)] max-w-md w-full mx-4 p-8
                   flex flex-col items-center gap-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decoración superior */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl select-none animate-bounce">
          🌳
        </div>

        {/* Título */}
        <h2 className="mt-6 text-2xl font-black text-emerald-300 uppercase tracking-widest drop-shadow-md">
          ¡Has creado un Ent!
        </h2>

        {/* Separador */}
        <div className="w-full h-px bg-emerald-500/30" />

        {/* Cuerpo informativo */}
        <div className="flex flex-col gap-3 text-sm text-emerald-100/90 leading-relaxed">
          <p>
            Los <span className="font-black text-emerald-300">Ents</span> son seres ancestrales
            e inmortales. Mientras tengas uno seleccionado como planta activa:
          </p>

          <ul className="flex flex-col gap-2 text-left mt-1">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 text-lg leading-tight">✔</span>
              <span>
                <strong className="text-emerald-300">Tu planta nunca decaerá</strong> — el tiempo
                AFK está congelado. No perderás agua ni sol mientras el Ent sea tu planta activa.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 text-lg leading-tight">✖</span>
              <span>
                <strong className="text-red-300">Los minijuegos estarán bloqueados</strong> — no
                podrás recolectar agua, sol ni compost.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 text-lg leading-tight">💡</span>
              <span>
                Para seguir jugando, <strong className="text-yellow-300">selecciona otra planta</strong>
                {" "}desde tu inventario.
              </span>
            </li>
          </ul>
        </div>

        {/* Separador */}
        <div className="w-full h-px bg-emerald-500/30" />

        {/* Botón cerrar */}
        <button
          id="btn-ent-welcome-close"
          onClick={handleClose}
          className="mt-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95
                     text-white font-black py-3 px-10 rounded-2xl shadow-lg
                     transition-all duration-150 uppercase tracking-wider text-sm"
        >
          ¡Entendido! 🌿
        </button>

        <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest">
          Este mensaje solo aparece una vez
        </p>
      </div>
    </div>
  );
}
