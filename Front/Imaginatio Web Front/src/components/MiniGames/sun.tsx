import { useState, useEffect, useCallback } from "preact/hooks"
import { isSunGameOpen, sunCooldownEnds, isSunOnCooldown, syncUserState } from "../../store/resourceStore"
import { startMinigame, sunClick } from "../../store/apiClient"
import btnMiniSol1 from "../../assets/Recursos web media/btn_MiniSol1.png"
import btnMiniSol2 from "../../assets/Recursos web media/btn_MiniSol2.png"
import btnMiniSol3 from "../../assets/Recursos web media/btn_MiniSol3.png"
import btnMiniSol4 from "../../assets/Recursos web media/btn_MiniSol4.png"
import btnMiniSol5 from "../../assets/Recursos web media/btn_MiniSol5.png"


type GameState = "idle" | "loading" | "playing" | "submitting" | "reveal" | "finished" | "error"

const TIER_COLORS: Record<number, string> = {
  1: "#f59e0b",
  2: "#f97316",
  3: "#ef4444",
  4: "#a855f7",
  5: "#eab308",
}

const TIER_LABELS: Record<number, string> = {
  1: "Bronce",
  2: "Plata",
  3: "Oro",
  4: "Diamante",
  5: "☀️ SOLAR",
}

const TIER_IMAGES: Record<number, any> = {
  1: btnMiniSol1,
  2: btnMiniSol2,
  3: btnMiniSol3,
  4: btnMiniSol4,
  5: btnMiniSol5,
}

const TOTAL_CLICKS = 4

