/* =========================================================================
   LE PAGINE — bio, collab, mail e contacts.
   -------------------------------------------------------------------------
   Quattro stanze che non sono spazi ma cose da leggere: una pagina
   verticale nella penombra, come la pagina di un lavoro dell'edificio. La
   testa (BIO, COLLAB...) e' quella del piano, e fa da titolo: qui dentro non
   si ripete.

   - BIO: il ritratto, una frase, e quattro risposte - chi sono, cosa
     faccio, come lavoro, con chi ho lavorato.
   - COLLAB: per chi crea con lei. I nomi, grandi, ognuno porta al suo
     lavoro nello showroom; in fondo, "vuoi lavorare con me?".
   - MAIL: una lettera da riempire - cosa ti serve, per quando, il budget.
     Non c'e' un server: si apre la posta con la lettera gia' scritta.
   - CONTACTS: i modi diretti, pochi e grandi.

   TUTTO IL TESTO E' SEGNAPOSTO, e sta qui sotto in due lingue. Gli
   indirizzi pure: l'email usa example.com, che e' un dominio riservato agli
   esempi e non arriva a nessuno; telefono, WhatsApp e Instagram si vedono ma
   non sono collegamenti finche' non sono veri.

   Dalla casa prende i colori (--fondo, --segno, --composto, --firma,
   --titolo, --stampatello) e due cose: PIANO.scrivi() e PIANO.vai(nome,
   opz), per passare a un'altra stanza.
   ========================================================================= */
