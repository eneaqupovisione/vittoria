/* =========================================================================
   L'EDIFICIO — la stanza di "showroom".
   -------------------------------------------------------------------------
   Nasce da ../blu-settori.html, rifatto nella penombra del piano. Dal 21
   settembre 2026 prende il posto di galleria e set (provini.js, elica.js).

   LO SHOWROOM VA DAL BUIO AL BIANCO (22 settembre 2026). Si entra nella
   penombra del piano - lo stesso colore, nessuno stacco - e mentre si
   cammina schiarisce piano piano, fino al bianco della stanza della posta.
   IL SEGNO GIRA A META' STRADA: bianco finche' la stanza e' scura, poi
   d'inchiostro, cioe' della penombra stessa. Il giro avviene dove i due
   hanno lo stesso contrasto, e dura poco: e' l'unico momento in cui i
   tratti si fanno deboli, e passa camminando.
   Per non ridisegnare niente, tutto quel che e' segno - pennarello, cornici,
   cartelli - e' fatto BIANCO e si tinge col colore del materiale.

   Una stanza per lavoro, a serpentina. Sul muro in faccia il RUOLO, grande,
   e sotto il titolo piccolo; sugli altri muri le fotografie con le cornici
   disegnate. Gli spigoli sono tratti di pennarello, i muri sono del colore
   della pagina: si vedono solo i segni, e quel che sta dietro un muro non
   si disegna.

   Toccando una fotografia si apre LA PAGINA DEL LAVORO: verticale, le foto
   a destra e a sinistra, accanto le risposte a quel che chiederebbe chi
   vuole commissionarle un lavoro. In fondo, scrivimi.

   IL GIRO FINISCE SEMPRE IN POSTA: dopo l'ultimo lavoro c'e' una stanza
   vuota, e sul muro solo "hai un lavoro in mente?".

   Lo stesso motore sta in due case: il piano (piano.html, dietro showroom)
   e la prova da sola (edificio.html). Dalla casa prende i colori - chiede
   alla pagina --fondo, --segno, --composto, --firma, --titolo e
   --stampatello - e una cosa sola: PIANO.scrivi(), per andare a scrivere. La freccia e l'Esc sono
   della casa: chiedono a Edificio.indietro() se ha qualcosa da chiudere.

   USA THREE.JS DAL CDN, e lo chiede solo entrando. E' l'unico modulo di
   drawings/ con una libreria: il tuffo e' stato riscritto senza, questo
   ancora no.
   ========================================================================= */
