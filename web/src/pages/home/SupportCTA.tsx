import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

const WHATSAPP_URL = 'https://wa.me/59895301753';

export function SupportCTA() {
  return (
    <section className="md:mt-8 mt-0 md:px-0 px-4">
      <div
        className="rounded-2xl bg-cover bg-center bg-no-repeat text-white p-5 flex flex-col items-center text-center"
        style={{
          backgroundImage: "url('https://i.postimg.cc/gJCkP9FN/c2.png')",
        }}
      >
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold capitalize">¿Necesitás asesoramiento?</h3>
        <p className="text-sm text-white/85 mt-1">
          Nuestro equipo te ayuda
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="transition-all duration-200 hover:scale-105 active:scale-95 mt-4 inline-flex items-center justify-center h-10 px-6 rounded-lg bg-white text-brand text-sm font-bold active:scale-95 transition-transform"
        >
          Contactanos
        </a>
      </div>
    </section>
  );
}