(function () {
'use strict';

function fresco(f) { return f + (window.MARCA || ''); }
var LINGUA = window.LINGUA || (function () {
  var q = /[?&]lingua=(it|en)\b/.exec(location.search);
  if (q) return q[1];
  var l = (navigator.languages && navigator.languages[0]) || navigator.language || 'it';
  return /^it\b/i.test(l) ? 'it' : 'en';
})();
function tr(o) { return o && typeof o === 'object' && !Array.isArray(o) ? (o[LINGUA] || o.it) : o; }
function piano() { return window.PIANO || {}; }
function vai(nome, opz) { if (piano().vai) piano().vai(nome, opz); }
function scrivi() {
  if (piano().scrivi) piano().scrivi();
  else location.href = 'mailto:' + INDIRIZZO;
}

/* ------------------------------------------------------------------ *
 * I TESTI. Tutti segnaposto.
 * ------------------------------------------------------------------ */
var INDIRIZZO = 'nome@example.com';

var CHIUSA = {
  domanda: { it: 'Hai un lavoro in mente?', en: 'Have a project in mind?' },
  invito:  { it: 'Raccontami cosa ti serve e per quando: ti rispondo entro due giorni.',
             en: "Tell me what you need and by when: I'll get back to you within two days." },
  scrivimi: { it: 'Scrivimi', en: 'Write to me' }
};

var BIO = {
  dico: { it: 'Fotografo persone e vestiti, e aspetto il momento in cui smettono di posare.',
          en: 'I photograph people and clothes, and wait for the moment they stop posing.' },
  schede: [
    { d: { it: 'Chi sono', en: 'Who I am' },
      r: { it: 'Vittoria, fotografa e art director. Lavoro fra Milano e Torino, e dove serve.',
           en: 'Vittoria, photographer and art director. Based between Milan and Turin, and wherever the work is.' } },
    { d: { it: 'Cosa faccio', en: 'What I do' },
      r: { it: "Campagne e lookbook, editoriali, ritratti. E la direzione creativa di un set, dall'idea alla consegna.",
           en: 'Campaigns and lookbooks, editorials, portraits. And the creative direction of a shoot, from the idea to delivery.' } },
    { d: { it: 'Come lavoro', en: 'How I work' },
      r: { it: 'Con poche persone e molta preparazione: moodboard, sopralluogo, scaletta. Sul set si prova, non si improvvisa.',
           en: "With a small team and a lot of preparation: moodboard, location scouting, shot list. On set we try things; we don't improvise." } },
    { d: { it: 'Con chi ho lavorato', en: "Who I've worked with" },
      r: { it: 'Marchi di moda e di design, riviste, musicisti.',
           en: 'Fashion and design brands, magazines, musicians.' },
      vai: { testo: { it: 'Tutti i nomi sono in collab', en: 'All the names are in collab' }, dove: 'collab.svg' } }
  ]
};

/* i nomi di collab: ognuno porta alla stanza del suo lavoro nell'edificio */
var COLLAB = {
  attacco: { it: 'Un set si fa in tanti. Queste sono le persone e i marchi con cui ho lavorato.',
             en: "A shoot takes many hands. These are the people and brands I've worked with." },
  vedi: { it: 'Vedi il lavoro', en: 'See the work' },
  nomi: [
    { nome: 'Nome Cognome', chi: { it: 'Styling',           en: 'Styling' },           lavoro: 0 },
    { nome: 'Marchio Uno',  chi: { it: 'Cliente, campagna', en: 'Client, campaign' },  lavoro: 1 },
    { nome: 'Nome Cognome', chi: { it: 'Trucco e capelli',  en: 'Hair and make-up' },  lavoro: 2 },
    { nome: 'Rivista Due',  chi: { it: 'Editoriale',        en: 'Editorial' },         lavoro: 3 },
    { nome: 'Nome Cognome', chi: { it: 'Set design',        en: 'Set design' },        lavoro: 0 },
    { nome: 'Marchio Tre',  chi: { it: 'Cliente, lookbook', en: 'Client, lookbook' },  lavoro: 1 },
    { nome: 'Nome Cognome', chi: { it: 'Casting',           en: 'Casting' },           lavoro: 2 }
  ],
  domanda: { it: 'Vuoi lavorare con me?', en: 'Want to work together?' },
  invito: { it: 'Cerco stylist, truccatori, set designer e modelle per editoriali e progetti miei. Mandami il tuo portfolio.',
            en: "I'm looking for stylists, make-up artists, set designers and models for editorials and personal projects. Send me your portfolio." }
};

var POSTA = {
  attacco: { it: 'Scrivimi due righe: ti rispondo entro due giorni.',
             en: "Drop me a line: I'll get back to you within two days." },
  nome:   { it: 'Come ti chiami', en: 'Your name' },
  email:  { it: 'La tua email',   en: 'Your email' },
  cosa:   { it: 'Cosa ti serve',  en: 'What you need' },
  cose:   { it: ['Campagna', 'Lookbook', 'Editoriale', 'Ritratti', 'Altro'],
            en: ['Campaign', 'Lookbook', 'Editorial', 'Portraits', 'Other'] },
  quando: { it: 'Per quando',     en: 'By when' },
  quandoEs: { it: 'per esempio: fine novembre', en: 'for example: end of November' },
  budget: { it: 'Budget',         en: 'Budget' },
  budgets: { it: ['Fino a 1.000 €', '1.000 – 3.000 €', '3.000 – 10.000 €', 'Oltre 10.000 €', 'Non lo so ancora'],
             en: ['Up to €1,000', '€1,000 – 3,000', '€3,000 – 10,000', 'Over €10,000', 'Not sure yet'] },
  racconta: { it: 'Raccontami', en: 'Tell me more' },
  manda:  { it: 'Manda', en: 'Send' },
  oggetto: { it: 'Un lavoro insieme', en: 'Working together' },
  manca:  { it: 'Mi servono almeno la tua email e due righe.',
            en: 'I need at least your email and a couple of lines.' },
  fatto:  { it: 'Si è aperta la tua posta con la lettera già scritta: mandala da lì.',
            en: 'Your mail app has opened with the letter already written: send it from there.' }
};

/* i contatti: href a null finche' non sono veri, e allora non si toccano */
var CONTATTI = {
  righe: [
    { cosa: { it: 'Email', en: 'Email' },         val: INDIRIZZO, href: 'mailto:' + INDIRIZZO },
    { cosa: { it: 'Telefono', en: 'Phone' },      val: '+39 000 000 0000', href: null },
    { cosa: { it: 'WhatsApp', en: 'WhatsApp' },   val: { it: 'Scrivimi su WhatsApp', en: 'Message me on WhatsApp' }, href: null },
    { cosa: { it: 'Instagram', en: 'Instagram' }, val: '@nomeutente', href: null },
    { cosa: { it: 'Dove', en: 'Based in' },       val: { it: 'Milano, e dove serve', en: 'Milan, and wherever needed' }, href: null },
    { cosa: { it: 'Agenzia', en: 'Agency' },      val: { it: 'Nessuna, per ora', en: 'None, for now' }, href: null }
  ],
  lettera: { it: 'Oppure scrivimi una lettera', en: 'Or write me a letter' }
};

/* ------------------------------------------------------------------ *
 * LO STILE. Tutto sta a z-index 0, sotto la testa e il francobollo.
 * ------------------------------------------------------------------ */
var CSS = [
'.pg { position:fixed; inset:0; z-index:0; overflow-x:hidden; overflow-y:auto;',
'  -webkit-overflow-scrolling:touch; touch-action:pan-y; -webkit-user-select:text; user-select:text;',
'  opacity:0; transition:opacity .3s ease; }',
'.pg.acceso { opacity:1; transition:opacity .6s ease .15s; }',
'.pg-corpo { max-width:1100px; margin:0 auto; padding:clamp(130px, 24vh, 240px) clamp(20px, 5vw, 64px) 160px;',
'  transform:translateY(24px); transition:transform .3s ease; }',
'.pg.acceso .pg-corpo { transform:none; transition:transform .9s cubic-bezier(.2,.8,.2,1) .15s; }',
'.pg-stampa { font-family:var(--stampatello); font-weight:800; font-stretch:expanded;',
'  text-transform:uppercase; letter-spacing:.02em; line-height:1; }',
'.pg-attacco { margin:0 auto clamp(60px, 12vh, 130px); max-width:28ch; text-align:center;',
'  font-family:var(--titolo); font-style:italic; font-size:clamp(22px, 2.6vw, 34px);',
'  line-height:1.3; color:var(--composto); }',
'.pg :focus-visible { outline:2px solid var(--segno); outline-offset:4px; }',
/* LE SCHEDE: l'etichetta a sinistra in stampatello, il testo a destra */
'.pg-scheda { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,2fr); gap:clamp(14px, 4vw, 64px);',
'  align-items:baseline; padding:clamp(22px, 4vh, 40px) 0; border-top:1px solid var(--firma); }',
'.pg-scheda h2 { margin:0; font-size:clamp(15px, 1.4vw, 19px); color:var(--segno); }',
'.pg-scheda p { margin:0; max-width:36ch; font-family:var(--titolo); font-size:clamp(18px, 1.6vw, 23px);',
'  line-height:1.45; color:var(--composto); }',
'.pg-vai { display:inline-block; margin-top:.8em; padding:0; border:0; background:none; cursor:pointer;',
'  font-size:13px; color:var(--segno); letter-spacing:.06em; }',
'.pg-vai::after { content:" \\2192"; }',
'.pg-vai:hover { transform:translateX(6px); transition:transform .25s ease; }',
/* BIO: il ritratto e una frase */
'.pg-apre { display:grid; grid-template-columns:minmax(0,5fr) minmax(0,7fr); gap:clamp(28px, 6vw, 96px);',
'  align-items:center; margin:0 0 clamp(70px, 12vh, 130px); }',
'.pg-ritratto { position:relative; width:78%; aspect-ratio:4 / 5; margin:0 auto; }',
'.pg-ritratto .scatto { width:100%; height:100%; background:#8F8A80; }',
'.pg-ritratto .cornice { position:absolute; color:var(--segno); pointer-events:none;',
'  left:-7%; top:-10%; width:114%; height:120%; transform:rotate(-1.2deg); }',
'.pg-ritratto .cornice svg { display:block; width:100%; height:100%; overflow:visible; }',
'.pg-dico { margin:0; font-family:var(--titolo); font-style:italic; font-size:clamp(24px, 3vw, 42px);',
'  line-height:1.25; color:var(--composto); }',
/* COLLAB: i nomi, grandi */
'.pg-nomi { list-style:none; margin:0 0 clamp(80px, 14vh, 150px); padding:0; }',
'.pg-nomi li { border-top:1px solid var(--firma); }',
'.pg-nomi li:last-child { border-bottom:1px solid var(--firma); }',
'.pg-nomi button { display:grid; grid-template-columns:1fr auto; align-items:center; gap:4px 24px;',
'  width:100%; padding:clamp(16px, 3vh, 28px) 0; border:0; background:none; cursor:pointer; text-align:left; }',
'.pg-nome { font-size:clamp(26px, 4.4vw, 62px); color:var(--segno); transition:transform .3s cubic-bezier(.2,.9,.25,1); }',
'.pg-chi { grid-column:1; font-family:var(--titolo); font-style:italic; font-size:clamp(15px, 1.3vw, 18px); color:var(--firma); }',
'.pg-vedi { grid-column:2; grid-row:1 / span 2; font-size:12px; color:var(--segno); letter-spacing:.06em;',
'  opacity:0; transition:opacity .25s ease; }',
'.pg-vedi::after { content:" \\2192"; }',
'.pg-nomi button:hover .pg-nome, .pg-nomi button:focus-visible .pg-nome { transform:translateX(12px); }',
'.pg-nomi button:hover .pg-vedi, .pg-nomi button:focus-visible .pg-vedi { opacity:1; }',
'@media (hover: none) { .pg-vedi { opacity:.7; } }',
/* MAIL: la lettera */
'.pg-lettera { max-width:940px; margin:0 auto; }',
'.pg-campo { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,2fr); gap:clamp(12px, 3vw, 48px);',
'  align-items:baseline; padding:clamp(18px, 3vh, 30px) 0; border-top:1px solid var(--firma); }',
'.pg-campo > label, .pg-campo > span { font-size:clamp(14px, 1.3vw, 17px); color:var(--segno); }',
'.pg-campo input, .pg-campo textarea { display:block; box-sizing:border-box; width:100%; margin:0; padding:6px 0;',
'  border:0; border-bottom:1.5px solid rgba(255,255,255,.22); border-radius:0; background:none; outline:none;',
'  font-family:var(--titolo); font-size:clamp(18px, 1.6vw, 22px); color:var(--composto); caret-color:var(--segno);',
'  -webkit-appearance:none; appearance:none; }',
'.pg-campo textarea { min-height:7em; resize:vertical; line-height:1.45; }',
'.pg-campo input:focus, .pg-campo textarea:focus { border-bottom-color:var(--segno); }',
'.pg-campo ::placeholder { color:var(--firma); font-style:italic; opacity:1; }',
'.pg-scelte { display:flex; flex-wrap:wrap; gap:10px; }',
'.pg-scelte button { padding:9px 15px; border:1.5px solid var(--segno); border-radius:999px; background:none;',
'  cursor:pointer; font-size:12px; color:var(--segno); transition:background .2s ease, color .2s ease; }',
'.pg-scelte button[aria-pressed="true"] { background:var(--segno); color:var(--fondo); }',
'.pg-manda { display:flex; flex-direction:column; align-items:center; gap:10px; margin:clamp(40px, 7vh, 70px) auto 0;',
'  padding:0; border:0; background:none; cursor:pointer; color:var(--segno); transform:rotate(-2deg);',
'  transition:transform .28s cubic-bezier(.2,.9,.25,1); }',
'.pg-manda svg { display:block; width:clamp(120px, 12vw, 170px); height:auto; overflow:visible; }',
'.pg-manda span { font-size:17px; letter-spacing:.06em; }',
'.pg-manda:hover { transform:rotate(-2deg) translateY(-6px) scale(1.05); }',
'.pg-nota { min-height:1.6em; margin:1.4em auto 0; max-width:34ch; text-align:center; font-family:var(--titolo);',
'  font-style:italic; font-size:clamp(17px, 1.5vw, 20px); color:var(--composto); }',
/* CONTACTS: pochi e grandi */
'.pg-contatti { list-style:none; margin:0 0 clamp(70px, 12vh, 130px); padding:0; }',
'.pg-contatti li { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,3fr); gap:clamp(10px, 3vw, 48px);',
'  align-items:baseline; padding:clamp(16px, 3vh, 28px) 0; border-top:1px solid var(--firma); }',
'.pg-contatti li:last-child { border-bottom:1px solid var(--firma); }',
'.pg-cosa { font-family:var(--titolo); font-style:italic; font-size:clamp(15px, 1.3vw, 18px); color:var(--firma); }',
'.pg-val { display:inline-block; font-size:clamp(22px, 3.8vw, 54px); color:var(--segno); text-decoration:none;',
'  overflow-wrap:anywhere; transition:transform .3s cubic-bezier(.2,.9,.25,1); }',
'a.pg-val:hover, a.pg-val:focus-visible { transform:translateX(10px); }',
'.pg-altro { display:block; margin:0 auto; padding:0; border:0; background:none; cursor:pointer;',
'  font-size:clamp(15px, 1.4vw, 19px); color:var(--segno); letter-spacing:.04em; }',
'.pg-altro::after { content:" \\2192"; }',
/* IN FONDO: la stessa chiusura della pagina di un lavoro */
'.pg-chiusa { text-align:center; padding-top:clamp(20px, 6vh, 60px); }',
'.pg-chiusa h2 { margin:0 0 .4em; font-size:clamp(30px, 5vw, 72px); color:var(--segno); line-height:1; }',
'.pg-chiusa p { margin:0 auto 2em; max-width:32ch; font-family:var(--titolo); font-style:italic;',
'  font-size:clamp(18px, 1.6vw, 22px); line-height:1.45; color:var(--composto); }',
/* sul telefono una colonna sola */
'@media (max-width: 720px) {',
'  .pg-scheda, .pg-campo, .pg-contatti li, .pg-apre { grid-template-columns:1fr; }',
'  .pg-apre { gap:36px; }',
'  .pg-ritratto { width:70%; }',
'}'
].join('\n');
function stile() {
  if (document.getElementById('pagine-stile')) return;
  var s = document.createElement('style');
  s.id = 'pagine-stile'; s.textContent = CSS;
  document.head.appendChild(s);
}

/* i due disegni che servono: la busta (per scrivere) e la cornice alta
   (per il ritratto). Si chiedono una volta sola. */
var SEGNI = null;
function segni() {
  if (SEGNI) return SEGNI;
  function testo(f) { return fetch(fresco(f)).then(function (r) { if (!r.ok) throw f; return r.text(); }); }
  SEGNI = Promise.all([
    testo('mail.svg').then(function (t) {
      var svg = new DOMParser().parseFromString(t, 'image/svg+xml').documentElement;
      var fondo = svg.querySelector('rect'); if (fondo) fondo.remove();
      svg.querySelectorAll('path').forEach(function (p) { p.setAttribute('fill', 'currentColor'); });
      svg.removeAttribute('width'); svg.removeAttribute('height');
      svg.setAttribute('aria-hidden', 'true');
      return new XMLSerializer().serializeToString(svg);
    }).catch(function () { return ''; }),
    testo('cornice-alta.svg').catch(function () { return ''; })
  ]).then(function (v) { return { busta: v[0], cornice: v[1] }; });
  return SEGNI;
}

function el(tag, cls, txt) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt) e.textContent = txt;
  return e;
}
function scheda(d, r) {
  var s = el('section', 'pg-scheda');
  s.appendChild(el('h2', 'pg-stampa', tr(d)));
  var p = el('div');
  p.appendChild(el('p', '', tr(r)));
  s.appendChild(p);
  return s;
}
function chiusa(corpo, S, domanda, invito) {
  var f = el('footer', 'pg-chiusa');
  f.appendChild(el('h2', 'pg-stampa', tr(domanda)));
  f.appendChild(el('p', '', tr(invito)));
  var b = el('button', 'pg-manda'); b.type = 'button';
  b.innerHTML = S.busta;
  b.appendChild(el('span', 'pg-stampa', tr(CHIUSA.scrivimi)));
  b.addEventListener('click', scrivi);
  f.appendChild(b);
  corpo.appendChild(f);
}

