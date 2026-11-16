// Listas compartidas entre el panel y la API.

export const STATUSES = [
  { id: 'prospecto', label: 'Prospecto', hint: 'Hablamos, todavía sin propuesta' },
  { id: 'presupuestado', label: 'Presupuesto enviado', hint: 'Tiene modelo y/o presupuesto' },
  { id: 'aprobado', label: 'Aprobado', hint: 'Dijo que sí, falta arrancar' },
  { id: 'en_curso', label: 'En curso', hint: 'Trabajando' },
  { id: 'entregado', label: 'Entregado', hint: 'Terminado y funcionando' },
  { id: 'pausado', label: 'Pausado', hint: 'Quedó en espera' },
  { id: 'perdido', label: 'No se concretó', hint: 'Dijo que no o dejó de responder' },
];

export const KINDS = [
  'Agenda de turnos con seña',
  'Generador de piezas',
  'Landing / web',
  'Automatización / IA',
  'Tienda online',
  'Otro',
];

export const CURRENCIES = ['ARS', 'USD', 'PYG', 'BRL', 'EUR'];

export const SOURCES = ['Referido', 'Web', 'WhatsApp', 'Instagram', 'LinkedIn', 'TikTok', 'Agencia', 'Conocido', 'Otro'];

export const statusLabel = id => (STATUSES.find(s => s.id === id) || { label: id }).label;