window.Edificio = (function () {
'use strict';

var TRE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
function fresco(f) { return f + (window.MARCA || ''); }

/* ------------------------------------------------------------------ *
 * LA LINGUA. Chi ha il browser in italiano legge in italiano, tutti gli
 * altri in inglese. La casa puo' deciderlo prima (window.LINGUA), e
 * ?lingua=en nell'indirizzo lo forza, per guardarlo.
 * ------------------------------------------------------------------ */
var LINGUA = window.LINGUA || (function () {
  var q = /[?&]lingua=(it|en)\b/.exec(location.search);
  if (q) return q[1];
  var l = (navigator.languages && navigator.languages[0]) || navigator.language || 'it';
  return /^it\b/i.test(l) ? 'it' : 'en';
})();
function tr(o) { return o && typeof o === 'object' && !Array.isArray(o) ? (o[LINGUA] || o.it) : o; }

/* ------------------------------------------------------------------ *
 * I LAVORI. Titoli e ruoli sono SEGNAPOSTO; le tinte vengono dal mazzo di
 * provini.js, mescolato allo stesso modo. Il titolo puo' mancare.
 * ------------------------------------------------------------------ */
/* QUATTRO, PER ORA: con la posta fanno cinque stanze. Basta aggiungerne
   qui, e l'edificio si allunga da solo. */
var LAVORI = [
  { titolo: { it: 'Titolo uno',     en: 'Title one' },    ruolo: { it: 'Fotografia e art direction',   en: 'Photography and art direction' } },
  { titolo: { it: 'Titolo due',     en: 'Title two' },    ruolo: { it: 'Fotografia',                   en: 'Photography' } },
  { titolo: { it: 'Titolo tre',     en: 'Title three' },  ruolo: { it: 'Direzione creativa',           en: 'Creative direction' } },
  { titolo: { it: 'Titolo quattro', en: 'Title four' },   ruolo: { it: 'Fotografia e styling',         en: 'Photography and styling' } }
];

/* Le domande di chi vuole commissionarle un lavoro. Le risposte sono
   SEGNAPOSTO, uguali per tutti: quelle vere andranno dentro LAVORI. */
var DOMANDE = [
  { d: { it: 'Per chi', en: 'Who for' },
    r: { it: "Un marchio di maglieria del biellese, per la collezione d'autunno.",
         en: 'A knitwear label from Biella, for its autumn collection.' } },
  { d: { it: 'Cosa serviva', en: 'The brief' },
    r: { it: 'Dodici immagini per il lookbook e tre per la campagna, da usare in stampa e sui social.',
         en: 'Twelve images for the lookbook and three for the campaign, for print and social media.' } },
  { d: { it: 'Come', en: 'How' },
    r: { it: 'Due giorni di set in una casa sul lago, solo luce naturale. Moodboard e scaletta condivise una settimana prima: sul set non si decide niente a caso.',
         en: 'Two days on set in a lakeside house, natural light only. Moodboard and shot list shared a week ahead: nothing on set is left to chance.' } },
  { d: { it: 'Perché così', en: 'Why this way' },
    r: { it: "La maglia doveva sembrare vissuta, non esposta. Niente studio e niente fondale: pose prese fra una cosa e l'altra.",
         en: 'The knitwear had to look lived in, not on display. No studio, no backdrop: poses caught in between things.' } },
  { d: { it: "Chi c'era", en: 'The team' },
    r: { it: "Vittoria alla fotografia e all'art direction, con una stylist, una truccatrice e un'assistente alle luci.",
         en: 'Vittoria on photography and art direction, with a stylist, a make-up artist and a lighting assistant.' } },
  { d: { it: 'Tempi e consegna', en: 'Timing and delivery' },
    r: { it: 'Dal primo incontro alla consegna, tre settimane. Trenta file ritoccati, in verticale e in orizzontale.',
         en: 'Three weeks from first meeting to delivery. Thirty retouched files, in portrait and landscape.' } }
];
var PAROLE = {
  attacco: { it: 'Una collezione di maglieria raccontata fuori dallo studio, in due giorni di luce naturale.',
             en: 'A knitwear collection told outside the studio, over two days of natural light.' },
  domanda: { it: 'Hai un lavoro in mente?', en: 'Have a project in mind?' },
  muro:    { it: ['HAI UN LAVORO', 'IN MENTE?'], en: ['HAVE A PROJECT', 'IN MIND?'] },
  invito:  { it: 'Raccontami cosa ti serve e per quando: ti rispondo entro due giorni.',
             en: "Tell me what you need and by when: I'll get back to you within two days." },
  scrivimi: { it: 'Scrivimi', en: 'Write to me' },
  oggetto: { it: 'Un lavoro insieme', en: 'Working together' },
  tela:    { it: "L'edificio: scorri per camminare, tocca una fotografia per aprire il lavoro",
             en: 'The building: scroll to walk, tap a photograph to open the project' }
};
/* l'indirizzo vero non c'e' ancora: senza la casa, si apre la posta con
   l'oggetto gia' scritto */
function scrivi() {
  if (window.PIANO && window.PIANO.scrivi) { window.PIANO.scrivi(); return; }
  location.href = 'mailto:?subject=' + encodeURIComponent(tr(PAROLE.oggetto));
}

var FORMATI = [
  { l: 20, a: 30 }, { l: 30, a: 20 }, { l: 12, a: 18 }, { l: 18, a: 12 },
  { l: 23, a: 23 }, { l: 15, a: 15 }, { l: 24, a: 30 }, { l: 30, a: 24 },
  { l: 13, a: 18 }, { l: 21, a: 21 }
];
var TINTE = ['#14B3A3', '#2B54C8', '#F5B301', '#E86FA6', '#6B3FD4', '#F07422', '#C9C2B6'];
/* le cornici disegnate e quanto gonfiarle: i numeri sono quelli di provini.js */
var FILE_CORNICI = { quadra: 'cornice-quadra.svg', alta: 'cornice-alta.svg', larga: 'cornice-larga.svg' };
var GONFIA = { quadra: [1.19, 1.18], alta: [1.13, 1.20], larga: [1.20, 1.13] };

function caso(i, n) { var x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); }
function qualeCornice(f) { return f.l === f.a ? 'quadra' : (f.a > f.l ? 'alta' : 'larga'); }
var mazzo = TINTE.slice();
for (var q = mazzo.length - 1; q > 0; q--) {
  var j = (caso(q, 9) * (q + 1)) | 0, t = mazzo[q]; mazzo[q] = mazzo[j]; mazzo[j] = t;
}

/* ------------------------------------------------------------------ *
 * LA PIANTA. Le misure di Blu. Le stanze vanno a serpentina e ognuna
 * gira: cosi' il muro che si ha in faccia entrando e' sempre pieno.
 * In fondo, dopo l'ultimo lavoro, la stanza della posta.
 * ------------------------------------------------------------------ */
var HALF = 7, RH = 5, CW = 3.2, CH = 3.2, T = 0.2, EYE = 1.65, PASSO = 24, CORR = PASSO - 2 * HALF;
var CM = 0.07;                         // un centimetro di stampa, in metri di stanza
var OPP = { N:'S', S:'N', E:'W', W:'E' };
var DIR = { N:[0,-1], S:[0,1], E:[1,0], W:[-1,0] };
var DENTRO = { N:[0,0,1], S:[0,0,-1], E:[-1,0,0], W:[1,0,0] };   // la normale verso la stanza

var STANZE = LAVORI.concat([null]).map(function (lav, i, tutte) {
  var esce = i === tutte.length - 1 ? null : (i % 2 ? 'N' : (i % 4 === 0 ? 'E' : 'W'));
  return { lav: lav, posta: !lav, i: i, esce: esce, tinta: mazzo[i % mazzo.length] };
});
STANZE.forEach(function (r, i) {
  if (i === 0) { r.c = [0, 0]; r.entra = 'S'; return; }
  var p = STANZE[i - 1], d = DIR[p.esce];
  r.c = [p.c[0] + d[0] * PASSO, p.c[1] + d[1] * PASSO];
  r.entra = OPP[p.esce];
});

/* IL PERCORSO: da un centro all'altro, con le curve dentro le stanze. Si
   parte dal corridoio d'ingresso della prima. */
var PTS = [[0, HALF + CORR]];
STANZE.slice(0, -1).forEach(function (r) { PTS.push(r.c); });
(function () {
  var u = STANZE[STANZE.length - 1], d = DIR[OPP[u.entra]];
  PTS.push([u.c[0] + d[0] * 12, u.c[1] + d[1] * 12]);
})();
var R = 4, parti = [], acc = 0;
(function () {
  for (var i = 0; i < PTS.length - 1; i++) {
    var a = PTS[i], b = PTS[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    var d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    var t0 = i === 0 ? 0 : R, t1 = i === PTS.length - 2 ? L : L - R;
    parti.push({ t: 'l', s0: acc, len: t1 - t0, a: [a[0] + d[0] * t0, a[1] + d[1] * t0], d: d }); acc += t1 - t0;
    if (i < PTS.length - 2) {
      var c2 = PTS[i + 2], L2 = Math.hypot(c2[0] - b[0], c2[1] - b[1]);
      var dn = [(c2[0] - b[0]) / L2, (c2[1] - b[1]) / L2], al = Math.PI * R / 2;
      parti.push({ t: 'a', s0: acc, len: al, c: [b[0] - d[0] * R + dn[0] * R, b[1] - d[1] * R + dn[1] * R], di: d, dn: dn });
      acc += al;
    }
  }
})();
var S_END = acc - 14;
function at(v) {
  var p = parti[parti.length - 1];
  for (var i = 0; i < parti.length; i++) if (v < parti[i].s0 + parti[i].len) { p = parti[i]; break; }
  var u = Math.max(0, v - p.s0);
  if (p.t === 'l') return [p.a[0] + p.d[0] * u, p.a[1] + p.d[1] * u];
  var ph = Math.min(1, u / p.len) * Math.PI / 2, c = Math.cos(ph), s = Math.sin(ph);
  return [p.c[0] + R * (-p.dn[0] * c + p.di[0] * s), p.c[1] + R * (-p.dn[1] * c + p.di[1] * s)];
}
/* dove ci si ferma nella prima stanza: sulla soglia, col muro in faccia.
   Piu' avanti lo sguardo comincia gia' a girare verso l'uscita. */
var ARRIVO = CORR;
/* LA SOGLIA DI OGNI STANZA, sul percorso: dove ci si ferma arrivando da
   fuori a quel lavoro (collab ci manda qui). E' il punto del percorso piu'
   vicino alla porta d'ingresso. */
STANZE.forEach(function (r) {
  if (r.i === 0) { r.soglia = ARRIVO; return; }
  var d = DIR[r.entra], porta = [r.c[0] + d[0] * HALF, r.c[1] + d[1] * HALF], best = 0, bd = 1e9;
  for (var v = 0; v <= S_END; v += 0.1) {
    var q = at(v), dd = Math.hypot(q[0] - porta[0], q[1] - porta[1]);
    if (dd < bd) { bd = dd; best = v; }
  }
  r.soglia = best;
});

/* ------------------------------------------------------------------ *
 * LO STILE della tela e della pagina del lavoro. Sta qui e non nella casa,
 * cosi' il modulo si porta dietro tutto quel che gli serve. Tutto sta a
 * z-index 0, come il campo del tuffo: sotto la testa e il francobollo.
 * ------------------------------------------------------------------ */
var CSS = [
'#edificio { position:fixed; inset:0; width:100%; height:100%; display:block; z-index:0;',
'  opacity:0; transition:opacity .9s ease; touch-action:none; cursor:grab; }',
'#edificio.visibile { opacity:1; }',
'#edificio.mano { cursor:pointer; }',
/* mentre si vola dentro una fotografia lo schermo e' la sua tinta: il velo
   di penombra della testa ci starebbe sopra come una fascia sporca */
'body.ed-vola #velo-testa { opacity:0 !important; transition:opacity .3s ease; }',
/* DENTRO, la testa della casa (il titolo, la freccia, il francobollo) ha il
   colore del tratto, e il velo sotto la testa la luce del momento: sono
   variabili riscritte mentre si cammina (--ed-tratto, --ed-luce) */
'body.ed-dentro #titolo { color:var(--ed-tratto) !important; }',
'body.ed-dentro #indietro, body.ed-dentro #scrivimi { color:var(--ed-tratto) !important; }',
'body.ed-dentro #velo-testa { background:linear-gradient(to bottom, var(--ed-luce) 30%, rgba(255,255,255,0)) !important; }',
/* nella pagina la voce grande e' il ruolo: la testa della casa (SHOWROOM,
   nel piano) gli starebbe addosso come un secondo titolo. Resta la freccia. */
'body.ed-pagina #titolo { opacity:0 !important; transition:opacity .3s ease; }',
/* LA PAGINA DEL LAVORO. Si arriva volando dentro una fotografia, e per un
   istante lo schermo e' tutto la sua tinta: la pagina comincia di li', e
   scende nella penombra mentre il contenuto sale. Uscendo, il contrario. */
'#lavoro { position:fixed; inset:0; z-index:0; overflow-x:hidden; overflow-y:auto;',
'  -webkit-overflow-scrolling:touch; touch-action:pan-y; -webkit-user-select:text; user-select:text;',
'  background:var(--ed-tinta); visibility:hidden; transition:background-color .4s ease; }',
'#lavoro.aperto { visibility:visible; }',
'#lavoro.acceso { background:var(--ed-luce); transition:background-color .8s ease .05s; }',
'#lavoro .corpo { max-width:1160px; margin:0 auto;',
'  padding:clamp(120px, 23vh, 230px) clamp(20px, 5vw, 64px) 150px;',
'  opacity:0; transform:translateY(28px); transition:opacity .25s ease, transform .25s ease; }',
'#lavoro.acceso .corpo { opacity:1; transform:none;',
'  transition:opacity .6s ease .3s, transform .9s cubic-bezier(.2,.8,.2,1) .3s; }',
/* IN GRANDE C'E' IL RUOLO: a chi vuole commissionare un lavoro interessa
   cosa ha fatto lei. Il titolo sta sotto, piccolo, e puo' mancare. */
'#lavoro .ruolo { margin:0 0 .3em; text-align:center; font-family:var(--stampatello); font-weight:800;',
'  font-stretch:expanded; text-transform:uppercase; letter-spacing:.01em; line-height:.98;',
'  font-size:clamp(34px, 6.2vw, 94px); color:var(--ed-tratto); }',
'#lavoro .nome { margin:0 0 2.2em; text-align:center; font-family:var(--titolo); font-style:italic;',
'  font-size:clamp(16px, 1.4vw, 20px); color:var(--firma); }',
'#lavoro .attacco { margin:0 auto clamp(70px, 14vh, 150px); max-width:26ch; text-align:center;',
'  font-family:var(--titolo); font-style:italic; font-size:clamp(22px, 2.6vw, 34px);',
'  line-height:1.3; color:var(--ed-testo); }',
/* le righe: una fotografia e una risposta, e si alternano i lati */
'#lavoro .riga { display:grid; grid-template-columns:1fr 1fr; gap:clamp(32px, 7vw, 110px);',
'  align-items:center; margin:0 0 clamp(90px, 16vh, 170px); }',
'#lavoro .riga:nth-child(even) .foto { order:2; }',
'#lavoro .foto { position:relative; margin:0 auto; }',
'#lavoro .scatto { width:100%; height:100%; }',
'#lavoro .cornice { position:absolute; color:var(--ed-tratto); pointer-events:none; }',
'#lavoro .cornice svg { display:block; width:100%; height:100%; overflow:visible; }',
'#lavoro .risposta h2 { margin:0 0 .6em; font-family:var(--stampatello); font-weight:800;',
'  font-stretch:expanded; text-transform:uppercase; letter-spacing:.02em;',
'  line-height:1; font-size:clamp(20px, 2vw, 28px); color:var(--ed-tratto); }',
'#lavoro .risposta p { margin:0; max-width:32ch; font-family:var(--titolo);',
'  font-size:clamp(18px, 1.55vw, 22px); line-height:1.45; color:var(--ed-testo); }',
/* in fondo: chi e' arrivato fin qui vuole scrivere */
'#lavoro .chiusa { text-align:center; padding-top:clamp(20px, 6vh, 60px); }',
'#lavoro .chiusa h2 { margin:0 0 .4em; font-family:var(--stampatello); font-weight:800;',
'  font-stretch:expanded; text-transform:uppercase; letter-spacing:.01em; line-height:1;',
'  font-size:clamp(30px, 5vw, 72px); color:var(--ed-tratto); }',
'#lavoro .chiusa p { margin:0 auto 2em; max-width:30ch; font-family:var(--titolo); font-style:italic;',
'  font-size:clamp(18px, 1.6vw, 22px); line-height:1.45; color:var(--ed-testo); }',
'#lavoro .scrivi { display:inline-flex; flex-direction:column; align-items:center; gap:10px;',
'  color:var(--ed-tratto); text-decoration:none; transform:rotate(-2deg);',
'  transition:transform .28s cubic-bezier(.2,.9,.25,1); }',
'#lavoro .scrivi svg { display:block; width:clamp(120px, 12vw, 170px); height:auto; overflow:visible; }',
'#lavoro .scrivi span { font-family:var(--stampatello); font-weight:800; font-stretch:expanded;',
'  text-transform:uppercase; letter-spacing:.06em; font-size:17px; }',
'#lavoro .scrivi:hover, #lavoro .scrivi:focus-visible { transform:rotate(-2deg) translateY(-6px) scale(1.05); outline:none; }',
/* sul telefono una colonna sola; l'alternanza resta nei margini */
'@media (max-width: 720px) {',
'  #lavoro .riga { grid-template-columns:1fr; gap:26px; }',
'  #lavoro .riga:nth-child(even) .foto { order:0; }',
'  #lavoro .riga .foto { margin:0 auto 0 0; }',
'  #lavoro .riga:nth-child(even) .foto { margin:0 0 0 auto; }',
'  #lavoro .riga:nth-child(even) .risposta { text-align:right; }',
'  #lavoro .riga:nth-child(even) .risposta p { margin-left:auto; }',
'}'
].join('\n');
function stile() {
  if (document.getElementById('edificio-stile')) return;
  var s = document.createElement('style');
  s.id = 'edificio-stile'; s.textContent = CSS;
  document.head.appendChild(s);
}
function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
var FONDO, SEGNO, COMPOSTO, INCHIOSTRO, TESTO, FIRMA, DIDOT, STAMPATELLO;
/* LA LUCE: dalla penombra del piano (LUCE_DA e' --fondo) al bianco
   dell'ultima stanza. */
var LUCE_DA, LUCE_A = '#FAFAF8';
function colori() {
  FONDO = css('--fondo') || '#242D33'; FIRMA = css('--firma') || '#5B7383';
  SEGNO = css('--segno') || '#FFFFFF'; COMPOSTO = css('--composto') || '#E4E1DB';
  INCHIOSTRO = FONDO; TESTO = '#3A444B'; LUCE_DA = FONDO;
  var r = document.documentElement.style;
  r.setProperty('--ed-tratto', SEGNO); r.setProperty('--ed-testo', COMPOSTO);
  r.setProperty('--ed-luce', LUCE_DA);
  DIDOT = css('--titolo') || 'Georgia, serif';
  STAMPATELLO = css('--stampatello') || 'system-ui, sans-serif';
}

/* ------------------------------------------------------------------ *
 * Quel che va caricato una volta sola: three, le tre cornici, la busta.
 * Resta in memoria fra un'entrata e l'altra; le tessiture no, quelle sono
 * della tela, e la tela si butta uscendo.
 * ------------------------------------------------------------------ */
var SEGNI = {}, POSTA = '', pronti = null;
function testo(f) { return fetch(fresco(f)).then(function (r) { if (!r.ok) throw f; return r.text(); }); }
function conTre() {
  if (window.THREE) return Promise.resolve();
  return new Promise(function (ok, no) {
    var sc = document.createElement('script');
    sc.src = TRE; sc.onload = ok; sc.onerror = function () { no('three.js'); };
    document.head.appendChild(sc);
  });
}
/* LE CORNICI diventano immagini. Il file dice currentColor, che in
   un'immagine vorrebbe dire nero: si scrive il colore del segno al suo posto. */
function immagine(svg, w, h) {
  svg = svg.replace(/currentColor/g, '#FFFFFF').replace('<svg ', '<svg width="' + w + '" height="' + h + '" ');
  return new Promise(function (ok, no) {
    var img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    img.onload = function () { URL.revokeObjectURL(url); ok(img); };
    img.onerror = function () { no('una cornice'); };
    img.src = url;
  });
}
function cornice(nome) {
  return testo(FILE_CORNICI[nome]).then(function (t) {
    var vb = /viewBox="([^"]+)"/.exec(t)[1].split(/[\s,]+/).map(Number);
    var A = vb[2] / vb[3], lato = 1024;
    var cw = A >= 1 ? lato : Math.round(lato * A), ch = A >= 1 ? Math.round(lato / A) : lato;
    return immagine(t, cw, ch).then(function (img) {
      var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
      SEGNI[nome] = { cv: cv, A: A, svg: t };
    });
  });
}
/* la busta di mail.svg, come il francobollo del piano: via il fondo, e il
   tratto prende il colore del segno */