/* ------------------------------------------------------------------ *
 * Le quattro pagine
 * ------------------------------------------------------------------ */
function bio(corpo, S) {
  var apre = el('div', 'pg-apre');
  var rit = el('div', 'pg-ritratto');
  rit.appendChild(el('div', 'scatto'));
  var c = el('div', 'cornice'); c.innerHTML = S.cornice; rit.appendChild(c);
  apre.appendChild(rit);
  apre.appendChild(el('p', 'pg-dico', tr(BIO.dico)));
  corpo.appendChild(apre);
  BIO.schede.forEach(function (q) {
    var s = scheda(q.d, q.r);
    if (q.vai) {
      var b = el('button', 'pg-vai pg-stampa', tr(q.vai.testo)); b.type = 'button';
      b.addEventListener('click', function () { vai(q.vai.dove); });
      s.lastChild.appendChild(b);
    }
    corpo.appendChild(s);
  });
  corpo.appendChild(el('div', '', '')).style.height = 'clamp(70px, 12vh, 130px)';
  chiusa(corpo, S, CHIUSA.domanda, CHIUSA.invito);
}

function collab(corpo, S) {
  corpo.appendChild(el('p', 'pg-attacco', tr(COLLAB.attacco)));
  var ul = el('ul', 'pg-nomi');
  COLLAB.nomi.forEach(function (n) {
    var li = el('li'), b = el('button'); b.type = 'button';
    b.appendChild(el('span', 'pg-nome pg-stampa', n.nome));
    b.appendChild(el('span', 'pg-vedi pg-stampa', tr(COLLAB.vedi)));
    b.appendChild(el('span', 'pg-chi', tr(n.chi)));
    /* al suo lavoro: nell'edificio, sulla soglia della sua stanza */
    b.addEventListener('click', function () { vai('showroom.svg', { lavoro: n.lavoro }); });
    li.appendChild(b); ul.appendChild(li);
  });
  corpo.appendChild(ul);
  chiusa(corpo, S, COLLAB.domanda, COLLAB.invito);
}

