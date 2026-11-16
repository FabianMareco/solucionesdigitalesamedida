/* ---------------- contact: fill these two in ---------------- */
const CONTACT = {
  whatsapp: '',               // número con código de país, sin + ni espacios, ej. 5491112345678
  email: 'hola@fabianmareco.example',
};
const T = {
  es: { wa: 'Hola Fabián, quiero hablar sobre un proyecto.', mailSubject: 'Proyecto', topic: t => 'Hola Fabián, tengo este problema: «' + t + '». ¿Me ayudás?' },
  en: { wa: 'Hi Fabián, I\'d like to talk about a project.', mailSubject: 'Project', topic: t => 'Hi Fabián, I have this problem: "' + t + '". Can you help me?' },
  pt: { wa: 'Olá Fabián, quero conversar sobre um projeto.', mailSubject: 'Projeto', topic: t => 'Olá Fabián, tenho este problema: "' + t + '". Pode me ajudar?' },
};
const LANG_CODE = { es: 'es', en: 'en', pt: 'pt-BR' };
let lang = 'es';
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function contactLinks() {
  // a "Hablemos de esto" menu carries its topic, so the WhatsApp message already names the problem
  document.querySelectorAll('[data-contact="wa"]').forEach(a => {
    const t = a.closest('[data-topic]');
    const topic = t ? (lang === 'es' ? t.dataset.topic : t.dataset['topic' + cap(lang)] || t.dataset.topic) : '';
    a.href = 'https://wa.me/' + CONTACT.whatsapp + '?text=' + encodeURIComponent(topic ? T[lang].topic(topic) : T[lang].wa);
  });
  document.querySelectorAll('[data-contact="mail"]').forEach(a => { a.href = 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent(T[lang].mailSubject); });
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