function busta(t) {
  var svg = new DOMParser().parseFromString(t, 'image/svg+xml').documentElement;
  var fondo = svg.querySelector('rect'); if (fondo) fondo.remove();
  svg.querySelectorAll('path').forEach(function (p) { p.setAttribute('fill', 'currentColor'); });
  svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.setAttribute('aria-hidden', 'true');
  return new XMLSerializer().serializeToString(svg);
}
function prepara() {
  if (!pronti) {
    pronti = Promise.all([
      conTre(), cornice('quadra'), cornice('alta'), cornice('larga'),
      testo('mail.svg').then(function (t) { POSTA = busta(t); }).catch(function () {})
    ]);
    pronti.catch(function () { pronti = null; });   // la prossima volta si riprova
  }
  return pronti;
}

/* ------------------------------------------------------------------ *
 * LO STATO DI UN'ENTRATA. Tutto quel che segue vive finche' la tela e'
 * accesa, e si rifa' da capo alla prossima.
 * ------------------------------------------------------------------ */
var acceso = false, volta = 0;
var tela, pagina, corpo, renderer, scene, camera, muroMat, muri, foto, tex, ANISO, giroId;
var s = 0, target = 0, keys = {}, cool = 0, guarda = 0, guardaT = 0, alza = 0, alzaT = 0;
var mode = 'cammina', anim = null, arrivo = null, giu = null, mosso = 0, prima = 0, veloT = null;
var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
var ptr, ray;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* I MURI NON SI VEDONO: sono del colore della pagina. Servono a coprire —
   quel che sta dietro un muro non si disegna, come in un disegno vero. */