function posta(corpo, S) {
  corpo.appendChild(el('p', 'pg-attacco', tr(POSTA.attacco)));
  var f = el('form', 'pg-lettera'); f.noValidate = true;
  var n = 0;
  function campo(etichetta, dentro) {
    var c = el('div', 'pg-campo'), id = 'pg-c' + (++n);
    var l = el('label', 'pg-stampa', tr(etichetta)); l.htmlFor = id;
    dentro.id = id;
    c.appendChild(l); c.appendChild(dentro); f.appendChild(c);
    return dentro;
  }
  function scelte(etichetta, voci, tante) {
    var c = el('div', 'pg-campo'), g = el('div', 'pg-scelte');
    c.appendChild(el('span', 'pg-stampa', tr(etichetta)));
    g.setAttribute('role', 'group'); g.setAttribute('aria-label', tr(etichetta));
    tr(voci).forEach(function (v) {
      var b = el('button', 'pg-stampa', v); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        if (!tante) g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      g.appendChild(b);
    });
    c.appendChild(g); f.appendChild(c);
    return function () {
      return Array.prototype.filter.call(g.querySelectorAll('button'), function (x) {
        return x.getAttribute('aria-pressed') === 'true';
      }).map(function (x) { return x.textContent; }).join(', ');
    };
  }
  var nome = campo(POSTA.nome, el('input')); nome.type = 'text'; nome.autocomplete = 'name';
  var mail = campo(POSTA.email, el('input')); mail.type = 'email'; mail.autocomplete = 'email';
  var cosa = scelte(POSTA.cosa, POSTA.cose, true);
  var quando = campo(POSTA.quando, el('input')); quando.type = 'text'; quando.placeholder = tr(POSTA.quandoEs);
  var budget = scelte(POSTA.budget, POSTA.budgets, false);
  var testo = campo(POSTA.racconta, el('textarea')); testo.rows = 5;
  var manda = el('button', 'pg-manda'); manda.type = 'submit';
  manda.innerHTML = S.busta;
  manda.appendChild(el('span', 'pg-stampa', tr(POSTA.manda)));
  f.appendChild(manda);
  var nota = el('p', 'pg-nota'); nota.setAttribute('aria-live', 'polite');
  f.appendChild(nota);
  /* NON C'E' UN SERVER: la lettera si scrive nella posta di chi la manda,
     gia' riempita, e parte da li'. */
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!mail.value.trim() || !testo.value.trim()) { nota.textContent = tr(POSTA.manca); return; }
    var righe = [
      tr(POSTA.nome) + ': ' + nome.value.trim(),
      tr(POSTA.email) + ': ' + mail.value.trim(),
      tr(POSTA.cosa) + ': ' + cosa(),
      tr(POSTA.quando) + ': ' + quando.value.trim(),
      tr(POSTA.budget) + ': ' + budget(),
      '', testo.value.trim()
    ];
    var ogg = tr(POSTA.oggetto) + (nome.value.trim() ? ' — ' + nome.value.trim() : '');
    location.href = 'mailto:' + INDIRIZZO + '?subject=' + encodeURIComponent(ogg) +
                    '&body=' + encodeURIComponent(righe.join('\n'));
    nota.textContent = tr(POSTA.fatto);
  });
  corpo.appendChild(f);
}