export default function Sun() {
  const [gameState, setGameState] = useState<GameState>("idle")
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [currentTier, setCurrentTier] = useState(1)
  const [clicksRemaining, setClicksRemaining] = useState(TOTAL_CLICKS)
  const [clicksDone, setClicksDone] = useState(0)
  const [lastTierUp, setLastTierUp] = useState<boolean | null>(null)
  const [reward, setReward] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [shaking, setShaking] = useState(false)
  const [isClickDisabled, setIsClickDisabled] = useState(false)
  const [cdRemaining, setCdRemaining] = useState(0)

  // Countdown tick cada segundo cuando hay cooldown activo
  useEffect(() => {
    if (!isSunGameOpen.value) return
    const tick = () => {
      if (!sunCooldownEnds.value) { setCdRemaining(0); return }
      const secs = Math.ceil((new Date(sunCooldownEnds.value).getTime() - Date.now()) / 1000)
      setCdRemaining(secs > 0 ? secs : 0)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isSunGameOpen.value, sunCooldownEnds.value])

  if (!isSunGameOpen.value) return null

  const startGame = useCallback(async () => {
    setGameState("loading")
    setMessage("Preparando la caja...")
    try {
      const res = await startMinigame("sun")
      setSessionToken(res.session_token)
      setCurrentTier(1)
      setClicksRemaining(TOTAL_CLICKS)
      setClicksDone(0)
      setLastTierUp(null)
      setReward(null)
      setGameState("playing")
    } catch (err: any) {
      setMessage(err.message || "Error al iniciar el juego")
      setGameState("error")
    }
  }, [])

  const handleBoxClick = async () => {
    if (gameState !== "playing" || !sessionToken || isClickDisabled) return
    setIsClickDisabled(true)
    setShaking(true)
    setTimeout(() => setShaking(false), 400)

    try {
      const res = await sunClick(sessionToken)
      setCurrentTier(res.tier_after)
      setClicksRemaining(res.clicks_remaining)
      setClicksDone(res.click_number)
      setLastTierUp(res.tier_up)

      if (res.finished) {
        setReward(res.reward)
        if (res.user) syncUserState(res.user)
        if (res.cooldown_ends_at) sunCooldownEnds.value = res.cooldown_ends_at
        setGameState("reveal")
      }
    } catch (err: any) {
      setMessage(err.message || "Error al procesar el click")
      setGameState("error")
    } finally {
      // Pequeña pausa para evitar spam y dar tiempo a la animación
      setTimeout(() => setIsClickDisabled(false), 350)
    }
  }

  const handleClose = () => {
    setGameState("idle")
    setSessionToken(null)
    setCurrentTier(1)
    setClicksRemaining(TOTAL_CLICKS)
    setClicksDone(0)
    setLastTierUp(null)
    setReward(null)
    setMessage("")
    isSunGameOpen.value = false
  }

  const tierColor = TIER_COLORS[currentTier] ?? "#f59e0b"
  const tierLabel = TIER_LABELS[currentTier] ?? ""
  const tierImage = TIER_IMAGES[currentTier]
  const progress = (clicksDone / TOTAL_CLICKS) * 100

  return (
    <main class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-900/90 backdrop-blur-md">
      <section
        class="flex flex-col items-center justify-around w-80 min-h-72 rounded-2xl shadow-2xl p-6 relative border-4 gap-4 transition-all duration-300"
        style={{ backgroundColor: `${tierColor}22`, borderColor: tierColor }}
      >
        {/* Botón Cerrar */}
        <button
          onClick={handleClose}
          class="absolute -top-4 -right-4 bg-red-500 hover:bg-red-400 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95"
        >
          X
        </button>

        {/* Título */}
        <span class="text-white text-center text-xl font-black uppercase tracking-tight drop-shadow">
          ☀️ Premios solares
        </span>

        {/* Loading */}
        {(gameState === "loading" || gameState === "submitting") && (
          <div class="flex flex-col items-center gap-4 py-6">
            <div class="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span class="text-white font-bold text-center">{message}</span>
          </div>
        )}

        {/* Idle */}
        {gameState === "idle" && (
          <>
            <div class="bg-white/10 p-4 rounded-xl border border-white/20 text-center">
              <p class="text-white text-sm font-medium">
                Abre el premio con <strong>4 clicks</strong>.<br />
                Cada click puede subir el tier del premio.<br />
                ¡El tier final determina cuántos soles obtienes!
              </p>
              <div class="mt-4 flex flex-wrap justify-center items-center gap-2 text-[10px] text-white/90 font-black uppercase tracking-wider">
                <div class="flex items-center gap-1 bg-black/20 rounded-full pr-2 pl-1 py-0.5 border border-white/10">
                  <img src={btnMiniSol1.src} class="w-5 h-5 object-contain" alt="Bronce" />
                  <span>Bronce</span>
                </div>
                <span class="opacity-50">→</span>
                <div class="flex items-center gap-1 bg-black/20 rounded-full pr-2 pl-1 py-0.5 border border-white/10">
                  <img src={btnMiniSol3.src} class="w-5 h-5 object-contain" alt="Oro" />
                  <span>Oro</span>
                </div>
                <span class="opacity-50">→</span>
                <div class="flex items-center gap-1 bg-black/20 rounded-full pr-2 pl-1 py-0.5 border border-white/10">
                  <img src={btnMiniSol4.src} class="w-5 h-5 object-contain" alt="Diamante" />
                  <span>Diamante</span>
                </div>
                <span class="opacity-50">→</span>
                <div class="flex items-center gap-1 bg-black/20 rounded-full pr-2 pl-1 py-0.5 border border-white/10">
                  <img src={btnMiniSol5.src} class="w-5 h-5 object-contain" alt="Solar" />
                  <span>Solar</span>
                </div>
              </div>
            </div>

            {/* Cooldown activo: mostrar tiempo restante */}
            {isSunOnCooldown.value && cdRemaining > 0 ? (
              <div class="flex flex-col items-center gap-2">
                <div class="bg-black/30 border border-yellow-500/40 rounded-xl px-6 py-4 flex flex-col items-center gap-1">
                  <span class="text-yellow-300 text-xs font-bold uppercase tracking-widest">⏳ Recargando</span>
                  <span class="text-white text-3xl font-black tabular-nums">
                    {String(Math.floor(cdRemaining / 60)).padStart(2, "0")}:{String(cdRemaining % 60).padStart(2, "0")}
                  </span>
                  <span class="text-white/50 text-xs">Vuelve cuando el sol esté listo</span>
                </div>
              </div>
            ) : (
              <button
                onClick={startGame}
                class="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-10 rounded-xl shadow-lg transition transform hover:-translate-y-1 active:translate-y-0"
              >
                ¡Abrir Paquete!
              </button>
            )}
          </>
        )}


        {/* Playing */}
        {gameState === "playing" && (
          <>
            {/* Tier badge */}
            <div
              class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border-2 font-bold transition-all duration-300"
              style={{ borderColor: tierColor, backgroundColor: `${tierColor}33`, color: tierColor }}
            >
              <div className="flex items-center gap-2">
                <img src={tierImage.src} alt={`Tier ${currentTier}`} className="w-10 h-10 object-contain" />
                <span class="text-2xl font-black">Tier {currentTier}</span>
              </div>
              <span class="text-sm">{tierLabel}</span>
            </div>

            {/* Feedback del último click */}
            {lastTierUp !== null && (
              <span
                class={`text-sm font-bold transition-all duration-200 ${lastTierUp ? "text-green-400" : "text-white/60"}`}
              >
                {lastTierUp ? "⬆️ ¡Subiste de tier!" : "➡️ Mismo tier..."}
              </span>
            )}

            {/* Barra de progreso */}
            <div class="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: tierColor }}
              />
            </div>
            <span class="text-white/70 text-xs font-bold">
              Click {clicksDone} / {TOTAL_CLICKS}
            </span>

            {/* La caja */}
            <button
              onClick={handleBoxClick}
              disabled={isClickDisabled}
              class={`w-40 h-40 select-none transition-all duration-150 drop-shadow-lg flex items-center justify-center
                ${shaking ? "animate-bounce" : ""}
                ${isClickDisabled ? "opacity-70 cursor-not-allowed" : "hover:scale-110 active:scale-95 cursor-pointer"}`}
            >
              <img src={tierImage.src} alt={`Tier ${currentTier}`} className="w-full h-full object-contain" />
            </button>

            <p class="text-white/50 text-[9px] font-black uppercase tracking-tighter text-center">
              ¡Haz click en la caja!
            </p>
          </>
        )}

        {/* Reveal – click extra para abrir el premio */}
        {gameState === "reveal" && (
          <div class="flex flex-col items-center gap-4 py-2">
            {/* Tier badge */}
            <div
              class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border-2 font-bold transition-all duration-300"
              style={{ borderColor: tierColor, backgroundColor: `${tierColor}33`, color: tierColor }}
            >
              <div className="flex items-center gap-2">
                <img src={tierImage.src} alt={`Tier ${currentTier}`} className="w-10 h-10 object-contain" />
                <span class="text-2xl font-black">Tier {currentTier}</span>
              </div>
              <span class="text-sm">{tierLabel}</span>
            </div>

            {/* Caja con glow animado */}
            <div class="relative flex items-center justify-center">
              <div
                class="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse"
                style={{ backgroundColor: tierColor }}
              />
              <img
                src={tierImage.src}
                alt="Premio"
                class="w-32 h-32 object-contain relative z-10 drop-shadow-lg"
              />
            </div>

            <span class="text-white/70 text-sm font-bold text-center">
              ¡Tu premio está listo!
            </span>

            <button
              onClick={() => setGameState("finished")}
              class="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-10 rounded-xl shadow-lg transition transform hover:-translate-y-1 active:translate-y-0 animate-pulse"
            >
              ¡Abrir premio! 🎁
            </button>
          </div>
        )}

        {/* Finished */}
        {gameState === "finished" && reward !== null && (
          <div class="flex flex-col items-center gap-4 py-2">
            <span class="text-4xl">{reward >= 4 ? "🌟" : reward >= 2 ? "😊" : "😐"}</span>
            <span class="text-white text-2xl font-black text-center drop-shadow">
              {reward >= 5 ? "¡PERFECTO!" : reward >= 3 ? "¡BIEN HECHO!" : "¡Resultado!"}
            </span>
            <div
              class="flex flex-col items-center gap-1 px-6 py-3 rounded-xl border-2 font-bold"
              style={{ borderColor: tierColor, backgroundColor: `${tierColor}33`, color: "white" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">Tier alcanzado:</span>
                <img src={tierImage.src} className="w-10 h-10 object-contain" alt={tierLabel} />
                <span className="text-lg">{tierLabel}</span>
              </div>
              <span class="text-3xl font-black text-yellow-300">+{reward} ☀️ Sol{reward !== 1 ? "es" : ""}</span>
            </div>
            <div class="flex gap-3 mt-2">
              <button
                onClick={startGame}
                class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-5 rounded-xl shadow-md transition transform active:scale-95"
              >
                Jugar de nuevo
              </button>
              <button
                onClick={handleClose}
                class="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-5 rounded-xl shadow-md transition transform active:scale-95"
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {gameState === "error" && (
          <div class="flex flex-col items-center gap-4 py-4">
            <span class="text-red-400 text-2xl font-black text-center">⚠️ Error</span>
            <p class="text-white text-center text-sm bg-white/10 p-3 rounded-xl">{message}</p>
            <div class="flex gap-3">
              <button
                onClick={startGame}
                class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-5 rounded-xl shadow-md transition active:scale-95"
              >
                Reintentar
              </button>
              <button
                onClick={handleClose}
                class="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-5 rounded-xl shadow-md transition active:scale-95"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