function muro(ax, az, bx, bz, y0, h) {
  var dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz);
  var m = new THREE.Mesh(new THREE.BoxGeometry(len, h, T), muroMat);
  m.position.set((ax + bx) / 2, y0 + h / 2, (az + bz) / 2);
  m.rotation.y = -Math.atan2(dz, dx);
  scene.add(m); muri.push(m);
}

/* IL TRATTO. Gli spigoli sono segni di pennarello, non fili di ferro: un
   nastro steso sul muro, che si incurva appena, trema un poco, si assottiglia
   alle punte e sfora gli angoli come fa una mano. Ogni tratto ha il suo
   seme: l'edificio e' disegnato sempre uguale. */
function Tratti() { this.p = []; this.i = []; this.semi = 0; }
Tratti.prototype.linea = function (A, B, n, w) {
  var sm = ++this.semi + (this.base || 0);
  var dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2], L = Math.hypot(dx, dy, dz);
  if (L < 1e-4) return;
  var d = [dx / L, dy / L, dz / L];
  var sd = [n[1] * d[2] - n[2] * d[1], n[2] * d[0] - n[0] * d[2], n[0] * d[1] - n[1] * d[0]];
  var t0 = -(0.03 + caso(sm, 1) * 0.12) / L, t1 = 1 + (0.03 + caso(sm, 2) * 0.14) / L;
  var arco = (caso(sm, 3) - 0.5) * Math.min(0.14, L * 0.014);
  var fase = caso(sm, 4) * 6.283, giri = 1 + caso(sm, 5) * 2.5;
  var N = Math.max(8, Math.ceil(L * 6)), base = this.p.length / 3;
  for (var k = 0; k <= N; k++) {
    var u = k / N, tt = t0 + (t1 - t0) * u;
    var off = arco * Math.sin(Math.PI * u) + 0.011 * Math.sin(fase + u * giri * 6.283);
    var mezzo = w * 0.5 * (0.62 + 0.38 * Math.pow(Math.sin(Math.PI * u), 0.3)) *
                (0.88 + 0.24 * Math.sin(fase * 2 + u * 11));
    var cx = A[0] + dx * tt + sd[0] * off, cy = A[1] + dy * tt + sd[1] * off, cz = A[2] + dz * tt + sd[2] * off;
    this.p.push(cx + sd[0] * mezzo, cy + sd[1] * mezzo, cz + sd[2] * mezzo,
                cx - sd[0] * mezzo, cy - sd[1] * mezzo, cz - sd[2] * mezzo);
    if (k < N) { var a = base + k * 2; this.i.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
};
Tratti.prototype.mesh = function (colore, opac) {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
  g.setIndex(this.i);
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({
    color: colore, side: THREE.DoubleSide, transparent: opac < 1, opacity: opac,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
};
var W = 0.05;                 // il pennarello
var ALZA = T / 2 + 0.02;      // il segno sta sulla faccia del muro, appena fuori

function disegna() {
  var tratto = new Tratti(), terra = new Tratti();
  terra.base = 100000;

  /* il contorno di una faccia di muro: il piede, la cima, lo spigolo
     d'inizio (ogni angolo lo disegna uno solo dei due muri) e la porta */
  function faccia(a, b, n, alto, porta) {
    var ex = b[0] - a[0], ez = b[1] - a[1], L = Math.hypot(ex, ez);
    ex /= L; ez /= L;
    function P(u, y) { return [a[0] + ex * u + n[0] * ALZA, y, a[1] + ez * u + n[2] * ALZA]; }
    var u0 = T / 2, u1 = L - T / 2, piede = W * 0.5 + 0.01, cima = alto - W * 0.5;
    tratto.linea(P(u0 + W * 0.6, 0), P(u0 + W * 0.6, alto), n, W);
    tratto.linea(P(u0, cima), P(u1, cima), n, W);
    if (!porta) { tratto.linea(P(u0, piede), P(u1, piede), n, W); return; }
    var m = L / 2, h = CW / 2;
    tratto.linea(P(u0, piede), P(m - h, piede), n, W);
    tratto.linea(P(m + h, piede), P(u1, piede), n, W);
    tratto.linea(P(m - h, 0), P(m - h, CH), n, W);
    tratto.linea(P(m + h, 0), P(m + h, CH), n, W);
    tratto.linea(P(m - h, CH), P(m + h, CH), n, W);
  }
  function capi(c, lato) {
    var x = c[0], z = c[1], H = HALF;
    return { N:[[x-H,z-H],[x+H,z-H]], S:[[x+H,z+H],[x-H,z+H]],
             E:[[x+H,z-H],[x+H,z+H]], W:[[x-H,z+H],[x-H,z-H]] }[lato];
  }
  function corridoio(c, lato) {
    var d = DIR[lato], p = [-d[1], d[0]], h = CW / 2;
    [1, -1].forEach(function (sg) {
      var a = [c[0] + d[0] * HALF + p[0] * h * sg, c[1] + d[1] * HALF + p[1] * h * sg];
      var b = [c[0] + d[0] * (HALF + CORR) + p[0] * h * sg, c[1] + d[1] * (HALF + CORR) + p[1] * h * sg];
      muro(a[0], a[1], b[0], b[1], 0, CH);
      var n = [-p[0] * sg, 0, -p[1] * sg];
      function Q(pt, y) { return [pt[0] + n[0] * ALZA, y, pt[1] + n[2] * ALZA]; }
      tratto.linea(Q(a, W * 0.5 + 0.01), Q(b, W * 0.5 + 0.01), n, W);
      tratto.linea(Q(a, CH - W * 0.5), Q(b, CH - W * 0.5), n, W);
    });
  }

  STANZE.forEach(function (r) {
    ['N', 'E', 'S', 'W'].forEach(function (lato) {
      var e = capi(r.c, lato), porta = (lato === r.entra || lato === r.esce);
      var a = e[0], b = e[1];
      if (!porta) muro(a[0], a[1], b[0], b[1], 0, RH);
      else {
        var mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2,
            ux = (b[0] - a[0]) / (2 * HALF), uz = (b[1] - a[1]) / (2 * HALF), h = CW / 2;
        muro(a[0], a[1], mx - ux * h, mz - uz * h, 0, RH);
        muro(mx + ux * h, mz + uz * h, b[0], b[1], 0, RH);
        muro(mx - ux * h, mz - uz * h, mx + ux * h, mz + uz * h, CH, RH - CH);
      }
      faccia(a, b, DENTRO[lato], RH, porta);
    });
    if (r.esce) corridoio(r.c, r.esce);
    if (r.i === 0) corridoio(r.c, r.entra);
    /* IL PAVIMENTO e' disegnato nel colore della firma, che nel piano e' la
       linea di terra: poche righe, quanto basta a sentire che si cammina */
    var I = HALF - T / 2;
    [-HALF / 2, 0, HALF / 2].forEach(function (o) {
      terra.linea([r.c[0] + o, 0.01, r.c[1] - I], [r.c[0] + o, 0.01, r.c[1] + I], [0, 1, 0], 0.022);
      terra.linea([r.c[0] - I, 0.01, r.c[1] + o], [r.c[0] + I, 0.01, r.c[1] + o], [0, 1, 0], 0.022);
    });
  });
  var m = tratto.mesh('#FFFFFF', 1); tinti.push(m.material); scene.add(m);
  scene.add(terra.mesh(FIRMA, 0.45));
}

/* mette una cosa sulla faccia interna del muro "lato" della stanza c */
function posa(c, lato, u, y, obj, stacco) {
  var H = HALF - T / 2 - (stacco || 0.03);
  var o = { N:[c[0]+u, c[1]-H, 0], S:[c[0]-u, c[1]+H, Math.PI],
            E:[c[0]+H, c[1]+u, -Math.PI/2], W:[c[0]-H, c[1]-u, Math.PI/2] }[lato];
  obj.position.set(o[0], y, o[1]); obj.rotation.y = o[2];
}
/* la cornice sta nel suo riquadro senza deformarsi, come un svg in un div */
function dentroA(cw, ch, A) { return cw / ch > A ? [ch * A, ch] : [cw, cw / A]; }
function tessitura(cv) { var x = new THREE.CanvasTexture(cv); x.anisotropy = ANISO; tex.push(x); return x; }

/* IL CARTELLO: il ruolo in stampatello, e sotto, piccolo, il titolo */
function stampa(x, testo, corpo, max) {
  x.font = '800 expanded ' + corpo + 'px ' + STAMPATELLO;
  var l = x.measureText(testo).width;
  if (l > max) { corpo = Math.floor(corpo * max / l); x.font = '800 expanded ' + corpo + 'px ' + STAMPATELLO; }
  return corpo;
}
function cartello(lav) {
  var cv = document.createElement('canvas'); cv.width = 2048; cv.height = 512;
  var x = cv.getContext('2d'), ruolo = tr(lav.ruolo).toUpperCase();
  x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  var corpo = stampa(x, ruolo, 150, 1900), base = 60 + corpo * 0.74;
  x.fillStyle = '#FFFFFF'; x.fillText(ruolo, 1024, base);
  if (tr(lav.titolo)) {
    /* il titolo e' piu' leggero del ruolo: lo stesso colore, a meta' */
    x.fillStyle = 'rgba(255,255,255,.55)'; x.font = 'italic 400 64px ' + DIDOT;
    x.fillText(tr(lav.titolo), 1024, base + 110);
  }
  return tessitura(cv);
}
/* IL CARTELLO DELLA POSTA: la domanda, la busta e "scrivimi". Si tocca
   tutto. La busta arriva dopo, e si ridisegna. */
function cartelloPosta() {
  var cv = document.createElement('canvas'); cv.width = 2048; cv.height = 1024;
  var x = cv.getContext('2d'), tx = tessitura(cv), righe = tr(PAROLE.muro);
  function scrivi(img) {
    x.clearRect(0, 0, 2048, 1024);
    x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = '#FFFFFF';
    var c1 = Math.min(stampa(x, righe[0], 190, 1900), stampa(x, righe[1], 190, 1900));
    stampa(x, righe[0], c1, 1900);
    x.fillText(righe[0], 1024, 60 + c1 * 0.74);
    x.fillText(righe[1], 1024, 60 + c1 * 0.74 + c1 * 0.95);
    if (img) { var h = 300, w = h * img.width / img.height; x.drawImage(img, 1024 - w / 2, 470, w, h); }
    stampa(x, tr(PAROLE.scrivimi).toUpperCase(), 64, 900);
    x.fillText(tr(PAROLE.scrivimi).toUpperCase(), 1024, 850);
    tx.needsUpdate = true;
  }
  scrivi(null);
  if (POSTA) {
    var vb = /viewBox="([^"]+)"/.exec(POSTA), v = vb ? vb[1].split(/[\s,]+/).map(Number) : [0, 0, 3, 2];
    immagine(POSTA, Math.round(400 * v[2] / v[3]), 400).then(scrivi).catch(function () {});
  }
  return tx;
}

/* Le fotografie. Per ora tinte: quelle di un lavoro sono sue, e variano
   appena fra loro — la stanza ha un colore, non un arcobaleno. */
function tintaDi(r, k) {
  var col = new THREE.Color(r.tinta);
  if (caso(k, 6) < 0.5) col.lerp(new THREE.Color(FONDO), caso(k, 7) * 0.35);
  else col.lerp(new THREE.Color('#FFFFFF'), caso(k, 7) * 0.18);
  return col;
}
function appendi(r, lato, u, f, k, cornici) {
  var w = f.l * CM, h = f.a * CM, kind = qualeCornice(f), col = tintaDi(r, k);
  var g = new THREE.Group();
  var scatto = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col }));
  g.add(scatto);
  /* la cornice come nella galleria: non combacia mai, sborda da due lati */
  var sx = 0.965 + caso(k, 1) * 0.085, sy = 0.965 + caso(k, 2) * 0.085;
  if (sx > 1 && sy > 1) sy = 0.972;
  if (sx < 1 && sy < 1) sx = 1.042;
  var gf = GONFIA[kind], dim = dentroA(w * sx * gf[0], h * sy * gf[1], SEGNI[kind].A);
  var cr = new THREE.Mesh(new THREE.PlaneGeometry(dim[0], dim[1]),
    tinto(new THREE.MeshBasicMaterial({ map: cornici[kind], transparent: true, depthWrite: false })));
  cr.position.set((caso(k, 3) - 0.5) * 0.055 * w, (caso(k, 4) - 0.5) * 0.055 * h, 0.015);
  cr.rotation.z = (caso(k, 5) - 0.5) * 3.2 * Math.PI / 180;
  g.add(cr);
  posa(r.c, lato, u, 1.62, g, 0.035);
  scatto.userData = { stanza: r, f: f, k: k, tinta: '#' + col.getHexString(), gruppo: g };
  scene.add(g); foto.push(scatto);
}
function arreda() {
  var cornici = {}, k = 0;
  for (var n in SEGNI) cornici[n] = tessitura(SEGNI[n].cv);
  STANZE.forEach(function (r) {
    var faccia = OPP[r.entra];
    if (r.posta) {
      var cp = new THREE.Mesh(new THREE.PlaneGeometry(8, 4),
        tinto(new THREE.MeshBasicMaterial({ map: cartelloPosta(), transparent: true, depthWrite: false })));
      posa(r.c, faccia, 0, 2.3, cp, 0.03);
      cp.userData = { posta: true };
      scene.add(cp); foto.push(cp);
      return;
    }
    var cart = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.8),
      tinto(new THREE.MeshBasicMaterial({ map: cartello(r.lav), transparent: true, depthWrite: false })));
    posa(r.c, faccia, 0, 3.75, cart, 0.03);
    scene.add(cart);
    var liberi = ['N', 'E', 'S', 'W'].filter(function (lato) {
      return lato !== r.entra && lato !== r.esce && lato !== faccia;
    });
    var n = 3 + (caso(r.i, 8) > 0.5 ? 1 : 0);
    var fmt = function () { return FORMATI[(r.i * 3 + k) % FORMATI.length]; };
    appendi(r, faccia, -3.7, fmt(), ++k, cornici);
    appendi(r, faccia,  3.7, fmt(), ++k, cornici);
    liberi.forEach(function (lato, li) {
      if (n - 2 === 1 || li > 0) appendi(r, lato, 0, fmt(), ++k, cornici);
      else { appendi(r, lato, -3.2, fmt(), ++k, cornici); appendi(r, lato, 3.2, fmt(), ++k, cornici); }
    });
  });
}

