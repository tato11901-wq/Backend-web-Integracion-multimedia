import { useState, useEffect, useCallback } from "preact/hooks"
import { isWaterGameOpen, syncUserState } from "../../store/resourceStore"
import { startMinigame, endMinigame } from "../../store/apiClient"

type GameState = "idle" | "loading" | "playing" | "submitting" | "won" | "lost"

export default function Water() {
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5)
  const [gameState, setGameState] = useState<GameState>("idle")
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  // Solo renderiza si el estado global indica que está abierto
  if (!isWaterGameOpen.value) return null

  // Iniciar sesión en el backend al presionar "EMPEZAR"
  const startGame = useCallback(async () => {
    setGameState("loading")
    setMessage("Iniciando sesión...")
    try {
      const res = await startMinigame("water")
      setSessionToken(res.session_token)
      setTimeLeft(res.duration_seconds)
      setClicks(0)
      setGameState("playing")
    } catch (err: any) {
      setMessage(err.message || "Error al iniciar el juego")
      setGameState("lost")
    }
  }, [])

  // Temporizador visual
  useEffect(() => {
    if (gameState !== "playing") return
    
    if (timeLeft <= 0) {
      handleGameOver()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, gameState])

  const handleGameOver = async () => {
    setGameState("submitting")
    setMessage("Validando resultado...")
    try {
      if (!sessionToken) throw new Error("No hay token de sesión")
      
      const res = await endMinigame(sessionToken, { clicks })
      syncUserState(res.user)
      
      if (res.reward > 0) {
        setMessage(`¡Excelente! Obtuviste ${res.reward} unidades de agua.`)
        setGameState("won")
      } else {
        setMessage("No se obtuvo agua esta vez. ¡Intenta ser más rápido!")
        setGameState("lost")
      }
    } catch (err: any) {
      setMessage(err.message || "Error al validar el resultado")
      setGameState("lost")
    }
  }

  const handleClick = () => {
    if (gameState === "playing") {
      setClicks((prev) => prev + 1)
    }
  }

  const handleClose = () => {
    setGameState("idle")
    setClicks(0)
    setTimeLeft(5)
    isWaterGameOpen.value = false
  }

  return (
    <main class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-900/90 backdrop-blur-md">
      <section class="flex flex-col items-center justify-around w-80 min-h-64 bg-amber-400 rounded-2xl shadow-xl p-6 relative border-4 border-amber-600 gap-4">
        
        {/* Botón Cerrar */}
        <button 
          onClick={handleClose}
          class="absolute -top-4 -right-4 bg-red-500 hover:bg-red-400 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95"
        >
          X
        </button>

        {/* Pantalla de Carga / Submitting */}
        {(gameState === "loading" || gameState === "submitting") && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-black font-bold text-center">{message}</span>
          </div>
        )}

        {/* Estado Idle - Pantalla de Inicio */}
        {gameState === "idle" && (
          <>
            <span class="text-black text-center text-xl font-black uppercase tracking-tight">
              💧 Minijuego de Agua
            </span>
            <div className="bg-blue-100/50 p-4 rounded-xl border-2 border-blue-500/30">
              <p class="text-black text-center text-sm font-medium">
                ¡Haz la mayor cantidad de clicks posibles en 5 segundos!
              </p>
            </div>
            <button
              onClick={startGame}
              class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition transform hover:-translate-y-1 active:translate-y-0"
            >
              ¡Regar!
            </button>
          </>
        )}

        {/* Estado Playing - Juego Activo */}
        {gameState === "playing" && (
          <>
            <div className="flex justify-between items-center w-full px-2">
              <span class="text-black text-center font-bold bg-blue-200 px-3 py-1 rounded-lg border border-blue-500">
                ⏱️ {timeLeft}s
              </span>
              <span class="text-black text-center font-bold bg-amber-200 px-3 py-1 rounded-lg border border-amber-500">
                🖱️ {clicks}
              </span>
            </div>

            <button 
              onClick={handleClick}
              class="text-8xl hover:scale-110 active:scale-95 transition transform-gpu drop-shadow-lg select-none mb-4"
            >
              💧
            </button>
            
            <p className="text-amber-900 text-[9px] font-black uppercase text-center tracking-tighter">
              ¡Dale a la gota para juntar agua!
            </p>
          </>
        )}

        {/* Pantallas de Resultado (Won/Lost) */}
        {(gameState === "won" || gameState === "lost") && (
          <div className="flex flex-col items-center gap-6 py-4">
            <span class={`text-center text-2xl font-black drop-shadow-sm ${gameState === "won" ? "text-blue-800" : "text-red-700"}`}>
              {gameState === "won" ? "¡TRABAJO BIEN HECHO!" : "¡SIGUE INTENTANDO!"}
            </span>
            <p class="text-black text-center font-medium bg-white/40 p-4 rounded-xl border border-white/60">
              {message}
            </p>
            <div class="flex gap-4">
              <button
                onClick={startGame}
                class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl shadow-md transition transform active:scale-95"
              >
                Reintentar
              </button>
              <button
                onClick={handleClose}
                class="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-xl shadow-md transition transform active:scale-95"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}