/* ---------------- contact: fill these two in ---------------- */
const CONTACT = {
  whatsapp: '5491123866633',  // número con código de país, sin + ni espacios, ej. 5491112345678
  email: 'fabian.mareco.dev@gmail.com',
};
/* pauta de escritura: el mensaje llega prellenado con una guía corta, para que la persona
   complete lo que hace falta saber en el primer contacto (quién es, qué le pasa, qué quiere lograr) */
const guide = (hello, rows) => hello + '\n\n' + rows.map(([label, value]) => label + ': ' + (value || '')).join('\n');
const T = {
  es: {
    mailSubject: 'Proyecto',
    msg: t => guide('Hola Fabián, te escribo desde tu web.', [
      ['Mi nombre y mi negocio'],
      ['Desde dónde escribo (ciudad / país)'],
      ['El problema', t ? '«' + t + '»' : ''],
      ['Cómo lo resuelvo hoy'],
      ['Qué me gustaría lograr'],
      ['Para cuándo lo necesito'],
    ]),
  },
  en: {
    mailSubject: 'Project',
    msg: t => guide('Hi Fabián, I\'m writing from your website.', [
      ['My name and my business'],
      ['Where I\'m writing from (city / country)'],
      ['The problem', t ? '"' + t + '"' : ''],
      ['How I handle it today'],
      ['What I\'d like to achieve'],
      ['When I need it by'],
    ]),
  },
  pt: {
    mailSubject: 'Projeto',
    msg: t => guide('Olá Fabián, estou escrevendo pelo seu site.', [
      ['Meu nome e meu negócio'],
      ['De onde escrevo (cidade / país)'],
      ['O problema', t ? '"' + t + '"' : ''],
      ['Como resolvo isso hoje'],
      ['O que eu gostaria de conseguir'],
      ['Para quando preciso'],
    ]),
  },
};
const LANG_CODE = { es: 'es', en: 'en', pt: 'pt-BR' };
let lang = 'es';
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function contactLinks() {
  // a "Hablemos de esto" menu carries its topic, so the WhatsApp message already names the problem
  document.querySelectorAll('[data-contact="wa"]').forEach(a => {
    const t = a.closest('[data-topic]');
    const topic = t ? (lang === 'es' ? t.dataset.topic : t.dataset['topic' + cap(lang)] || t.dataset.topic) : '';
    a.href = 'https://wa.me/' + CONTACT.whatsapp + '?text=' + encodeURIComponent(T[lang].msg(topic));
  });
  document.querySelectorAll('[data-contact="mail"]').forEach(a => {
    const t = a.closest('[data-topic]');
    const topic = t ? (lang === 'es' ? t.dataset.topic : t.dataset['topic' + cap(lang)] || t.dataset.topic) : '';
    a.href = 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent(T[lang].mailSubject) + '&body=' + encodeURIComponent(T[lang].msg(topic));
  });
  if (!/\.example$/.test(CONTACT.email)) document.querySelectorAll('[data-contact-text="mail"]').forEach(s => { s.removeAttribute('data-en'); s.removeAttribute('data-pt'); s.textContent = CONTACT.email; });
}

/* ---------------- "Hablemos" menus ---------------- */
document.addEventListener('click', e => {
  const btn = e.target.closest('.talk__btn');
  document.querySelectorAll('.talk.is-open').forEach(t => { if (!btn || !t.contains(btn)) { t.classList.remove('is-open'); t.querySelector('.talk__btn').setAttribute('aria-expanded', 'false'); } });
  if (btn) { const t = btn.closest('.talk'), open = !t.classList.contains('is-open'); t.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); if (open) t.querySelector('.talk__menu a').focus({ preventScroll: true }); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.talk.is-open').forEach(t => { t.classList.remove('is-open'); const b = t.querySelector('.talk__btn'); b.setAttribute('aria-expanded', 'false'); b.focus(); }); });

/* ---------------- language: es / en / pt ---------------- */
const ATTRS = ['aria-label', 'alt'];
function setLang(next) {
  if (!T[next]) next = 'es';
  lang = next;
  document.documentElement.lang = LANG_CODE[next];
  document.querySelectorAll('[data-en]').forEach(el => {
    if (!('es' in el.dataset)) el.dataset.es = el.textContent;
    el.textContent = next === 'es' ? el.dataset.es : (el.dataset[next] || el.dataset.en);
  });
  ATTRS.forEach(at => document.querySelectorAll('[data-en-' + at + ']').forEach(el => {
    const k = 'orig' + cap(at.replace('-l', 'L'));
    if (!(k in el.dataset)) el.dataset[k] = el.getAttribute(at) || '';
    el.setAttribute(at, next === 'es' ? el.dataset[k] : (el.getAttribute('data-' + next + '-' + at) || el.getAttribute('data-en-' + at)));
  }));
  document.querySelectorAll('[data-set-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setLang === next)));
  contactLinks();
  try { localStorage.setItem('fm-lang', next); } catch (e) {}
}
document.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.setLang)));

/* ---------------- Estilo Vallejos: "take a look" ---------------- */
const peek = document.getElementById('peek');
if (peek) {
  document.querySelectorAll('[data-peek]').forEach(b => b.addEventListener('click', () => peek.showModal ? peek.showModal() : peek.setAttribute('open', '')));
  peek.querySelector('[data-peek-close]').addEventListener('click', () => peek.close());
  peek.addEventListener('click', e => { if (e.target === peek) peek.close(); });
}

contactLinks();
const start = document.documentElement.dataset.startLang;
if (start && start !== 'es') setLang(start);