/* ------------------------------------------------------------------ *
 * LA PAGINA DEL LAVORO.
 * ------------------------------------------------------------------ */
function el(tag, cls, txt) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt) e.textContent = txt;
  return e;
}
/* una fotografia della pagina: la sua misura vera (una 30 riempie la
   colonna, una 12 ne prende due quinti) e la cornice come nella galleria */
function fotoInPagina(f, tinta, k) {
  var kind = qualeCornice(f), gf = GONFIA[kind];
  var box = el('div', 'foto');
  box.style.width = (f.l / 30 * 100).toFixed(1) + '%';
  box.style.aspectRatio = f.l + ' / ' + f.a;
  var sc = el('div', 'scatto'); sc.style.background = tinta; box.appendChild(sc);
  var sx = 0.965 + caso(k, 1) * 0.085, sy = 0.965 + caso(k, 2) * 0.085;
  if (sx > 1 && sy > 1) sy = 0.972;
  if (sx < 1 && sy < 1) sx = 1.042;
  var cw = sx * gf[0] * 100, ch = sy * gf[1] * 100, c = el('div', 'cornice');
  c.style.width = cw.toFixed(1) + '%'; c.style.height = ch.toFixed(1) + '%';
  c.style.left = ((100 - cw) / 2 + (caso(k, 3) - 0.5) * 5.5).toFixed(1) + '%';
  c.style.top  = ((100 - ch) / 2 + (caso(k, 4) - 0.5) * 5.5).toFixed(1) + '%';
  c.style.transform = 'rotate(' + ((caso(k, 5) - 0.5) * 3.2).toFixed(2) + 'deg)';
  c.innerHTML = SEGNI[kind].svg;
  box.appendChild(c);
  return box;
}
function componiPagina(sc) {
  var r = sc.stanza;
  corpo.innerHTML = '';
  corpo.appendChild(el('h1', 'ruolo', tr(r.lav.ruolo)));
  if (tr(r.lav.titolo)) corpo.appendChild(el('p', 'nome', tr(r.lav.titolo)));
  corpo.appendChild(el('p', 'attacco', tr(PAROLE.attacco)));
  var righe = el('div', 'righe');
  DOMANDE.forEach(function (q, j) {
    /* la prima e' quella da cui si e' entrati */
    var k = 500 + r.i * 16 + j;
    var f = j === 0 ? sc.f : FORMATI[(r.i * 3 + j * 7) % FORMATI.length];
    var tinta = j === 0 ? sc.tinta : '#' + tintaDi(r, k).getHexString();
    var riga = el('section', 'riga');
    riga.appendChild(fotoInPagina(f, tinta, k));
    var ris = el('div', 'risposta');
    ris.appendChild(el('h2', '', tr(q.d)));
    ris.appendChild(el('p', '', tr(q.r)));
    riga.appendChild(ris);
    righe.appendChild(riga);
  });
  corpo.appendChild(righe);
  var chiusa = el('footer', 'chiusa');
  chiusa.appendChild(el('h2', '', tr(PAROLE.domanda)));
  chiusa.appendChild(el('p', '', tr(PAROLE.invito)));
  var a = el('a', 'scrivi');
  a.href = 'mailto:?subject=' + encodeURIComponent(tr(PAROLE.oggetto));
  a.innerHTML = POSTA; a.appendChild(el('span', '', tr(PAROLE.scrivimi)));
  a.addEventListener('click', function (e) { e.preventDefault(); scrivi(); });
  chiusa.appendChild(a);
  corpo.appendChild(chiusa);
}
/* Si apre dalla tinta, come si e' arrivati; e si chiude tornandoci. Lo
   stato di partenza si mette SENZA transizione e si forza il conto, se no
   l'animazione parte da dove non era (vedi il README). */