function contatti(corpo) {
  var ul = el('ul', 'pg-contatti');
  CONTATTI.righe.forEach(function (r) {
    var li = el('li');
    li.appendChild(el('span', 'pg-cosa', tr(r.cosa)));
    var v;
    if (r.href) {
      v = el('a', 'pg-val pg-stampa', tr(r.val)); v.href = r.href;
      if (/^https?:/.test(r.href)) { v.target = '_blank'; v.rel = 'noopener'; }
    } else v = el('span', 'pg-val pg-stampa', tr(r.val));
    li.appendChild(v); ul.appendChild(li);
  });
  corpo.appendChild(ul);
  var b = el('button', 'pg-altro pg-stampa', tr(CONTATTI.lettera)); b.type = 'button';
  b.addEventListener('click', function () { vai('mail.svg'); });
  corpo.appendChild(b);
}

/* ------------------------------------------------------------------ *
 * Una stanza fatta di una pagina: il piano la accende e la spegne come le
 * altre. Una sola alla volta; quella che se ne va svanisce per conto suo.
 * ------------------------------------------------------------------ */
function stanza(nome, componi) {
  var acceso = false, pg = null, volta = 0;
  return {
    accendi: function (dove) {
      if (acceso) return true;
      acceso = true; var v = ++volta;
      stile();
      pg = el('article', 'pg pg-' + nome);
      var corpo = el('div', 'pg-corpo'); pg.appendChild(corpo);
      (dove || document.body).appendChild(pg);
      segni().then(function (S) {
        if (!acceso || v !== volta) return;
        componi(corpo, S);
        void pg.offsetWidth;
        pg.classList.add('acceso');
      });
      return true;
    },
    spegni: function () {
      if (!acceso) return;
      acceso = false; volta++;
      var p = pg;
      p.classList.remove('acceso');
      p.style.pointerEvents = 'none';
      setTimeout(function () { p.remove(); }, 350);
    },
    acceso: function () { return acceso; },
    indietro: function () { return false; },
    rifai: function () {}
  };
}

window.Bio      = stanza('bio', bio);
window.Collab   = stanza('collab', collab);
window.Posta    = stanza('mail', posta);
window.Contatti = stanza('contatti', contatti);
})();
