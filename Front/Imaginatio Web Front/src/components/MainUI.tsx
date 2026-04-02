import TopHeader from "./dashboard/TopHeader";
import LeftSigns from "./dashboard/LeftSigns";
import RightSigns from "./dashboard/RightSigns";
import GameArea from "./dashboard/GameArea";
import BottomActions from "./dashboard/BottomActions";
import Inventory from "./dashboard/Inventory";
import fondoMain from '../assets/Recursos web media/FondoMain.png';

export default function MainUI() {
  return (
    // Fondo general simulando el huerto/Invernadero (Pixel Art Placeholder)
    <div className="flex flex-col h-[100dvh] w-full bg-[#8fb35b] font-sans relative overflow-hidden text-slate-100 transition-all select-none">

      {/* Background ambiente: un invernadero real - Escalado para mostrar todos los detalles */}
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

      {/* Modals and Overlays */}
      <Inventory />

    </div>
  )
}