function apriPagina(sc) {
  componiPagina(sc);
  document.documentElement.style.setProperty('--ed-tinta', sc.tinta);
  pagina.scrollTop = 0;
  pagina.classList.add('aperto');
  void pagina.offsetWidth;
  pagina.classList.add('acceso');
  document.body.classList.add('ed-pagina');
  clearTimeout(veloT);
  veloT = setTimeout(function () { document.body.classList.remove('ed-vola'); }, reduced ? 0 : 700);
}
function chiudiPagina() {
  if (mode !== 'pagina') return;
  mode = 'chiude';
  document.body.classList.add('ed-vola');
  document.body.classList.remove('ed-pagina');
  pagina.classList.remove('acceso');
  var v = volta;
  setTimeout(function () {
    if (v !== volta || !acceso) return;
    pagina.classList.remove('aperto');
    mode = 'esce'; anim = { t: 0, a: posaFoto(anim.m), b: null, m: anim.m };
  }, reduced ? 0 : 420);
}

/* ------------------------------------------------------------------ *
 * I GESTI. Scorrere cammina. LO SGUARDO SEGUE IL PUNTATORE, come la
 * parallasse del piano: niente da trascinare, la testa si gira piano verso
 * dove si punta, e torna dritta quando il puntatore esce. Col dito non c'e'
 * puntatore: si trascina di lato, e lasciando lo sguardo torna dritto.
 * Toccare una fotografia apre il lavoro; toccare la posta, scrive.
 * ------------------------------------------------------------------ */
