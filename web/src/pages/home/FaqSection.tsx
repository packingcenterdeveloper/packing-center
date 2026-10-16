import { HiChevronDown } from 'react-icons/hi2';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cómo aplico un cupón de descuento?',
    answer:
      'En el carrito, ingresá el código del cupón en el campo "¿Tenés un cupón?" y presioná "Aplicar". El descuento se aplica automáticamente al total del pedido.',
  },
  {
    question: '¿Cuáles son los métodos de pago?',
    answer:
      'Aceptamos Mercado Pago (tarjetas de crédito, débito y dinero en cuenta).',
  },
  {
    question: '¿Hacen envíos a todo el país?',
    answer:
      'Sí, enviamos a todo Uruguay. En Montevideo y algunas ciudades de Canelones el envío es gratis. Al resto del país llega por DAC, con el costo a cobrar al retirar.',
  },
  {
    question: '¿Cómo funciona el stock?',
    answer:
      'Actualizamos el stock en tiempo real. Si un producto figura sin stock, no está disponible para comprar hasta que lo repongamos.',
  },
];

export function FaqSection() {
  return (
    <section className="mt-8 px-4">
      <h2 className="text-base font-bold text-slate-900 mb-3">
        Preguntas frecuentes
      </h2>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-slate-200 bg-white overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none">
              <span className="text-sm font-medium text-slate-900">
                {item.question}
              </span>
              <HiChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-3 text-sm text-slate-600 leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}