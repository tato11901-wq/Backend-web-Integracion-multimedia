import { useState, useEffect, useCallback } from "preact/hooks"
import { addCompost, isCompostGameOpen } from "../../store/resourceStore"

// Definición de los 8 objetos (3 orgánicos, 5 inorgánicos)
// Los emojis serán reemplazados por imágenes después
const ALL_ITEMS = [
  { id: 1, emoji: "🍌", name: "Cáscara de plátano", organic: true },
  { id: 2, emoji: "🍎", name: "Corazón de manzana", organic: true },
  { id: 3, emoji: "🥚", name: "Cáscara de huevo", organic: true },
  { id: 4, emoji: "🥤", name: "Vaso de plástico", organic: false },
  { id: 5, emoji: "🔋", name: "Pila", organic: false },
  { id: 6, emoji: "📎", name: "Clip metálico", organic: false },
  { id: 7, emoji: "🛍️", name: "Bolsa de plástico", organic: false },
  { id: 8, emoji: "🥫", name: "Lata", organic: false },
]

/** Shuffle con Fisher-Yates */
function shuffle(array: typeof ALL_ITEMS) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type GameState = "idle" | "playing" | "won" | "lost"

export default function Compost() {
  const [items, setItems] = useState(() => shuffle(ALL_ITEMS))
  const [selected, setSelected] = useState<number[]>([])
  const [time, setTime] = useState(3)
  const [gameState, setGameState] = useState<GameState>("idle")

  // Solo renderiza si el estado global indica que está abierto
  if (!isCompostGameOpen.value) return null

  // Reinicia el juego cuando se abre
  const startGame = useCallback(() => {
    setItems(shuffle(ALL_ITEMS))
    setSelected([])
    setTime(3)
    setGameState("playing")
  }, [])

  // Temporizador
  useEffect(() => {
    if (gameState !== "playing") return
    if (time <= 0) {
      // Se acabó el tiempo — evaluar
      evaluateResult()
      return
    }

    const timer = setInterval(() => {
      setTime((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [time, gameState])

  const evaluateResult = () => {
    const organicIds = ALL_ITEMS.filter((i) => i.organic).map((i) => i.id)
    const selectedAll = organicIds.every((id) => selected.includes(id))
    const noWrongSelections = selected.every((id) =>
      organicIds.includes(id)
    )

    if (selectedAll && noWrongSelections) {
      setGameState("won")
      addCompost(1)
    } else {
      setGameState("lost")
    }
  }

  const handleSelect = (id: number) => {
    if (gameState !== "playing") return

    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id)
      }
      return [...prev, id]
    })
  }

  const handleClose = () => {
    setGameState("idle")
    setSelected([])
    setTime(3)
    isCompostGameOpen.value = false
  }

  return (
    <main class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-900/90 backdrop-blur-md">
      <section class="flex flex-col items-center justify-around w-[420px] bg-amber-400 rounded-2xl shadow-xl p-6 relative gap-4">

        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          class="absolute -top-3 -right-3 bg-red-500 hover:bg-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg"
          title="Cerrar"
        >
          X
        </button>

        {/* Estado idle — pantalla de inicio */}
        {gameState === "idle" && (
          <>
            <span class="text-black text-center text-lg font-bold">
              🌱 Minijuego de Composta
            </span>
            <p class="text-black text-center text-sm">
              Selecciona solo los objetos <strong>orgánicos</strong> en menos de 3 segundos.
            </p>
            <button
              onClick={startGame}
              class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-xl shadow-md transition"
            >
              ¡Empezar!
            </button>
          </>
        )}

        {/* Estado playing — juego activo */}
        {gameState === "playing" && (
          <>
            <span class="text-black text-center text-lg font-bold">
              ⏱️ Tiempo: {time}s — Selecciona los orgánicos
            </span>

            <div class="grid grid-cols-4 gap-3">
              {items.map((item) => {
                const isSelected = selected.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    class={`
                      w-20 h-20 rounded-xl flex flex-col items-center justify-center text-3xl
                      transition-all duration-150 cursor-pointer select-none
                      ${isSelected
                        ? "bg-green-300 border-4 border-green-700 scale-95 shadow-inner"
                        : "bg-white border-2 border-amber-600 hover:scale-105 hover:shadow-lg shadow-md"
                      }
                    `}
                    title={item.name}
                  >
                    <span>{item.emoji}</span>
                    <span class="text-[9px] text-black font-bold mt-1 leading-tight text-center">
                      {item.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Estado won — ganaste */}
        {gameState === "won" && (
          <>
            <span class="text-black text-center text-2xl font-bold">
              🎉 ¡Correcto!
            </span>
            <p class="text-black text-center text-sm">
              Seleccionaste todos los orgánicos correctamente. <br />
              +1 composta obtenida.
            </p>
            <button
              onClick={handleClose}
              class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-xl shadow-md transition"
            >
              Cerrar
            </button>
          </>
        )}

        {/* Estado lost — perdiste */}
        {gameState === "lost" && (
          <>
            <span class="text-black text-center text-2xl font-bold">
              ❌ ¡Fallaste!
            </span>
            <p class="text-black text-center text-sm">
              No seleccionaste correctamente los orgánicos. Inténtalo de nuevo.
            </p>
            <div class="flex gap-3">
              <button
                onClick={startGame}
                class="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-xl shadow-md transition"
              >
                Reintentar
              </button>
              <button
                onClick={handleClose}
                class="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-xl shadow-md transition"
              >
                Cerrar
              </button>
            </div>
          </>
        )}

      </section>
    </main>
  )
}