var GIRO = 0.42, CHINA = 0.15;   // quanto si gira la testa, di lato e in su
function spingi(v) {
  if (arrivo) { arrivo = null; target = s; }
  if (mode === 'cammina' && performance.now() > cool) target = clamp(target + v, 0, S_END);
}
function rotella(e) { var k = e.deltaMode === 1 ? 16 : 1; spingi(e.deltaY * k * 0.012); }
function premi(e) {
  giu = { x: e.clientX, y: e.clientY, dito: e.pointerType !== 'mouse' }; mosso = 0;
  try { tela.setPointerCapture(e.pointerId); } catch (x) {}
}
function muovi(e) {
  if (e.pointerType === 'mouse') {
    guardaT = -(e.clientX / innerWidth * 2 - 1) * GIRO;
    alzaT = -(e.clientY / innerHeight * 2 - 1) * CHINA;
  }
  if (giu) {
    var dx = e.clientX - giu.x, dy = e.clientY - giu.y; mosso += Math.abs(dx) + Math.abs(dy);
    if (giu.dito) guardaT = clamp(guardaT + dx * 0.005, -0.9, 0.9);
    spingi(-dy * 0.035); giu.x = e.clientX; giu.y = e.clientY;
  } else if (e.pointerType === 'mouse') tela.classList.toggle('mano', mode === 'cammina' && !!scegli(e));
}
function lascia(e) {
  if (!giu) return;
  if (mosso < 6 && mode === 'cammina') {
    var h = scegli(e);
    if (h && h.userData.posta) scrivi();
    else if (h) entra(h);
  }
  if (giu && giu.dito) guardaT = alzaT = 0;
  giu = null;
}
function annulla() { if (giu && giu.dito) guardaT = alzaT = 0; giu = null; }
function fuori() { guardaT = alzaT = 0; }
function tasto(e) { keys[e.key.toLowerCase()] = e.type === 'keydown'; }
function scegli(e) {
  ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  var h = ray.intersectObjects(foto.concat(muri))[0];
  /* dalla soglia la parete in fondo sta a quattordici: si deve poterla toccare */
  return h && h.distance < 18 && foto.indexOf(h.object) >= 0 ? h.object : null;
}

/* entrare e uscire da una fotografia */
function posaFoto(m) {
  var g = m.userData.gruppo, n = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion);
  return { pos: g.position.clone().add(n.multiplyScalar(0.12)), look: g.position.clone() };
}
function posaPasso() {
  var p = at(s), q = at(s + 3), th = Math.atan2(q[0] - p[0], q[1] - p[1]) + guarda;
  return { pos: new THREE.Vector3(p[0], EYE, p[1]),
           look: new THREE.Vector3(p[0] + Math.sin(th), EYE - 0.05 + Math.tan(alza), p[1] + Math.cos(th)) };
}
function entra(m) {
  tela.classList.remove('mano'); document.body.classList.add('ed-vola');
  mode = 'entra'; anim = { t: 0, a: posaPasso(), b: posaFoto(m), m: m };
}
function tra(a, b, k) {
  camera.position.lerpVectors(a.pos, b.pos, k);
  camera.lookAt(new THREE.Vector3().lerpVectors(a.look, b.look, k));
}

/* LA LUCE DEL MOMENTO: dipende da quanto si e' camminato. Sfondo, nebbia e
   muri sono lo stesso colore - i muri devono restare invisibili - e la
   pagina lo sa dalla variabile --ed-luce, che si scrive solo se cambia. */
var luceDa, luceA, luceOra = '', tinti = [], trattoC, testoC, bianco, inchiostro, chiaro, scuro;
function tinto(m) { tinti.push(m); return m; }
/* la luminanza vera, quella che decide il contrasto */
function lum(c) {
  function l(v) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  return 0.2126 * l(c.r) + 0.7152 * l(c.g) + 0.0722 * l(c.b);
}
/* IL SEGNO GIRA dove bianco e inchiostro hanno lo stesso contrasto sul
   fondo - luminanza 0,2 circa - e ci mette poco: fra 0,15 e 0,27. */
var GIRA_DA = 0.15, GIRA_A = 0.27;
function illumina(p) {
  p = clamp(p, 0, 1); p = p * p * (3 - 2 * p);
  var c = scene.background.copy(luceDa).lerp(luceA, p);
  scene.fog.color.copy(c); muroMat.color.copy(c);
  var k = clamp((lum(c) - GIRA_DA) / (GIRA_A - GIRA_DA), 0, 1);
  k = k * k * (3 - 2 * k);
  trattoC.copy(bianco).lerp(inchiostro, k);
  testoC.copy(chiaro).lerp(scuro, k);
  for (var i = 0; i < tinti.length; i++) tinti[i].color.copy(trattoC);
  var hex = '#' + c.getHexString();
  if (hex !== luceOra) {
    luceOra = hex;
    var r = document.documentElement.style;
    r.setProperty('--ed-luce', hex);
    r.setProperty('--ed-tratto', '#' + trattoC.getHexString());
    r.setProperty('--ed-testo', '#' + testoC.getHexString());
  }
}

function misura() {
  if (!renderer) return;
  var w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w < h ? 82 : 68; camera.updateProjectionMatrix();
}

