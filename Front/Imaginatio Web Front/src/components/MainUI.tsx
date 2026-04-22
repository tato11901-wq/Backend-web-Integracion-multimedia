import { useState, useEffect } from "preact/hooks";
import { userId, syncUserState, username } from "../store/resourceStore";
import { login, fetchMyState, getToken } from "../store/apiClient";

import TopHeader from "./dashboard/TopHeader";
import LeftSigns from "./dashboard/LeftSigns";
import RightSigns from "./dashboard/RightSigns";
import GameArea from "./dashboard/GameArea";
import BottomActions from "./dashboard/BottomActions";
import Inventory from "./dashboard/Inventory";
import HelpModal from "./dashboard/HelpModal";
import Water from "./MiniGames/water";
import Compost from "./MiniGames/compost";
import Sun from "./MiniGames/sun";
import fondoMain from '../assets/Recursos web media/FondoMain.png';

export default function MainUI() {
  // "checking" evita el parpadeo: mientras no sabemos si hay token, no mostramos nada.
  const [authState, setAuthState] = useState<"checking" | "logged" | "guest">("checking");
  const [tempName, setTempName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken(); // solo se ejecuta en el cliente, nunca en SSR
    if (token) {
      fetchMyState()
        .then(res => {
          syncUserState(res);
          setAuthState("logged");
        })
        .catch(() => {
          // Token inválido o expirado → ir a login
          setAuthState("guest");
        });
    } else {
      setAuthState("guest");
    }
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setLoading(true);
    try {
      const res = await login(tempName);
      syncUserState(res.user);
      setAuthState("logged");
    } catch (err) {
      alert("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Mientras verifica el token: pantalla en negro sin parpadeo
  if (authState === "checking") {
    return <div className="flex h-screen w-full bg-[#1a2e0e]" />;
  }

  if (authState === "guest") {
    return (
      <div className="flex flex-col h-screen w-full bg-[#2d4a1d] items-center justify-center p-4">
        <div className="bg-[#f5e6c8] p-10 rounded-3xl border-8 border-[#4e341b] shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full">
           <span className="text-6xl animate-bounce">🌿</span>
           <h1 className="text-3xl font-black text-[#4e341b] uppercase text-center">Imaginatio</h1>
           <form onSubmit={handleLogin} className="flex flex-col w-full gap-4">
              <label className="text-sm font-bold text-[#4e341b] uppercase">Nombre de usuario</label>
              <input
                type="text"
                value={tempName}
                onInput={(e) => setTempName((e.target as HTMLInputElement).value)}
                placeholder="Ej: Jardinero88"
                className="w-full px-4 py-3 rounded-xl border-4 border-[#8B4513] bg-[#fff9eb] text-black font-bold focus:outline-none focus:ring-2 ring-green-600"
              />
              <button
                disabled={loading}
                className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-black py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
              >
                {loading ? "CARGANDO..." : "ENTRAR AL JARDÍN"}
              </button>
           </form>
           <p className="text-[10px] text-[#4e341b]/60 text-center uppercase tracking-tight">
             La sesión se guardará localmente en este navegador.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#8fb35b] font-sans relative overflow-hidden text-slate-100 transition-all select-none">
      <div className="absolute inset-0 z-0">
        <img src={fondoMain.src} alt="Fondo Invernadero" className="w-full h-full object-fill" />
      </div>

      <TopHeader />

      <div className="flex flex-row flex-grow w-full h-full relative z-10 mx-auto">
        <LeftSigns />
        <GameArea />
        <RightSigns />
        <BottomActions />
      </div>

      <Inventory />
      <HelpModal />

      {/* Minijuegos — se renderizan como overlay sobre todo */}
      <Water />
      <Compost />
      <Sun />
    </div>
  );
}

