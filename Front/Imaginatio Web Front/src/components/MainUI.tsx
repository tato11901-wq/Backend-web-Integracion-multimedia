import TopHeader from "./dashboard/TopHeader";
import LeftSigns from "./dashboard/LeftSigns";
import RightSigns from "./dashboard/RightSigns";
import GameArea from "./dashboard/GameArea";
import BottomActions from "./dashboard/BottomActions";

export default function MainUI() {
  return (
    // Fondo general simulando el huerto/Invernadero (Pixel Art Placeholder)
    <div className="flex flex-col h-[100dvh] w-full bg-[#8fb35b] font-sans relative overflow-hidden text-slate-100 transition-all select-none">
      
      {/* Background ambiente: un invernadero simple */}
      <div className="absolute inset-0 z-0 bg-slate-100 flex items-center justify-center">
         <span className="text-4xl text-slate-300 font-bold select-none">[Img: Gran Fondo Invernadero]</span>
      </div>

      <TopHeader />

      <div className="flex flex-row flex-grow w-full h-full relative z-10 mx-auto">
        <LeftSigns />
        <GameArea />
        <RightSigns />
        <BottomActions />
      </div>

    </div>
  )
}