function giro(adesso) {
  if (!acceso) return;
  var dt = Math.min(0.05, (adesso - prima) / 1000) || 0.016; prima = adesso;
  var kv = (keys.arrowup || keys.w) ? 0.14 : (keys.arrowdown || keys.s) ? -0.14 : 0;
  if (kv) spingi(kv);
  if (mode === 'cammina') {
    if (keys.arrowleft || keys.a) guardaT = clamp(guardaT + 0.02, -0.9, 0.9);
    if (keys.arrowright || keys.d) guardaT = clamp(guardaT - 0.02, -0.9, 0.9);
    if (arrivo) {
      /* SI ENTRA CAMMINANDO: nessuna dritta scritta, la macchina fa da
         sola i primi passi, e si capisce che si puo' andare avanti */
      var u = Math.min(1, (adesso - arrivo.t0) / arrivo.dur);
      s = target = arrivo.da + (arrivo.a - arrivo.da) * (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      if (u >= 1) arrivo = null;
    } else s += (target - s) * (reduced ? 0.35 : 0.08);
    var dolce = reduced ? 0.3 : 0.05;
    guarda += (guardaT - guarda) * dolce; alza += (alzaT - alza) * dolce;
    var p = posaPasso(); camera.position.copy(p.pos); camera.lookAt(p.look);
    illumina(s / S_END);
    renderer.render(scene, camera);
  } else if (mode === 'entra') {
    anim.t = Math.min(1, anim.t + dt / (reduced ? 0.2 : 0.9));
    tra(anim.a, anim.b, anim.t * anim.t * anim.t);
    renderer.render(scene, camera);
    if (anim.t >= 1) { mode = 'pagina'; apriPagina(anim.m.userData); }
  } else if (mode === 'esce') {
    anim.b = posaPasso(); illumina(s / S_END);
    anim.t = Math.min(1, anim.t + dt / (reduced ? 0.2 : 0.7));
    tra(anim.a, anim.b, 1 - Math.pow(1 - anim.t, 3));
    renderer.render(scene, camera);
    if (anim.t >= 1) {
      mode = 'cammina'; target = s; cool = performance.now() + 600;
      document.body.classList.remove('ed-vola');
    }
  }
  /* nella pagina la stanza sta ferma, e non si ridisegna */
  giroId = requestAnimationFrame(giro);
}

/* ------------------------------------------------------------------ *
 * accendere e spegnere
 * ------------------------------------------------------------------ */
function costruisci() {
  try { renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true }); }
  catch (e) { console.warn('edificio: niente WebGL'); return false; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  ANISO = renderer.capabilities.getMaxAnisotropy();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(LUCE_DA);
  /* LA NEBBIA E' LA LUCE: quel che e' lontano non sparisce, sbianca nel
     colore della stanza, come i riquadri lontani del tuffo nel buio */
  scene.fog = new THREE.Fog(LUCE_DA, 10, 42);
  camera = new THREE.PerspectiveCamera(68, 1, 0.05, 200);
  muroMat = new THREE.MeshBasicMaterial({ color: LUCE_DA });
  luceDa = new THREE.Color(LUCE_DA); luceA = new THREE.Color(LUCE_A); luceOra = '';
  bianco = new THREE.Color(SEGNO); inchiostro = new THREE.Color(INCHIOSTRO);
  chiaro = new THREE.Color(COMPOSTO); scuro = new THREE.Color(TESTO);
  trattoC = new THREE.Color(); testoC = new THREE.Color(); tinti = [];
  muri = []; foto = []; tex = [];
  var pav = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), muroMat);
  pav.rotation.x = -Math.PI / 2; pav.position.set(12, -0.001, -48);
  scene.add(pav);
  disegna();
  arreda();
  ptr = new THREE.Vector2(); ray = new THREE.Raycaster();
  misura();
  return true;
}
var ASCOLTI = [
  [window, 'wheel', rotella, { passive: true }], [window, 'keydown', tasto], [window, 'keyup', tasto],
  [window, 'resize', misura], [document.documentElement, 'mouseleave', fuori]
];
function accendi(dove) {
  if (acceso) return true;
  acceso = true; var v = ++volta;
  stile(); colori();
  tela = document.createElement('canvas');
  tela.id = 'edificio'; tela.setAttribute('aria-label', tr(PAROLE.tela));
  pagina = el('article'); pagina.id = 'lavoro';
  corpo = el('div', 'corpo'); pagina.appendChild(corpo);
  var casa = dove || document.body;
  casa.appendChild(tela); casa.appendChild(pagina);

  prepara().then(function () {
    if (!acceso || v !== volta) return;
    if (!costruisci()) return;
    tela.addEventListener('pointerdown', premi);
    tela.addEventListener('pointermove', muovi);
    tela.addEventListener('pointerup', lascia);
    tela.addEventListener('pointercancel', annulla);
    ASCOLTI.forEach(function (a) { a[0].addEventListener(a[1], a[2], a[3]); });
    guarda = guardaT = alza = alzaT = 0; keys = {}; mode = 'cammina';
    /* si arriva sulla soglia della prima stanza, o di quella che la casa
       ha chiesto (PIANO.dopo = { lavoro: i }), facendo gli ultimi passi */
    var dopo = window.PIANO && window.PIANO.dopo, meta = ARRIVO;
    if (window.PIANO) window.PIANO.dopo = null;
    if (dopo && STANZE[dopo.lavoro]) meta = STANZE[dopo.lavoro].soglia;
    arrivo = { t0: performance.now(), dur: 2600, da: Math.max(0, meta - ARRIVO), a: meta };
    s = target = arrivo.da;
    if (reduced) { s = target = meta; arrivo = null; }
    prima = performance.now();
    giroId = requestAnimationFrame(giro);
    void tela.offsetHeight;
    tela.classList.add('visibile');
    document.body.classList.add('ed-dentro');
  }).catch(function (f) {
    console.warn('edificio: non trovo ' + f);
  });
  return true;
}
function spegni() {
  if (!acceso) return;
  acceso = false; volta++;
  if (giroId) cancelAnimationFrame(giroId);
  ASCOLTI.forEach(function (a) { a[0].removeEventListener(a[1], a[2], a[3]); });
  document.body.classList.remove('ed-vola', 'ed-pagina', 'ed-dentro');
  pagina.remove();
  tela.classList.remove('visibile');
  var t = tela, r = renderer, x = tex || [];
  renderer = null;
  setTimeout(function () {
    /* si butta via il contesto: una tela WebGL viva che nessuno guarda
       tiene occupata la scheda video e continua a costare */
    x.forEach(function (k) { k.dispose(); });
    if (r) { r.dispose(); r.forceContextLoss(); }
    t.remove();
  }, 700);
}
/* UN PASSO INDIETRO: se la pagina di un lavoro e' aperta si chiude quella,
   e si resta nella stanza. Mentre si vola non si esce. */
function indietro() {
  if (mode === 'pagina') { chiudiPagina(); return true; }
  if (mode === 'entra' || mode === 'chiude' || mode === 'esce') return true;
  return false;
}

return {
  accendi: accendi, spegni: spegni, indietro: indietro,
  acceso: function () { return acceso; },
  rifai: function () {},          // la tela e' sempre a tutto schermo
  lingua: LINGUA
};
})();
