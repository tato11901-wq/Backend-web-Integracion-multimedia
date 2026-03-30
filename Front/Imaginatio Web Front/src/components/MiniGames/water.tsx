import { useState, useEffect } from "preact/hooks"
import { addWater, isWaterGameOpen } from "../../store/resourceStore"

export default function Water() {

  const [clicks, setClicks] = useState(0)
  const [time, setTime] = useState(10)

  // Solo renderiza si el estado global indica que está abierto
  if (!isWaterGameOpen.value) return null;

  useEffect(() => {
    if (time > 0 && time < 10) {
      const timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)

      return () => clearInterval(timer)
    }

    if (time === 0) {
      alert(`Se acabó el tiempo! Hiciste ${clicks} clicks`)

      // ✅ Actualiza el store global
      addWater(clicks)

      setClicks(0)
      setTime(10) // reinicia juego

      // Cierra el mini juego
      isWaterGameOpen.value = false
    }

  }, [time])

  useEffect(() => {
    if (clicks === 1) {
      setTime(9)
    }
  }, [clicks])

  const handleClick = () => {
    if (time > 0) {
      setClicks(clicks + 1)
    }
  }

  return (
    <main class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-900/90 backdrop-blur-md">

      <section class="flex flex-col items-center justify-around w-80 h-60 bg-amber-400 rounded-2xl shadow-xl p-4 relative">
        <button 
          onClick={() => isWaterGameOpen.value = false}
          class="absolute -top-3 -right-3 bg-red-500 hover:bg-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg"
          title="Cerrar x"
        >
          X
        </button>

        <span class="text-black text-center text-lg font-bold">
          Tienes {time} segundos para hacer click en el agua
        </span>

        <div class="flex items-center w-full justify-around">

          <span class="text-black text-lg font-bold">
            Clicks: {clicks}
          </span>

          <button 
            onClick={handleClick}
            class="text-6xl text-blue-800 hover:scale-110 active:scale-95 transition"
          >
            💧
          </button>

        </div>

      </section>

    </main>
  )
}