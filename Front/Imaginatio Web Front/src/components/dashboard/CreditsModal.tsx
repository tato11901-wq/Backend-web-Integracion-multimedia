import { isCreditsModalOpen } from "../../store/resourceStore";
import sandovalImg from "../../assets/Group Members/Sandoval_member.jpeg";
import andresImg from "../../assets/Group Members/andrs_member.jpeg";
import willyImg from "../../assets/Group Members/willy_member.jpeg";
import dannyImg from "../../assets/Group Members/Danny_member.jpeg";
import alcazarImg from "../../assets/Group Members/Alcazar_member.jpeg";
import nicolasImg from "../../assets/Group Members/Nicolas_member.jpeg";
import miguelImg from "../../assets/Group Members/Olivares_member.jpeg";
import placeholderImg from "../../assets/Group Members/PlaceHolder_member.jpeg";

interface Member {
  name: string;
  image?: any;
}

const CreditCard = ({ role, members }: { role: string, members: Member[] }) => {
  return (
    <div className="bg-[#f5e6c8] p-3 rounded-xl border-2 border-[#d4bc96] group cursor-pointer flex flex-col items-center transition-all duration-300 hover:bg-[#ffeecf] shadow-sm hover:shadow-md">
      <span className="font-bold text-[#8B4513] text-center mb-1">{role}</span>

      <div className="flex flex-row flex-wrap justify-center gap-x-8 gap-y-2 w-full">
        {members.map(m => (
          <div key={m.name} className="flex flex-col items-center">
            {/* Imagen que aparece al hacer hover */}
            <div className="max-h-0 opacity-0 group-hover:max-h-56 group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-end">
              <img
                src={m.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=8B4513&color=fff9eb&size=256&bold=true`}
                alt={m.name}
                className="w-32 h-32 rounded-2xl border-4 border-[#4e341b] shadow-xl mt-4 mb-3 object-cover"
              />
            </div>
            {/* Nombre */}
            <p className="font-bold text-[#5c3e21] drop-shadow-sm">{m.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CreditsModal() {
  if (!isCreditsModalOpen.value) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pointer-events-auto">
      <div
        className="bg-[#f5e6c8] w-[700px] max-w-[95%] max-h-[90%] rounded-3xl border-[12px] border-[#4e341b] shadow-2xl flex flex-col items-center relative p-8 animate-in zoom-in duration-200"
      >
        {/* Botón de cierre */}
        <button
          onClick={() => isCreditsModalOpen.value = false}
          className="absolute -top-3 -right-4 md:-right-15 w-14 h-14 bg-red-500 border-4 border-[#4e341b] rounded-full text-white font-black text-2xl flex items-center justify-center hover:bg-red-600 hover:scale-110 active:scale-90 transition-all shadow-[0_4px_0_#4e341b]"
        >
          X
        </button>

        {/* Header */}
        <div className="bg-[#4e341b] text-[#f5e6c8] w-[110%] py-4 -mt-14 mb-8 rounded-xl border-4 border-[#8B4513] shadow-lg text-center relative shrink-0">
          <h2 className="text-4xl font-black uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            CRÉDITOS
          </h2>
        </div>

        {/* Contenido de créditos */}
        <div className="w-full bg-[#fff9eb] border-4 border-[#8B4513] rounded-2xl p-6 text-center space-y-4 overflow-y-auto min-h-[300px] max-h-[700px] scrollbar-thin scrollbar-thumb-[#8B4513] scrollbar-track-[#f5e6c8]">
          <p className="text-xl font-bold text-[#4e341b] mb-6">

            Plantagochi es:
          </p>

          <div className="space-y-4 text-lg font-medium text-[#5c3e21]">
            <CreditCard role="Desarrollo Back-end" members={[{ name: "Alejandro Sandoval", image: sandovalImg.src }]} />
            <CreditCard role="Desarrollo Front-end" members={[{ name: "Andres Moya", image: andresImg.src }]} />
            <CreditCard role="Arte y Diseño" members={[{ name: "Andres Alcazar", image: alcazarImg.src }]} />
            <CreditCard role="Diseño de efectos visuales" members={[{ name: "William Cubillos", image: willyImg.src }]} />
            <CreditCard role="Automatizacion de animaciones" members={[{ name: "Nicolas Alarcón", image: nicolasImg.src }]} />
            <CreditCard role="Concepto original" members={[{ name: "Miguel Olivares", image: miguelImg.src }, { name: "Danny Bercelio", image: dannyImg.src }]} />
          </div>

          <p className="text-sm font-bold text-[#8B4513] mt-8 opacity-80">
            Agradecimientos especiales a todos los estudiantes participantes de la convocatoria y al grupo de desarrollo del curso de integracion multimedia MUL B de noveno semestre 2026-1.
          </p>

          <p className="text-sm font-bold text-[#8B4513] mt-8 opacity-80">
            ¡Gracias por jugar y cuidar a tu plantita! 🌱
          </p>
        </div>
      </div>
    </div>
  );
}
