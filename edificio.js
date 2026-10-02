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

   UNA STANZA PER SETTORE, a serpentina. Sul muro in faccia il NOME del
   settore, grande, e sotto una riga piu' piccola; sugli altri muri le
   fotografie vere con le cornici disegnate. Quali siano i settori e quali
   fotografie ci stiano dentro lo dice foto.json, che fa porta-le-foto.sh.
   Gli spigoli sono tratti di pennarello, i muri sono del colore della
   pagina: si vedono solo i segni, e quel che sta dietro un muro non si
   disegna.

   Toccando una fotografia si apre LA PAGINA DEL SETTORE: verticale, tutte
   le sue fotografie a destra e a sinistra, e accanto alle prime sei le
   risposte a quel che chiederebbe chi vuole commissionarle un lavoro. In
   fondo, scrivimi.

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
 * I SETTORI arrivano da foto.json, che fa porta-le-foto.sh: come si
 * chiamano, cosa c'e' scritto sotto, e le fotografie vere con le loro
 * misure. Una stanza per settore, e la scelta si cambia la' - non qui.
 * ------------------------------------------------------------------ */
var SETTORI = [];

/* Le domande di chi vuole commissionarle un lavoro. LE RISPOSTE SONO
   SEGNAPOSTO, una serie per settore: quelle vere le scrive Vittoria. */
var DOMANDE = [
  { it: 'Per chi', en: 'Who for' },
  { it: 'Cosa serviva', en: 'The brief' },
  { it: 'Come', en: 'How' },
  { it: 'Perché così', en: 'Why this way' },
  { it: "Chi c'era", en: 'The team' },
  { it: 'Tempi e consegna', en: 'Timing and delivery' }
];
var RISPOSTE = {
  moda: {
    r: [
      { it: 'Marchi di abbigliamento, stylist e riviste, per lookbook, campagne ed editoriali.',
        en: 'Clothing brands, stylists and magazines, for lookbooks, campaigns and editorials.' },
      { it: 'Una serie che facesse vedere il capo in movimento, e non steso addosso a qualcuno fermo.',
        en: 'A series that shows the garment moving, not laid over someone standing still.' },
      { it: 'Fondale bianco, luce alta, e una modella che continua a muoversi: si scatta a raffica e si sceglie dopo.',
        en: 'White backdrop, high light, and a model who keeps moving: you shoot in bursts and choose afterwards.' },
      { it: 'Il tulle si legge solo controluce e in movimento. Fermo e piatto, in fotografia, non esiste.',
        en: 'Tulle only reads backlit and in motion. Still and flat, in a photograph, it does not exist.' },
      { it: "Vittoria alla fotografia e all'art direction, con stylist e trucco.",
        en: 'Vittoria on photography and art direction, with stylist and make-up.' },
      { it: 'Una giornata di set, e i file finiti entro dieci giorni, in verticale e in orizzontale.',
        en: 'One day on set, and the finished files within ten days, in portrait and landscape.' }
    ]
  },
  fuori: {
    r: [
      { it: 'Musicisti, marchi piccoli e progetti personali, quando serve una cosa che non sembri costruita.',
        en: 'Musicians, small brands and personal projects, when the image must not look constructed.' },
      { it: 'Ritratti che reggano da soli, uno per volta, senza una serie intorno a spiegarli.',
        en: 'Portraits that stand alone, one at a time, without a series around them to explain them.' },
      { it: 'Un posto vero, luce naturale, nessun fondale. Si cammina, si aspetta, e si scatta poco.',
        en: 'A real place, natural light, no backdrop. You walk, you wait, and you shoot little.' },
      { it: 'Il bianco e nero toglie di mezzo il colore di quel giorno e lascia la persona e la luce.',
        en: "Black and white takes that day's colour out of the way and leaves the person and the light." },
      { it: 'Vittoria da sola, e chi è davanti.',
        en: 'Vittoria alone, and whoever is in front.' },
      { it: 'Mezza giornata, e la scelta entro la settimana.',
        en: 'Half a day, and the selection within the week.' }
    ]
  },
  sparse: {
    r: [
      { it: 'Nessuno: sono venute fuori da sole, in lavori diversi.',
        en: 'No one: they came up by themselves, on different jobs.' },
      { it: 'Niente. Sono le fotografie che restano quando il lavoro è finito.',
        en: 'Nothing. They are the photographs left over when the job is done.' },
      { it: 'Guardando. Una è al buio, una su fondo rosso, una in bianco e nero: non si assomigliano in niente.',
        en: 'By looking. One in the dark, one on red, one in black and white: they resemble each other in nothing.' },
      { it: 'Perché un portfolio fatto solo di serie dice come lavora, non come guarda.',
        en: 'Because a portfolio made only of series says how she works, not how she looks.' },
      { it: 'Vittoria, e basta.',
        en: 'Vittoria, and that is all.' },
      { it: 'Nessuna consegna: queste non le ha chieste nessuno.',
        en: 'No delivery: nobody asked for these.' }
    ]
  }
};
function risposte(id) { return RISPOSTE[id] || RISPOSTE.moda; }

var PAROLE = {
  muro:    { it: ['HAI UN LAVORO', 'IN MENTE?'], en: ['HAVE A PROJECT', 'IN MIND?'] },
  scrivimi: { it: 'Scrivimi', en: 'Write to me' },
  oggetto: { it: 'Richiesta di disponibilità', en: 'Availability request' },   // lo stesso di mail
  tela:    { it: "L'edificio: scorri per camminare, tocca una fotografia per aprire il lavoro",
             en: 'The building: scroll to walk, tap a photograph to open the project' },
  /* LA DRITTA. Una riga sola, in stampatello piccolo, in fondo allo schermo: compare
     quando si e' arrivati e se ne va al primo gesto. Non e' un cartello di
     istruzioni - e' quel che direbbe una persona che ti apre la porta. */
  dritta:  { it: { mano: 'scorri per camminare · clicca una fotografia per aprirla',
                   dito: 'scorri per camminare · tocca una fotografia per aprirla' },
             en: { mano: 'scroll to walk · click a photograph to open it',
                   dito: 'swipe to walk · tap a photograph to open it' } },
  drittaSala: { it: { mano: 'trascina per guardarti intorno · scorri per muoverti · clicca una fotografia per andarle davanti',
                      dito: 'trascina per guardarti intorno · tocca una fotografia per andarle davanti' },
                en: { mano: 'drag to look around · scroll to move · click a photograph to stand in front of it',
                      dito: 'drag to look around · tap a photograph to stand in front of it' } },
  esplora:  { it: 'Esplora la sala', en: 'Explore the room' },
  continua: { it: 'Continua la visita →', en: 'Continue the visit →' }
};
/* l'indirizzo vero non c'e' ancora: senza la casa, si apre la posta con
   l'oggetto gia' scritto */
function scrivi() {
  if (window.PIANO && window.PIANO.scrivi) { window.PIANO.scrivi(); return; }
  location.href = 'mailto:?subject=' + encodeURIComponent(tr(PAROLE.oggetto));
}

/* le cornici disegnate e quanto gonfiarle: i numeri sono quelli di provini.js */
var FILE_CORNICI = { quadra: 'cornice-quadra.svg', alta: 'cornice-alta.svg', larga: 'cornice-larga.svg' };
var GONFIA = { quadra: [1.19, 1.18], alta: [1.13, 1.20], larga: [1.20, 1.13] };

function caso(i, n) { var x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); }
function qualeCornice(f) { return f.l === f.a ? 'quadra' : (f.a > f.l ? 'alta' : 'larga'); }

/* ------------------------------------------------------------------ *
 * LA PIANTA. Le misure di Blu. Le stanze vanno a serpentina e ognuna
 * gira: cosi' il muro che si ha in faccia entrando e' sempre pieno.
 * In fondo, dopo l'ultimo lavoro, la stanza della posta.
 * ------------------------------------------------------------------ */
/* LE MISURE DELLA GALLERIA (29 settembre 2026, seconda pianta). Erano
   quelle di Blu: stanze tutte uguali da quattordici metri e corridoi
   stretti da dieci. Una galleria non e' fatta cosi': i corridoi sono lunghi
   e si cammina, e una sala e' grande quanto le cose che ci stanno dentro.
   MEZZO_GRANDE tocca alle stanze con molte fotografie, MEZZO_PICCOLO alle
   altre - lo decide il volume, non il gusto. */
var MEZZO_GRANDE = 11, MEZZO_PICCOLO = 8, MEZZO_POSTA = 9;
/* I CORRIDOI SONO LUNGHI VENTOTTO (30 settembre 2026, erano diciotto): prima
   di ogni sala c'e' un tratto vuoto in cui il suo nome compare in
   sovrimpressione e se ne va, e le sparse si tengono nella prima parte. */
var RH = 8.5, CW = 5, CH = 4.4, T = 0.2, EYE = 1.65, CORR = 28;
/* SI GUARDA UN FILO IN SU. Guardando perfettamente in orizzontale meta'
   schermo e' pavimento: sei gradi bastano a dare il muro alle opere senza
   che sembri di alzare la testa. */
var SU = 0.11;
var OPP = { N:'S', S:'N', E:'W', W:'E' };
var DIR = { N:[0,-1], S:[0,1], E:[1,0], W:[-1,0] };
var DENTRO = { N:[0,0,1], S:[0,0,-1], E:[-1,0,0], W:[1,0,0] };   // la normale verso la stanza

/* LA PIANTA si puo' fare solo quando si sa quante stanze ci sono, e
   questo lo dice foto.json. Le stanze vanno a serpentina e ognuna gira:
   cosi' il muro che si ha in faccia entrando e' sempre pieno. */
var STANZE = [], parti = [], S_END = 0, R = 4;
var ARRIVO = 0;         // dove ci si ferma nella prima stanza: si fa in pianta: sulla soglia
function at(v) {
  var p = parti[parti.length - 1];
  for (var i = 0; i < parti.length; i++) if (v < parti[i].s0 + parti[i].len) { p = parti[i]; break; }
  var u = Math.max(0, v - p.s0);
  if (p.t === 'l') return [p.a[0] + p.d[0] * u, p.a[1] + p.d[1] * u];
  var ph = Math.min(1, u / p.len) * Math.PI / 2, c = Math.cos(ph), s = Math.sin(ph);
  return [p.c[0] + R * (-p.dn[0] * c + p.di[0] * s), p.c[1] + R * (-p.dn[1] * c + p.di[1] * s)];
}
/* I GRUPPI CHE NON MERITANO UNA STANZA STANNO NEI CORRIDOI, appesi a destra
   e a sinistra mentre ci si passa: tre fotografie sparse in una stanza
   sembrerebbero poche, in un corridoio sono una galleria. Lo dice foto.json
   con "dove". */
var CORRIDOI = [];
function pianta() {
  var sale = SETTORI.filter(function (s) { return s.dove !== 'corridoio'; });
  CORRIDOI = SETTORI.filter(function (s) { return s.dove === 'corridoio'; });
  STANZE = sale.concat([null]).map(function (set, i, tutte) {
    var esce = i === tutte.length - 1 ? null : (i % 2 ? 'N' : (i % 4 === 0 ? 'E' : 'W'));
    /* QUANTO E' GRANDE UNA STANZA LO DICONO LE SUE FOTOGRAFIE */
    /* conta quante ne sono APPESE, non quante ne ha la pagina: Moda ha
       sedici fotografie ma sette al muro, e in una sala grande sette
       sembravano uno sgombero */
    var mezzo = !set ? MEZZO_POSTA
              : ((set.muro || set.foto.length) >= 8 ? MEZZO_GRANDE : MEZZO_PICCOLO);
    return { set: set, posta: !set, i: i, esce: esce, mezzo: mezzo,
             /* il corridoio che esce da qui ha il suo gruppo, se c'e' */
             corridoio: CORRIDOI[i] || null };
  });
  STANZE.forEach(function (r, i) {
    if (i === 0) { r.c = [0, 0]; r.entra = 'S'; return; }
    var p = STANZE[i - 1], d = DIR[p.esce], passo = p.mezzo + CORR + r.mezzo;
    r.c = [p.c[0] + d[0] * passo, p.c[1] + d[1] * passo];
    r.entra = OPP[p.esce];
  });

  /* IL PERCORSO: da un centro all'altro, con le curve dentro le stanze. Si
     parte dal corridoio d'ingresso della prima. */
  var PTS = [[0, STANZE[0].mezzo + CORR]];
  STANZE.slice(0, -1).forEach(function (r) { PTS.push(r.c); });
  var u = STANZE[STANZE.length - 1], du = DIR[OPP[u.entra]];
  PTS.push([u.c[0] + du[0] * (u.mezzo + 4), u.c[1] + du[1] * (u.mezzo + 4)]);

  parti = []; var acc = 0;
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
  S_END = acc - (STANZE[STANZE.length - 1].mezzo + 7);

  /* LA SOGLIA DI OGNI STANZA: dove ci si ferma arrivando da fuori a quel
     settore (collab ci manda qui). E' il punto del percorso piu' vicino
     alla porta d'ingresso. */
  /* NON SULLA SOGLIA MA DENTRO: da una sala grande il muro in fondo sta a
     ventidue metri, e fermandosi sulla porta non si vede niente. Si entra
     fino a un terzo della stanza. */
  ARRIVO = CORR + STANZE[0].mezzo * 0.6;
  STANZE.forEach(function (r) {
    if (r.i === 0) { r.soglia = ARRIVO; return; }
    var d = DIR[r.entra], dentro = r.mezzo * 0.4;
    var porta = [r.c[0] + d[0] * dentro, r.c[1] + d[1] * dentro], best = 0, bd = 1e9;
    for (var v = 0; v <= S_END; v += 0.1) {
      var q = at(v), dd = Math.hypot(q[0] - porta[0], q[1] - porta[1]);
      if (dd < bd) { bd = dd; best = v; }
    }
    r.soglia = best;
  });
}

/* ------------------------------------------------------------------ *
 * LO STILE della tela e della pagina del lavoro. Sta qui e non nella casa,
 * cosi' il modulo si porta dietro tutto quel che gli serve. Tutto sta a
 * z-index 0, come il campo del tuffo: sotto la testa e il francobollo.
 * ------------------------------------------------------------------ */
var CSS = [
'#edificio { position:fixed; inset:0; width:100%; height:100%; display:block; z-index:0;',
'  opacity:0; transition:opacity .9s ease; touch-action:none; cursor:default; }',
'#edificio.visibile { opacity:1; transition:opacity .9s ease .6s; }',   // dopo il fondo della pagina
'#edificio { transition:opacity .35s ease; }',                           // uscendo, in fretta   // dopo il fondo della pagina
'#edificio.mano { cursor:pointer; }',
/* mentre si vola dentro una fotografia lo schermo e' la sua tinta: il velo
   di penombra della testa ci starebbe sopra come una fascia sporca */
'body.ed-vola #velo-testa { opacity:0 !important; transition:opacity .3s ease; }',
/* la testa della casa la veste la casa: PIANO.veste(fondo, tratto) */
/* nella pagina la voce grande e' il ruolo: la testa della casa (SHOWROOM,
   nel piano) gli starebbe addosso come un secondo titolo. Resta la freccia. */
'body.ed-pagina #titolo { opacity:0 !important; transition:opacity .3s ease; }',
/* LA PAGINA DEL LAVORO. Si arriva volando dentro una fotografia, e per un
   istante lo schermo e' tutto la sua tinta: la pagina comincia di li', e
   scende nella penombra mentre il contenuto sale. Uscendo, il contrario. */
/* comincia sotto la testa, come le pagine: il testo non passa sotto la
   freccia e la busta */
'#lavoro { position:fixed; top:var(--testa-alta, 0px); left:0; right:0; bottom:0; z-index:0; overflow-x:hidden; overflow-y:auto;',
'  -webkit-overflow-scrolling:touch; touch-action:pan-y; -webkit-user-select:text; user-select:text;',
'  background:var(--ed-tinta); visibility:hidden; transition:background-color .4s ease; }',
'#lavoro.aperto { visibility:visible; }',
'#lavoro.acceso { background:var(--ed-luce); transition:background-color .8s ease .05s; }',
'#lavoro .corpo { max-width:1160px; margin:0 auto;',
'  padding:clamp(40px, 9vh, 110px) clamp(20px, 5vw, 64px) 150px;',
'  opacity:0; transform:translateY(28px); transition:opacity .25s ease, transform .25s ease; }',
'#lavoro.acceso .corpo { opacity:1; transform:none;',
'  transition:opacity .6s ease .3s, transform .9s cubic-bezier(.2,.8,.2,1) .3s; }',
/* IN GRANDE C'E' IL RUOLO: a chi vuole commissionare un lavoro interessa
   cosa ha fatto lei. Il titolo sta sotto, piccolo, e puo' mancare. */
'#lavoro .ruolo { margin:0 0 .3em; text-align:center; font-family:var(--stampatello); font-weight:800;',
'  font-stretch:expanded; text-transform:uppercase; letter-spacing:.01em; line-height:.98;',
'  font-size:clamp(34px, 6.2vw, 94px); color:var(--ed-tratto); }',
/* sotto il ruolo, il settore: piccolo, in stampatello spaziato, come in bio */
'#lavoro .nome { margin:.9em 0 clamp(70px, 14vh, 150px); text-align:center; font-family:var(--stampatello);',
'  font-weight:800; font-stretch:expanded; text-transform:uppercase; letter-spacing:.14em;',
'  font-size:clamp(11px, 1.05vw, 15px); color:var(--ed-tratto); }',
/* le righe: una fotografia e una risposta, e si alternano i lati */
'#lavoro .riga { display:grid; grid-template-columns:1fr 1fr; gap:clamp(32px, 7vw, 110px);',
'  align-items:center; margin:0 0 clamp(90px, 16vh, 170px); }',
'#lavoro .riga:nth-child(even) .foto { order:2; }',
'#lavoro .foto { position:relative; margin:0 auto; }',
'#lavoro .scatto { display:block; width:100%; height:100%; object-fit:cover; }',
'#lavoro .cornice { position:absolute; color:var(--ed-tratto); pointer-events:none; }',
'#lavoro .cornice svg { display:block; width:100%; height:100%; overflow:visible; }',
/* LE RISPOSTE COME IN BIO: la domanda piccola e spaziata, la risposta un
   blocco in stampatello */
'#lavoro .risposta h2 { margin:0 0 .9em; font-family:var(--stampatello); font-weight:800;',
'  font-stretch:expanded; text-transform:uppercase; letter-spacing:.14em;',
'  line-height:1; font-size:clamp(11px, 1.05vw, 14px); color:var(--ed-tratto); opacity:.55; }',
'#lavoro .risposta p + h2 { margin-top:2.4em; }',
'#lavoro .risposta p { margin:0; max-width:26ch; font-family:var(--stampatello); font-weight:800;',
'  font-stretch:expanded; text-transform:uppercase; letter-spacing:-.005em;',
'  font-size:clamp(18px, 2vw, 30px); line-height:1.08; color:var(--ed-tratto); }',
/* sul telefono una colonna sola; l'alternanza resta nei margini */
/* ESPLORA LA SALA: un cartellino da museo - un filo e una scritta, spigoli
   vivi - e non un bottone da applicazione. Bianco, sul parquet: il legno
   scuro sotto lo fa leggere. */
'#ed-sala { position:fixed; left:50%; bottom:clamp(20px, 4.5vh, 42px); z-index:1; transform:translateX(-50%);',
'  border:1.5px solid #FFFFFF; border-radius:0; background:none;',
'  margin:0; padding:11px 18px 10px; cursor:pointer; color:#FFFFFF;',
'  text-shadow:0 1px 6px rgba(30,20,10,.45);',
'  font-family:var(--stampatello); font-weight:800; font-stretch:expanded; text-transform:uppercase;',
'  letter-spacing:.08em; font-size:clamp(12px, 1.05vw, 14px); line-height:1; white-space:nowrap;',
'  box-shadow:0 2px 14px rgba(30,20,10,.22), inset 0 0 0 100px rgba(40,26,14,.12);',
'  opacity:0; pointer-events:none; transition:opacity .6s ease; -webkit-tap-highlight-color:transparent; }',
'#ed-sala.vivo { opacity:1; pointer-events:auto; }',
'#ed-sala.vivo:hover, #ed-sala.vivo:focus-visible { background:#FFFFFF; color:var(--ed-tratto); text-shadow:none; outline:none; }',
'body.ed-pagina #ed-sala, body.ed-vola #ed-sala { opacity:0; pointer-events:none; }',
'@media (max-width: 720px) { #ed-sala { bottom:calc(env(safe-area-inset-bottom, 0px) + 72px); } }',
/* IL NOME DELLA SALA, in sovrimpressione: grande, nel carattere dei titoli,
   e SUL PAVIMENTO, in bianco - il legno scuro lo regge, e sta sotto le
   fotografie invece di coprirle. Lo accende e lo spegne lo scorrere. */
'#ed-nome { position:fixed; left:0; right:0; top:64%; z-index:1; margin:0; text-align:center;',
'  pointer-events:none; opacity:0; color:#FFFFFF; will-change:opacity, transform;',
'  text-shadow:0 2px 18px rgba(30,18,8,.45); }',
'#ed-nome h2 { margin:0; font-family:var(--stampatello); font-weight:800; font-stretch:expanded;',
'  text-transform:uppercase; letter-spacing:.04em; text-indent:.04em; line-height:.95;',
'  font-size:clamp(30px, 6.4vw, 104px); max-width:92vw; margin:0 auto; }',
/* sotto, il lavoro e i ruoli: piccolo, in stampatello spaziato */
'#ed-nome p { margin:.9em 0 0; font-family:var(--stampatello); font-weight:800; font-stretch:expanded;',
'  text-transform:uppercase; letter-spacing:.14em; text-indent:.14em;',
'  font-size:clamp(11px, 1.05vw, 15px); color:#FFFFFF; }',
'body.ed-pagina #ed-nome, body.ed-vola #ed-nome { opacity:0 !important; }',
'#ed-dritta { position:fixed; left:0; right:0; bottom:clamp(64px, 10vh, 96px); z-index:0;',
'  text-align:center; padding:0 20px; pointer-events:none; opacity:0;',
'  transition:opacity .8s ease; font-family:var(--stampatello); font-weight:800; font-stretch:expanded;',
'  text-transform:uppercase; font-size:clamp(11px, 1.05vw, 14px); letter-spacing:.14em; color:var(--ed-tratto); }',
'#ed-dritta.viva { opacity:.9; animation:ed-respira 2.4s ease-in-out .8s infinite; }',
'@keyframes ed-respira { 0%, 100% { opacity:.9; } 50% { opacity:.45; } }',
'@media (prefers-reduced-motion: reduce) { #ed-dritta.viva { animation:none; } }',
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
var FONDO, INCHIOSTRO, TESTO, FIRMA, DIDOT, STAMPATELLO;
/* LO SHOWROOM E' UNA GALLERIA BIANCA (29 settembre 2026). Prima andava dal
   buio al bianco mentre si camminava, e il segno doveva girare a meta'
   strada; adesso il bianco c'e' da subito e il segno e' sempre inchiostro.
   Dopo l'ingresso - che e' del colore del fondale della fotografia - nel
   sito esistono solo il bianco e il nero: qui il bianco.
   Non e' #FFF: un bianco pieno abbaglia intorno a una stampa, e le pareti
   di una galleria sono sempre un filo calde. */
var BIANCO = '#F7F6F4';
function colori() {
  FONDO = css('--fondo') || '#242D33'; FIRMA = css('--firma') || '#5B7383';
  INCHIOSTRO = FONDO; TESTO = '#3A444B';
  var r = document.documentElement.style;
  r.setProperty('--ed-tratto', INCHIOSTRO); r.setProperty('--ed-testo', TESTO);
  r.setProperty('--ed-luce', BIANCO);
  DIDOT = css('--titolo') || 'Georgia, serif';
  STAMPATELLO = css('--stampatello') || 'system-ui, sans-serif';
}

/* ------------------------------------------------------------------ *
 * Quel che va caricato una volta sola: three, le tre cornici, la busta.
 * Resta in memoria fra un'entrata e l'altra; le tessiture no, quelle sono
 * della tela, e la tela si butta uscendo.
 * ------------------------------------------------------------------ */
var SEGNI = {}, POSTA = '', pronti = null;
/* IL COLORE DI OGNI CORNICE sta in cornici.json, scritto a mano: un nome
   della tavolozza o un esadecimale per ogni fotografia. Se il file manca
   sono tutte d'inchiostro, come prima. ?nomi scrive sotto ogni stampa il
   suo nome, per sapere quale riga del file tocca. */
var CORNICI = null, NOMI = /[?&]nomi\b/.test(location.search);
function coloreCornice(f) {
  var c = CORNICI || {}, t = c.tavolozza || {};
  var v = (c.cornici && c.cornici[f.id]) || c.tutte || '';
  return t[v] || (/^#[0-9a-f]{3,8}$/i.test(v) ? v : INCHIOSTRO);
}
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
/* SENZA LA PAROLA (1 ottobre 2026): sotto c'e' gia' "scrivimi", e MAIL
   ripeteva la stessa cosa. Nel file busta e parola sono un tracciato solo
   e si sovrappongono in altezza - la M sale fino a 724, l'angolo destro
   della busta scende a 732 - quindi non basta tagliare dritto: si ritaglia
   con un gradino, misurato sul disegno. */
var SOLA_BUSTA = { alta: 740, gradino: 600, sotto: 720 };
function busta(t) {
  var svg = new DOMParser().parseFromString(t, 'image/svg+xml').documentElement;
  var fondo = svg.querySelector('rect'); if (fondo) fondo.remove();
  var vb = svg.viewBox.baseVal, B = SOLA_BUSTA, NS = 'http://www.w3.org/2000/svg';
  if (vb && vb.height > B.alta) {
    var cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', 'sola-busta');
    var pol = document.createElementNS(NS, 'polygon');
    pol.setAttribute('points', '0,0 ' + vb.width + ',0 ' + vb.width + ',' + B.alta + ' ' +
      B.gradino + ',' + B.alta + ' ' + B.gradino + ',' + B.sotto + ' 0,' + B.sotto);
    cp.appendChild(pol); svg.insertBefore(cp, svg.firstChild);
    svg.querySelectorAll('path').forEach(function (p) { p.setAttribute('clip-path', 'url(#sola-busta)'); });
    svg.setAttribute('viewBox', '0 0 ' + vb.width + ' ' + B.alta);
  }
  svg.querySelectorAll('path').forEach(function (p) { p.setAttribute('fill', 'currentColor'); });
  svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.setAttribute('aria-hidden', 'true');
  return new XMLSerializer().serializeToString(svg);
}
function prepara() {
  if (!pronti) {
    pronti = Promise.all([
      conTre(), cornice('quadra'), cornice('alta'), cornice('larga'),
      testo('foto.json').then(function (t) { SETTORI = JSON.parse(t).settori; pianta(); }),
      testo('mail.svg').then(function (t) { POSTA = busta(t); }).catch(function () {}),
      testo('cornici.json').then(function (t) { CORNICI = JSON.parse(t); })
        .catch(function () { console.warn('edificio: cornici.json non si legge, tutte d\'inchiostro'); })
    ]);
    pronti.catch(function () { pronti = null; });   // la prossima volta si riprova
  }
  return pronti;
}

/* ------------------------------------------------------------------ *
 * LO STATO DI UN'ENTRATA. Tutto quel che segue vive finche' la tela e'
 * accesa, e si rifa' da capo alla prossima.
 * ------------------------------------------------------------------ */
var acceso = false, volta = 0, dritta = null, drittaVia = null;
var tela, pagina, corpo, renderer, scene, camera, muroMat, muri, foto, tex, ANISO, giroId;
var mode = 'cammina', anim = null, giu = null, mosso = 0, prima = 0, veloT = null;
var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* LE FERMATE: per ogni fotografia il punto davanti a lei da cui la si
   guarda, quando si esplora una sala (vedi fermate() e posto()). */
var FERMATE = [], fovBase = 68;
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
   seme: l'edificio e' disegnato sempre uguale.
   SGHEMBI COME LE CORNICI (30 settembre 2026): prima erano fili sottili e
   quasi dritti, e accanto alle cornici delle fotografie - pennarello grosso,
   storto, che sfora - sembravano di un altro disegnatore. Adesso sono piu'
   spessi, si piegano di piu', sforano di piu' agli angoli, e le linee
   lunghe si ripassano una seconda volta un po' fuori squadra, come si fa a
   mano quando una riga non viene in un colpo solo. E sono neri: il colore
   si sceglie solo per le cornici delle fotografie (cornici.json). */
function Tratti() { this.p = []; this.i = []; this.semi = 0; }
Tratti.prototype.linea = function (A, B, n, w) {
  var sm = ++this.semi + (this.base || 0);
  var dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2], L = Math.hypot(dx, dy, dz);
  if (L < 1e-4) return;
  var d = [dx / L, dy / L, dz / L];
  var sd = [n[1] * d[2] - n[2] * d[1], n[2] * d[0] - n[0] * d[2], n[0] * d[1] - n[1] * d[0]];
  var t0 = -(0.08 + caso(sm, 1) * 0.3) / L, t1 = 1 + (0.08 + caso(sm, 2) * 0.32) / L;
  var arco = (caso(sm, 3) - 0.5) * Math.min(0.4, L * 0.035);
  var fase = caso(sm, 4) * 6.283, giri = 1 + caso(sm, 5) * 2.5;
  var N = Math.max(8, Math.ceil(L * 6)), base = this.p.length / 3;
  for (var k = 0; k <= N; k++) {
    var u = k / N, tt = t0 + (t1 - t0) * u;
    var off = arco * Math.sin(Math.PI * u) + 0.028 * Math.sin(fase + u * giri * 6.283);
    var mezzo = w * 0.5 * (0.62 + 0.38 * Math.pow(Math.sin(Math.PI * u), 0.3)) *
                (0.88 + 0.24 * Math.sin(fase * 2 + u * 11));
    var cx = A[0] + dx * tt + sd[0] * off, cy = A[1] + dy * tt + sd[1] * off, cz = A[2] + dz * tt + sd[2] * off;
    this.p.push(cx + sd[0] * mezzo, cy + sd[1] * mezzo, cz + sd[2] * mezzo,
                cx - sd[0] * mezzo, cy - sd[1] * mezzo, cz - sd[2] * mezzo);
    if (k < N) { var a = base + k * 2; this.i.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  /* la ripassata: solo sulle linee lunghe, piu' sottile, spostata di poco
     e un filo storta rispetto alla prima */
  if (!this.ripasso && L > 3 && caso(sm, 6) < 0.7) {
    var sp = (caso(sm, 7) - 0.5) * w * 1.6, st = (caso(sm, 8) - 0.5) * w * 2.4;
    this.ripasso = true;
    this.linea([A[0] + sd[0] * sp, A[1] + sd[1] * sp, A[2] + sd[2] * sp],
               [B[0] + sd[0] * (sp + st), B[1] + sd[1] * (sp + st), B[2] + sd[2] * (sp + st)],
               n, w * 0.6);
    this.ripasso = false;
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
var W = 0.10;                 // il pennarello, grosso come quello delle cornici
var NERO_MURI = '#141414';     // i muri sono neri, sempre
var ALZA = T / 2 + 0.02;      // il segno sta sulla faccia del muro, appena fuori

function disegna() {
  var tratto = new Tratti();

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
  function capi(c, lato, H) {
    var x = c[0], z = c[1];
    return { N:[[x-H,z-H],[x+H,z-H]], S:[[x+H,z+H],[x-H,z+H]],
             E:[[x+H,z-H],[x+H,z+H]], W:[[x-H,z+H],[x-H,z-H]] }[lato];
  }
  function corridoio(c, lato, H) {
    var d = DIR[lato], p = [-d[1], d[0]], h = CW / 2;
    [1, -1].forEach(function (sg) {
      var a = [c[0] + d[0] * H + p[0] * h * sg, c[1] + d[1] * H + p[1] * h * sg];
      var b = [c[0] + d[0] * (H + CORR) + p[0] * h * sg, c[1] + d[1] * (H + CORR) + p[1] * h * sg];
      muro(a[0], a[1], b[0], b[1], 0, CH);
      var n = [-p[0] * sg, 0, -p[1] * sg];
      function Q(pt, y) { return [pt[0] + n[0] * ALZA, y, pt[1] + n[2] * ALZA]; }
      tratto.linea(Q(a, W * 0.5 + 0.01), Q(b, W * 0.5 + 0.01), n, W);
      tratto.linea(Q(a, CH - W * 0.5), Q(b, CH - W * 0.5), n, W);
    });
  }

  STANZE.forEach(function (r) {
    ['N', 'E', 'S', 'W'].forEach(function (lato) {
      var e = capi(r.c, lato, r.mezzo), porta = (lato === r.entra || lato === r.esce);
      var a = e[0], b = e[1];
      if (!porta) muro(a[0], a[1], b[0], b[1], 0, RH);
      else {
        var mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2,
            ux = (b[0] - a[0]) / (2 * r.mezzo), uz = (b[1] - a[1]) / (2 * r.mezzo), h = CW / 2;
        muro(a[0], a[1], mx - ux * h, mz - uz * h, 0, RH);
        muro(mx + ux * h, mz + uz * h, b[0], b[1], 0, RH);
        muro(mx - ux * h, mz - uz * h, mx + ux * h, mz + uz * h, CH, RH - CH);
      }
      faccia(a, b, DENTRO[lato], RH, porta);
    });
    if (r.esce) corridoio(r.c, r.esce, r.mezzo);
    if (r.i === 0) corridoio(r.c, r.entra, r.mezzo);
  });
  scene.add(tratto.mesh(NERO_MURI, 1));
}

/* mette una cosa sulla faccia interna del muro "lato" della stanza c */
function posa(c, lato, u, y, obj, stacco, mezzo) {
  var H = (mezzo || MEZZO_PICCOLO) - T / 2 - (stacco || 0.03);
  var o = { N:[c[0]+u, c[1]-H, 0], S:[c[0]-u, c[1]+H, Math.PI],
            E:[c[0]+H, c[1]+u, -Math.PI/2], W:[c[0]-H, c[1]-u, Math.PI/2] }[lato];
  obj.position.set(o[0], y, o[1]); obj.rotation.y = o[2];
}
/* la cornice sta nel suo riquadro senza deformarsi, come un svg in un div */
function dentroA(cw, ch, A) { return cw / ch > A ? [ch * A, ch] : [cw, cw / A]; }
function tessitura(cv) { var x = new THREE.CanvasTexture(cv); x.anisotropy = ANISO; tex.push(x); return x; }

/* il corpo del testo in stampatello, ridotto finche' la riga sta in max */
function stampa(x, testo, corpo, max) {
  x.font = '800 expanded ' + corpo + 'px ' + STAMPATELLO;
  var l = x.measureText(testo).width;
  if (l > max) { corpo = Math.floor(corpo * max / l); x.font = '800 expanded ' + corpo + 'px ' + STAMPATELLO; }
  return corpo;
}
/* IL CARTELLO DELLA POSTA: la domanda, la busta e "scrivimi". Si tocca
   tutto. La busta arriva dopo, e si ridisegna.
   LA DOMANDA SI SCRIVE (1 ottobre 2026): il cartello resta vuoto finche'
   non ci si avvicina, poi le lettere arrivano una alla volta, come le
   parole in bio; dopo la domanda la busta, e per ultimo "scrivimi". */
var CARTELLO = null;
/* COMINCIA DA LONTANO (1 ottobre 2026): a "lontano" metri la prima lettera,
   e avvicinandosi la domanda cresce col passo; a "vicino" - si e' nella
   sala - finisce da sola, a una lettera ogni "lettera" secondi, e poi la
   busta e "scrivimi". Non torna mai indietro. */
var SCRITTURA = { lontano: 60, vicino: 16, lettera: 0.06, busta: 0.5, scrivimi: 0.5 };   // metri, secondi
function cartelloPosta() {
  var cv = document.createElement('canvas'); cv.width = 2048; cv.height = 1024;
  var x = cv.getContext('2d'), tx = tessitura(cv), righe = tr(PAROLE.muro), img = null;
  var lettere = righe[0].length + righe[1].length;
  var durata = lettere * SCRITTURA.lettera + SCRITTURA.busta + SCRITTURA.scrivimi;
  /* t: i secondi di scrittura passati; Infinity e' il cartello intero */
  function scrivi(t) {
    x.clearRect(0, 0, 2048, 1024);
    x.textBaseline = 'alphabetic'; x.fillStyle = '#FFFFFF';
    var c1 = Math.min(stampa(x, righe[0], 190, 1900), stampa(x, righe[1], 190, 1900));
    stampa(x, righe[0], c1, 1900);
    /* ogni riga si scrive da sinistra, ma sta dove starebbe intera:
       centrata, e non si sposta mentre cresce */
    var n = Math.floor(t / SCRITTURA.lettera);
    x.textAlign = 'left';
    righe.forEach(function (r, i) {
      var quante = Math.max(0, Math.min(r.length, n - (i ? righe[0].length : 0)));
      if (quante) x.fillText(r.slice(0, quante), 1024 - x.measureText(r).width / 2,
                             60 + c1 * 0.74 + i * c1 * 0.95);
    });
    var dopo = t - lettere * SCRITTURA.lettera;
    x.textAlign = 'center';
    if (img && dopo > 0) {
      x.globalAlpha = Math.min(1, dopo / SCRITTURA.busta);
      var h = 300, w = h * img.width / img.height; x.drawImage(img, 1024 - w / 2, 470, w, h);
    }
    dopo -= SCRITTURA.busta;
    if (dopo > 0) {
      x.globalAlpha = Math.min(1, dopo / SCRITTURA.scrivimi);
      stampa(x, tr(PAROLE.scrivimi).toUpperCase(), 64, 900);
      x.fillText(tr(PAROLE.scrivimi).toUpperCase(), 1024, 850);
    }
    x.globalAlpha = 1;
    tx.needsUpdate = true;
  }
  var domanda = lettere * SCRITTURA.lettera;
  CARTELLO = { t: reduced ? Infinity : 0, mesh: null,
    /* d: quanto si e' lontani dal cartello */
    passo: function (d, dt) {
      if (this.t >= durata) return;
      var S = SCRITTURA, t = this.t;
      if (d < S.vicino) t += dt;                                   // nella sala: da sola
      var k = (S.lontano - d) / (S.lontano - S.vicino);             // il passo: quanto della domanda
      t = Math.max(t, Math.min(1, Math.max(0, k)) * domanda * 0.85);
      if (t === this.t) return;
      this.t = Math.min(durata, t); scrivi(this.t);
    } };
  scrivi(CARTELLO.t);
  if (POSTA) {
    var vb = /viewBox="([^"]+)"/.exec(POSTA), v = vb ? vb[1].split(/[\s,]+/).map(Number) : [0, 0, 3, 2];
    immagine(POSTA, Math.round(400 * v[2] / v[3]), 400)
      .then(function (i) { img = i; scrivi(CARTELLO.t); }).catch(function () {});
  }
  return tx;
}

/* LE FOTOGRAFIE VERE. Ognuna tiene la sua forma: il lato lungo e' sempre
   lo stesso, cosi' una verticale e una orizzontale hanno lo stesso peso sul
   muro senza che nessuna venga tagliata. Finche' la tessitura non e'
   arrivata, il riquadro e' del colore dominante dello scatto (lo misura il
   generatore del sito nero): non si vede nessun buco bianco. */
/* QUANTO E' GRANDE UNA STAMPA. Quattro metri sul lato lungo (30 settembre
   2026): a due, su muri alti otto e mezzo, sembravano francobolli - la
   stampa da galleria vera e' piccola perche' la stanza vera e' piccola.
   Nelle sale grandi cresce appena, perche' il muro e' piu' lontano. */
var LUNGO = 4.0;
function misuraFoto(f, mezzo) {
  var l = LUNGO * Math.pow((mezzo || MEZZO_PICCOLO) / MEZZO_PICCOLO, 0.3);
  return f.ar >= 1 ? [l, l / f.ar] : [l * f.ar, l];
}
/* DOVE SI APPENDE. Il centro all'altezza dell'occhio, ma il bordo di sotto
   mai piu' in basso di ottantacinque centimetri: una stampa appoggiata al
   pavimento non e' appesa, e' in magazzino. */
function altezza(h) { return Math.max(EYE, 0.85 + h / 2); }
/* L'OMBRA. Su una parete bianca una fotografia chiara si vedeva come un
   RITAGLIO: due bianchi diversi accostati, senza niente che dica che uno e'
   una stampa e l'altro e' il muro. Una stampa appesa fa ombra. E' una
   tessitura sola, morbida, tirata dietro a ogni fotografia e spostata in
   giu' di pochi centimetri: basta quella a staccarla dal muro. */
var OMBRA = null;
function ombra() {
  if (OMBRA) return OMBRA;
  var L = 256, cv = document.createElement('canvas');
  cv.width = cv.height = L;
  var x = cv.getContext('2d');
  x.shadowColor = 'rgba(30,26,20,.55)'; x.shadowBlur = 26;
  x.shadowOffsetX = 0; x.shadowOffsetY = 0;
  x.fillStyle = 'rgba(30,26,20,.55)';
  x.fillRect(L * 0.13, L * 0.13, L * 0.74, L * 0.74);
  OMBRA = new THREE.CanvasTexture(cv);
  return OMBRA;
}
function scatto(f, mat) {
  var url = fresco('foto/' + f.id + '-900.webp');   // 900: sui muri da quattro metri la 450 era sgranata
  new THREE.TextureLoader().load(url, function (tx) {
    tx.anisotropy = ANISO;
    if (tex) tex.push(tx);
    mat.map = tx; mat.color.set('#FFFFFF'); mat.needsUpdate = true;
  }, null, function () { console.warn('edificio: non trovo ' + url); });
}
function appendi(r, lato, u, f, k, cornici) {
  var d = misuraFoto(f, r.mezzo), w = d[0], h = d[1], kind = qualeCornice({ l: w, a: h });
  var g = new THREE.Group();
  var om = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.3, h * 1.3),
    new THREE.MeshBasicMaterial({ map: ombra(), transparent: true, depthWrite: false, opacity: 0.85 }));
  om.position.set(0, -0.05, -0.012);
  g.add(om);
  var mat = new THREE.MeshBasicMaterial({ color: f.colore || '#888888' });
  var sc = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  scatto(f, mat);
  g.add(sc);
  /* la cornice come nella galleria: non combacia mai, sborda da due lati */
  var sx = 0.965 + caso(k, 1) * 0.085, sy = 0.965 + caso(k, 2) * 0.085;
  if (sx > 1 && sy > 1) sy = 0.972;
  if (sx < 1 && sy < 1) sx = 1.042;
  var gf = GONFIA[kind], dim = dentroA(w * sx * gf[0], h * sy * gf[1], SEGNI[kind].A);
  var cr = new THREE.Mesh(new THREE.PlaneGeometry(dim[0], dim[1]),
    new THREE.MeshBasicMaterial({ map: cornici[kind], transparent: true, depthWrite: false,
                                  color: coloreCornice(f) }));
  cr.position.set((caso(k, 3) - 0.5) * 0.055 * w, (caso(k, 4) - 0.5) * 0.055 * h, 0.015);
  cr.rotation.z = (caso(k, 5) - 0.5) * 3.2 * Math.PI / 180;
  g.add(cr);
  if (NOMI) g.add(targhetta(f.id, h));
  posa(r.c, lato, u, altezza(h), g, 0.035, r.mezzo);
  sc.userData = { stanza: r, f: f, gruppo: g };
  scene.add(g); foto.push(sc);
}
/* LA TARGHETTA di ?nomi: il nome della fotografia sotto la stampa, lo
   stesso che si scrive in cornici.json */
function targhetta(id, h) {
  var cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
  var x = cv.getContext('2d');
  x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 512, 128);
  x.fillStyle = '#F5332A'; x.font = '800 72px ' + STAMPATELLO;
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(id, 256, 68);
  var m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6),
    new THREE.MeshBasicMaterial({ map: tessitura(cv), transparent: true }));
  m.position.set(0, -h / 2 - 0.5, 0.03);
  return m;
}
/* NEL CORRIDOIO si appende a destra e a sinistra, alternando: si passa
   in mezzo e le si sfiora una per volta. Il muro e' alto tre metri e si sta
   a un metro e mezzo, quindi le fotografie sono piu' piccole che in una
   stanza. Il gruppo del corridoio non ha stanza, ma ha la sua pagina: si
   apre come le altre, e per farlo gli serve una finta stanza. */
var CORTO = 2.8;
function nelCorridoio(r, set, k, cornici) {
  var finta = { set: set, i: 90 + r.i, posta: false, corridoio: null };
  var d = DIR[r.esce], p = [-d[1], d[0]];
  var H = CW / 2 - T / 2 - 0.04;
  var n = Math.min(set.muro || set.foto.length, set.foto.length);
  set.foto.slice(0, n).forEach(function (f, i) {
    var sg = i % 2 ? 1 : -1;
    /* nella prima meta' del corridoio: l'ultimo tratto e' del nome della sala dopo */
    var avanti = r.mezzo + 3.4 + (n > 1 ? i * (CORR - 16) / (n - 1) : 0);
    var w, h;
    if (f.ar >= 1) { w = CORTO; h = CORTO / f.ar; } else { w = CORTO * f.ar; h = CORTO; }
    var g = new THREE.Group();
    var om = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.3, h * 1.3),
      new THREE.MeshBasicMaterial({ map: ombra(), transparent: true, depthWrite: false, opacity: 0.85 }));
    om.position.set(0, -0.05, -0.012);
    g.add(om);
    var mat = new THREE.MeshBasicMaterial({ color: f.colore || '#888888' });
    var sc = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    scatto(f, mat);
    g.add(sc);
    var kind = qualeCornice({ l: w, a: h }), gf = GONFIA[kind];
    var sx = 0.965 + caso(k + i, 1) * 0.085, sy = 0.965 + caso(k + i, 2) * 0.085;
    var dim = dentroA(w * sx * gf[0], h * sy * gf[1], SEGNI[kind].A);
    var cr = new THREE.Mesh(new THREE.PlaneGeometry(dim[0], dim[1]),
      new THREE.MeshBasicMaterial({ map: cornici[kind], transparent: true, depthWrite: false,
                                    color: coloreCornice(f) }));
    cr.position.set(0, 0, 0.012);
    cr.rotation.z = (caso(k + i, 5) - 0.5) * 3.2 * Math.PI / 180;
    g.add(cr);
    if (NOMI) g.add(targhetta(f.id, h));
    g.position.set(r.c[0] + d[0] * avanti + p[0] * H * sg, altezza(h),
                   r.c[1] + d[1] * avanti + p[1] * H * sg);
    g.rotation.y = Math.atan2(-p[0] * sg, -p[1] * sg);
    sc.userData = { stanza: finta, f: f, gruppo: g };
    scene.add(g); foto.push(sc);
  });
  return k + n;
}

/* SUI MURI NE STANNO POCHE, il resto sta nella pagina: una stanza non e'
   un magazzino. Le prime della lista sono quelle appese. */
function arreda() {
  var cornici = {}, k = 0;
  for (var n in SEGNI) cornici[n] = tessitura(SEGNI[n].cv);
  STANZE.forEach(function (r) {
    var faccia = OPP[r.entra];
    if (r.posta) {
      var cp = new THREE.Mesh(new THREE.PlaneGeometry(8, 4),
        tinto(new THREE.MeshBasicMaterial({ map: cartelloPosta(), transparent: true, depthWrite: false })));
      posa(r.c, faccia, 0, 3.1, cp, 0.03, r.mezzo);
      cp.userData = { posta: true };
      if (CARTELLO) CARTELLO.mesh = cp;
      scene.add(cp); foto.push(cp);
      return;
    }
    /* il nome della sala non sta piu' sul muro: compare in sovrimpressione
       mentre ci si avvicina (vedi IL NOME DELLA SALA) */
    var liberi = ['N', 'E', 'S', 'W'].filter(function (lato) {
      return lato !== r.entra && lato !== r.esce && lato !== faccia;
    });
    /* due sul muro in faccia, sotto il nome, e due per ogni muro libero.
       Quante ne restano appese lo dice foto.json ("muro"): le altre si
       vedono aprendo la pagina. */
    /* I POSTI SI ALLARGANO CON LA STANZA, e in una sala grande ce ne stanno
       di piu': tre per muro pieno, due per muro con la porta - di fianco
       alla porta, che e' larga cinque metri. Una parete da ventidue metri
       con due fotografie in mezzo sembra uno sgombero. */
    /* L'ORDINE DEI POSTI E' L'ORDINE DI foto.json (30 settembre 2026): le
       prime tre sulla parete di fronte, da sinistra a destra come le vede
       chi entra; poi la parete libera, dal fondo verso quella di fronte;
       poi i due lati della porta da cui si e' entrati; poi quella d'uscita.
       Cosi' chi sceglie le fotografie sceglie anche dove stanno - le
       migliori davanti - e porta-le-foto.sh lo dice accanto alla scelta. */
    var l1 = r.mezzo * 0.62;
    var posti = [[faccia, -l1], [faccia, 0], [faccia, l1]];
    liberi.forEach(function (lato) { posti.push([lato, -l1], [lato, l1]); });
    posti.push([r.entra, -l1], [r.entra, l1]);
    if (r.esce) posti.push([r.esce, -l1], [r.esce, l1]);
    liberi.forEach(function (lato) { posti.push([lato, 0]); });
    /* sul muro in faccia il posto di mezzo e' sotto il nome: ci sta solo se
       le fotografie sono tante, se no il nome resta da solo */
    if ((r.set.muro || 0) < 6) posti.splice(1, 1);
    var quante = Math.min(r.set.muro || posti.length, posti.length, r.set.foto.length);
    r.set.foto.slice(0, quante).forEach(function (f, i) {
      appendi(r, posti[i][0], posti[i][1], f, ++k, cornici);
    });
    if (r.corridoio) k = nelCorridoio(r, r.corridoio, k, cornici);
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
/* una fotografia della pagina: tiene la sua forma, le verticali sono piu'
   strette delle orizzontali, e la cornice sborda come nella galleria */
function fotoInPagina(f, k) {
  var kind = f.ar >= 1 ? (f.ar > 1.05 ? 'larga' : 'quadra') : 'alta', gf = GONFIA[kind];
  var box = el('div', 'foto');
  box.style.width = (f.ar >= 1 ? 100 : 72) + '%';
  box.style.aspectRatio = f.w + ' / ' + f.h;
  var im = el('img', 'scatto');
  im.src = fresco('foto/' + f.id + '-900.webp');
  im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
  im.style.background = f.colore || 'transparent';
  box.appendChild(im);
  var sx = 0.965 + caso(k, 1) * 0.085, sy = 0.965 + caso(k, 2) * 0.085;
  if (sx > 1 && sy > 1) sy = 0.972;
  if (sx < 1 && sy < 1) sx = 1.042;
  var cw = sx * gf[0] * 100, ch = sy * gf[1] * 100, c = el('div', 'cornice');
  c.style.width = cw.toFixed(1) + '%'; c.style.height = ch.toFixed(1) + '%';
  c.style.left = ((100 - cw) / 2 + (caso(k, 3) - 0.5) * 5.5).toFixed(1) + '%';
  c.style.top  = ((100 - ch) / 2 + (caso(k, 4) - 0.5) * 5.5).toFixed(1) + '%';
  c.style.transform = 'rotate(' + ((caso(k, 5) - 0.5) * 3.2).toFixed(2) + 'deg)';
  c.style.color = coloreCornice(f);
  c.innerHTML = SEGNI[kind].svg;
  box.appendChild(c);
  return box;
}
/* LA PAGINA DEL SETTORE: in cima il nome, poi TUTTE le sue fotografie, a
   destra e a sinistra. Le prime sei hanno accanto una risposta; le altre
   parlano da sole. Si comincia da quella che si e' toccata. */
function componiPagina(sc) {
  var r = sc.stanza, set = r.set, dico = risposte(set.id);
  corpo.innerHTML = '';
  /* una sparsa non e' una sala: niente nome del gruppo e niente frase di
     presentazione, c'e' la fotografia e basta */
  if (set.dove !== 'corridoio') {
    /* in grande il ruolo, sotto il settore: conta di piu' cosa ha fatto lei
       che in che campo */
    corpo.appendChild(el('h1', 'ruolo', tr(set.ruolo)));
    if (tr(set.settore)) corpo.appendChild(el('p', 'nome', tr(set.settore)));
  }

  /* LE SPARSE SONO LAVORI A SE' (30 settembre 2026): le tre del corridoio
     non sono un servizio, sono tre scatti ognuno per conto suo. La loro
     pagina ha una fotografia sola, e accanto tutte le risposte. Moda e
     Fuori invece sono un set: la pagina e' il set intero, a partire da
     quella toccata. */
  var sola = set.dove === 'corridoio';
  var ordine = sola ? [sc.f] : set.foto.slice();
  var da = ordine.indexOf(sc.f);
  if (da > 0) ordine = ordine.slice(da).concat(ordine.slice(0, da));

  var righe = el('div', 'righe');
  ordine.forEach(function (f, j) {
    var riga = el('section', 'riga');
    riga.appendChild(fotoInPagina(f, 500 + r.i * 32 + j));
    var ris = el('div', 'risposta');
    (sola ? DOMANDE.map(function (x, k) { return k; }) : (j < DOMANDE.length ? [j] : [])).forEach(function (k) {
      ris.appendChild(el('h2', '', tr(DOMANDE[k])));
      ris.appendChild(el('p', '', tr(dico.r[k])));
    });
    riga.appendChild(ris);
    righe.appendChild(riga);
  });
  corpo.appendChild(righe);

}

/* Si apre dalla tinta, come si e' arrivati; e si chiude tornandoci. Lo
   stato di partenza si mette SENZA transizione e si forza il conto, se no
   l'animazione parte da dove non era (vedi il README). */
function apriPagina(sc) {
  componiPagina(sc);
  document.documentElement.style.setProperty('--ed-tinta', (sc.f && sc.f.colore) || FONDO);
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
 * IL PERCORSO E LA SALA (30 settembre 2026, quinto giro).
 * DI NORMA SI CAMMINA E BASTA: scorrendo si va avanti lungo il percorso,
 * morbidi, guardando dove si va; scorrendo all'indietro si torna. Niente
 * fermate che tirano, niente sguardo che gira da solo: il giro di prima era
 * scattante, e costringeva a vedere tutto.
 * CHI VUOLE GUARDARE UNA SALA A MANO LO CHIEDE: nella seconda meta' di ogni
 * sala, prima di uscirne, in basso compare "Esplora la sala". Li' il
 * percorso si ferma e la sala e' sua: si trascina per guardarsi intorno, si
 * scorre per andare dove si guarda, si clicca una fotografia per andarle
 * davanti e di nuovo per aprirla. "Continua la visita" rimette sul percorso.
 * Il mouse, senza cliccare, gira sempre un poco la testa.
 * ------------------------------------------------------------------ */
var CHINA = 0.32;
var s = 0, sT = 0, ultimaRotella = 0;
var testa = [0, 0], testaT = [0, 0];      // quanto il mouse gira la testa: di lato, in su
var visita = 'percorso', sala = null, esplorabile = null, bottoneSala = null;
/* in una sala: dove si sta, dove si guarda (assoluto) e quanto in su */
var E = { x: 0, z: 0, yaw: 0, alza: 0 }, ET = { x: 0, z: 0, yaw: 0, alza: 0 };
var ritorno = null;                          // la strada dalla sala al percorso

function rotta(v) { var p = at(v), q = at(v + 3); return Math.atan2(q[0] - p[0], q[1] - p[1]); }
function angolo(a, b, e) {
  var d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return a + d * e;
}
/* dove si puo' stare in una sala: dentro, lontano un metro e mezzo dai muri */
function dentroSala(r, x, z) {
  var m = r.mezzo - 1.5;
  return [clamp(x, r.c[0] - m, r.c[0] + m), clamp(z, r.c[1] - m, r.c[1] + m)];
}
/* LA SECONDA META' DI OGNI SALA: dal punto del percorso piu' vicino al
   centro fino alla porta d'uscita. E' li' che si puo' chiedere di
   esplorarla - prima di lasciarla. */
function meta(r) {
  if (r.meta) return r.meta;
  var sc = 0, bd = 1e9;
  for (var v = 0; v <= S_END; v += 0.2) {
    var q = at(v), d = Math.hypot(q[0] - r.c[0], q[1] - r.c[1]);
    if (d < bd) { bd = d; sc = v; }
  }
  r.meta = [sc - 1.5, sc + r.mezzo + 1];
  return r.meta;
}
function salaQui() {
  for (var i = 0; i < STANZE.length; i++) {
    var r = STANZE[i];
    if (r.posta) continue;
    var m = meta(r);
    if (s >= m[0] && s <= m[1]) return r;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * IL NOME DELLA SALA (30 settembre 2026). Stava scritto sul muro di
 * fronte; adesso compare in sovrimpressione mentre ci si avvicina al vano,
 * nell'ultimo tratto del corridoio, e se ne va prima di entrare. Lo guida lo
 * scorrere, non il tempo: tornando indietro ricompare. Solo per le sale che
 * sono un set - Moda e Fuori -, non per il corridoio e non per la posta.
 * ------------------------------------------------------------------ */
var nomeSala = null, nomeQui = null;
function vano(r) {
  if (r.vano != null) return r.vano;
  /* il primo punto del percorso che sta dentro la sala */
  for (var v = 0; v <= S_END; v += 0.1) {
    var q = at(v);
    if (Math.abs(q[0] - r.c[0]) <= r.mezzo && Math.abs(q[1] - r.c[1]) <= r.mezzo) { r.vano = v; return v; }
  }
  r.vano = 0; return 0;
}
function lisciato(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function aggiornaNome() {
  if (!nomeSala) return;
  var chi = null, forza = 0, dopo = 0;
  if (visita === 'percorso' || visita === 'torna') {
    STANZE.forEach(function (r) {
      if (!r.set) return;
      var v = vano(r);
      /* entra fra dieci e sette metri prima del vano, resta, e se ne va
         negli ultimi tre */
      var f = lisciato(v - 10, v - 7, s) * (1 - lisciato(v - 3.5, v - 0.5, s));
      if (f > forza) { forza = f; chi = r; dopo = clamp((s - (v - 10)) / 9.5, 0, 1); }
    });
  }
  if (chi && chi !== nomeQui) {
    nomeQui = chi;
    nomeSala.firstChild.textContent = tr(chi.set.ruolo);
    nomeSala.lastChild.textContent = tr(chi.set.settore) || '';
  }
  nomeSala.style.opacity = forza.toFixed(3);
  /* si avvicina appena, mentre si cammina: e' scritto nell'aria, non sul muro */
  nomeSala.style.transform = 'scale(' + (0.96 + dopo * 0.08).toFixed(4) + ')';
}

function rotella(e) {
  e.preventDefault();                  // anche il gesto "indietro" del trackpad
  if (mode !== 'cammina') return;
  var k = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? 400 : 1);
  var d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * k;
  viaLaDritta();
  if (visita === 'sala') { cammina(-d * 0.012); return; }
  /* davanti a una fotografia, scorrere vuol dire riprendere la visita */
  if (visita === 'osserva') { if (Math.abs(d) > 8) continuaVisita(); return; }
  if (visita === 'torna') return;
  /* la meta' non scappa oltre sei metri da dove si e': la coda d'inerzia
     di un trackpad, sommata, portava in un'altra sala */
  sT = clamp(clamp(sT + d * 0.012, s - 6, s + 6), 0, S_END);
  ultimaRotella = performance.now();
}
/* in una sala si va avanti e indietro dove si guarda */
function cammina(v) {
  var p = dentroSala(sala, ET.x + Math.sin(ET.yaw) * v, ET.z + Math.cos(ET.yaw) * v);
  ET.x = p[0]; ET.z = p[1];
}
function premi(e) {
  giu = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, dito: e.pointerType !== 'mouse' }; mosso = 0;
  try { tela.setPointerCapture(e.pointerId); } catch (x) {}
}
function muovi(e) {
  if (giu) {
    var dx = e.clientX - giu.x, dy = e.clientY - giu.y;
    mosso = Math.abs(e.clientX - giu.x0) + Math.abs(e.clientY - giu.y0);
    giu.x = e.clientX; giu.y = e.clientY;
    if (visita === 'sala' || visita === 'osserva') {
      /* nella sala, o davanti a una fotografia, si trascina per guardarsi
         intorno */
      ET.yaw += dx * 0.004;
      ET.alza = clamp(ET.alza + dy * 0.0025, -CHINA, CHINA);
    } else if (giu.dito) {
      /* sul percorso il dito cammina, come si scorre una pagina */
      sT = clamp(clamp(sT - dy * 0.03, s - 6, s + 6), 0, S_END);
    }
    if (mosso > 20) viaLaDritta();
    return;
  }
  if (e.pointerType !== 'mouse') return;
  /* IL MOUSE GIRA LA TESTA, senza cliccare: verso dove punta, poco. Si
     guarda, non si guida. */
  testaT = [-(e.clientX / innerWidth - 0.5) * 0.5, -(e.clientY / innerHeight - 0.5) * 0.2];
  tela.classList.toggle('mano', mode === 'cammina' && !!scegli(e));
}
function lascia(e) {
  if (!giu) return;
  if (mosso < 8 && mode === 'cammina') {
    var h = scegli(e);
    if (h && h.userData.posta) scrivi();
    else if (h) tocca(h);
  }
  giu = null;
}
/* IL CLIC SU UNA FOTOGRAFIA: il primo porta davanti a lei, a guardarla
   bene; il secondo, quando ci si e' davanti, apre il lavoro. Dal percorso
   si esce per andarle davanti, e scorrendo ci si torna. */
function tocca(m) {
  var f = null;
  FERMATE.forEach(function (k) { if (k.m === m) f = k; });
  if (!f) { entra(m); return; }
  var p = posto(f);
  var fermi = Math.hypot(ET.x - E.x, ET.z - E.z) < 0.15;
  var davanti = visita !== 'percorso' && fermi &&
                Math.hypot(E.x - p.F[0], E.z - p.F[1]) < 0.8 && Math.abs(angolo(E.yaw, p.yaw, 1) - E.yaw) < 0.25;
  if (davanti) { entra(m); return; }
  if (visita === 'percorso' || visita === 'torna') {
    var q = posaPasso(), dir = new THREE.Vector3().subVectors(q.look, q.pos);
    E = { x: q.pos.x, z: q.pos.z, yaw: Math.atan2(dir.x, dir.z), alza: Math.atan(dir.y - SU) };
    visita = 'osserva'; sala = null; testa = [0, 0]; testaT = [0, 0];
  }
  var dove = sala ? dentroSala(sala, p.F[0], p.F[1]) : p.F;
  ET = { x: dove[0], z: dove[1], yaw: angolo(E.yaw, p.yaw, 1),
         alza: clamp(Math.atan(Math.tan(Math.atan2(f.C.y - EYE, p.D)) - SU), -CHINA, CHINA) };
  aggiornaBottone(true);
}
function annulla() { giu = null; }
function lasciaMouse() { testaT = [0, 0]; }
function tasto(e) {
  if (e.type !== 'keydown' || mode !== 'cammina') return;
  var k = e.key.toLowerCase();
  if (visita === 'sala') {
    /* nella sala le frecce di lato girano, quelle in su e giu' muovono */
    if (k === 'arrowleft') ET.yaw += 0.12;
    else if (k === 'arrowright') ET.yaw -= 0.12;
    else if (k === 'arrowup') cammina(0.8);
    else if (k === 'arrowdown') cammina(-0.8);
    else return;
    e.preventDefault(); return;
  }
  var d = { arrowdown: 1, arrowright: 1, pagedown: 3, ' ': 3, arrowup: -1, arrowleft: -1, pageup: -3 }[k];
  if (!d) return;
  if (visita === 'osserva') { e.preventDefault(); continuaVisita(); return; }
  if (visita === 'torna') return;
  if (e.shiftKey && k === ' ') d = -3;
  e.preventDefault();
  sT = clamp(clamp(sT + d * 1.6, s - 6, s + 6), 0, S_END);
  viaLaDritta();
}

/* ENTRARE NELLA SALA E USCIRNE */
function esploraSala() {
  if (mode !== 'cammina' || !esplorabile) return;
  var p = posaPasso();
  sala = esplorabile; visita = 'sala';
  var dir = new THREE.Vector3().subVectors(p.look, p.pos);
  E = { x: p.pos.x, z: p.pos.z, yaw: Math.atan2(dir.x, dir.z), alza: Math.atan(dir.y - SU) };
  ET = { x: E.x, z: E.z, yaw: E.yaw, alza: E.alza };
  testa = [0, 0]; testaT = [0, 0];
  aggiornaBottone(true);
  mostraDritta('sala');
}
function continuaVisita() {
  if (visita !== 'sala' && visita !== 'osserva') return;
  /* si torna sul percorso dove lo si era lasciato, girandosi verso dove va */
  var da = { x: E.x, z: E.z, yaw: E.yaw, alza: E.alza };
  ritorno = { t0: performance.now(), dur: reduced ? 1 : 1300, da: da };
  visita = 'torna';
  aggiornaBottone(true);
}
function aggiornaBottone(forza) {
  if (!bottoneSala) return;
  var r = visita === 'percorso' ? salaQui() : null;
  var vuoi = (visita === 'sala' || visita === 'osserva') ? 'continua' : (r ? 'esplora' : '');
  if (!forza && vuoi === bottoneSala.dataset.vuoi && r === esplorabile) return;
  esplorabile = r;
  bottoneSala.dataset.vuoi = vuoi;
  if (vuoi) bottoneSala.textContent = tr(PAROLE[vuoi]);
  bottoneSala.classList.toggle('vivo', !!vuoi);
}

function scegli(e) {
  ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  var h = ray.intersectObjects(foto.concat(muri))[0];
  /* si tocca anche una fotografia in fondo alla sala: il primo clic serve
     proprio ad andarle vicino. Oltre i quaranta metri la nebbia l'ha gia'
     mangiata, e non si vede cosa si tocca. */
  return h && h.distance < 40 && foto.indexOf(h.object) >= 0 ? h.object : null;
}

/* ------------------------------------------------------------------ *
 * LE FERMATE (30 settembre 2026). Camminare e girarsi finche' una
 * fotografia stava bene in vista era un lavoro: al computer ci si arrivava,
 * sul telefono quasi mai. Adesso ogni fotografia ha la sua fermata: ci si
 * mette DAVANTI, alla distanza a cui riempie lo schermo per tre quarti, e
 * la si guarda dritta. Da una all'altra si va con le frecce, con i due
 * passi in basso, o sfogliando di lato col dito.
 * IL GIRO E' QUELLO DI CHI VISITA UNA SALA: lungo i muri, dall'entrata
 * all'uscita, senza voltarsi avanti e indietro. Prima si seguiva il
 * percorso, che passa in mezzo alla stanza, e lo sguardo girava da un muro
 * all'altro a ogni passo.
 * FRA DUE STANZE SI RIENTRA SUL PERCORSO a meta' strada, e si passa dalla
 * porta: davanti a una fotografia si e' fuori dal percorso, e andando dritti
 * alla prossima si attraverserebbe un muro.
 * ------------------------------------------------------------------ */
function fermate() {
  FERMATE = [];
  var su = new THREE.Vector3(0, 0, 1);
  foto.forEach(function (m) {
    var u = m.userData;
    if (!u.gruppo) return;                              // il cartello della posta no
    var g = u.gruppo, n = su.clone().applyQuaternion(g.quaternion), dim = m.geometry.parameters;
    var chiave, ordine;
    if (u.stanza.i >= 90) {
      /* nel corridoio (una finta stanza, i = 90 + la sala da cui esce)
         l'ordine e' quello del cammino, che e' quello in cui sono appese */
      chiave = u.stanza.i - 90 + 0.5; ordine = foto.indexOf(m);
    } else {
      /* in una sala l'ordine e' l'angolo intorno al centro, a partire
         dall'entrata, nel verso che lascia l'uscita per ultima */
      var st = u.stanza, de = DIR[st.entra], a0 = Math.atan2(de[0], de[1]);
      var a = Math.atan2(g.position.x - st.c[0], g.position.z - st.c[1]) - a0;
      a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      var verso = 1;
      if (st.esce) {
        var dx = DIR[st.esce], ae = Math.atan2(dx[0], dx[1]) - a0;
        ae = ((ae % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        if (ae < Math.PI) verso = -1;
      }
      chiave = st.i; ordine = verso > 0 ? a : 2 * Math.PI - a;
    }
    FERMATE.push({ m: m, C: g.position.clone(), n: n, w: dim.width, h: dim.height,
                   stanza: chiave, ordine: ordine,
                   mezzo: u.stanza.i >= 90 ? CW / 2 : u.stanza.mezzo });
  });
  FERMATE.sort(function (a, b) { return a.stanza - b.stanza || a.ordine - b.ordine; });
}
/* dove mettersi: davanti alla stampa, lontano quanto serve perche' riempia
   lo schermo per tre quarti sul lato che conta - in un telefono in piedi la
   larghezza, su uno schermo largo l'altezza - e mai fuori dalla stanza */
/* OSSERVARLA, NON ENTRARCI: la fotografia prende meta' dell'altezza, e
   intorno restano il muro e il pavimento - si e' davanti a una stampa in
   una sala, non dentro uno schermo. */
var OSSERVA = { alto: 0.48, largo: 0.62 };
function posto(f) {
  var asp = camera.aspect || 1, v = fovBase * Math.PI / 360;
  var h = Math.atan(Math.tan(v) * asp);
  var D = Math.max((f.h * 0.5) / Math.tan(v * OSSERVA.alto), (f.w * 0.5) / Math.tan(h * OSSERVA.largo));
  D = clamp(D, 2.2, f.mezzo * 2 - 1.2);
  var F = [f.C.x + f.n.x * D, f.C.z + f.n.z * D];
  /* il punto del percorso piu' vicino: da li' si fa il passo di lato */
  var best = 0, bd = 1e9;
  for (var v2 = 0; v2 <= S_END; v2 += 0.2) {
    var q = at(v2), dd = Math.hypot(q[0] - F[0], q[1] - F[1]);
    if (dd < bd) { bd = dd; best = v2; }
  }
  var p = at(best), q2 = at(best + 3), th0 = Math.atan2(q2[0] - p[0], q2[1] - p[1]);
  var g = Math.atan2(-f.n.x, -f.n.z) - th0;
  while (g > Math.PI) g -= 2 * Math.PI;
  while (g < -Math.PI) g += 2 * Math.PI;
  return { s: best, lato: [F[0] - p[0], F[1] - p[1]], g: g, D: D, F: F, yaw: Math.atan2(-f.n.x, -f.n.z) };
}
/* LA DRITTA si mostra a chi e' appena arrivato e se ne va al primo gesto -
   o da sola dopo un po', perche' una scritta che resta diventa arredamento. */
function mostraDritta(quale) {
  if (!dritta) return;
  var d = tr(quale === 'sala' ? PAROLE.drittaSala : PAROLE.dritta);
  dritta.textContent = d[matchMedia('(hover: none)').matches ? 'dito' : 'mano'];
  dritta.classList.add('viva');
  clearTimeout(drittaVia);
  drittaVia = setTimeout(viaLaDritta, 9000);
}
/* L'ACCENNO (2 ottobre 2026): se nessuno si e' mosso, la visita fa un
   passo avanti e torna, una volta - dice che qui si cammina. */
var agito = false;
function accenno() {
  if (agito || !acceso || mode !== 'cammina' || visita !== 'percorso') return;
  var da = sT;
  sT = clamp(sT + 2.6, 0, S_END);
  setTimeout(function () { if (!agito && acceso && visita === 'percorso') sT = da; }, 900);
}
function viaLaDritta() {
  agito = true;
  if (!dritta) return;
  clearTimeout(drittaVia);
  dritta.classList.remove('viva');
}

/* entrare e uscire da una fotografia */
function posaFoto(m) {
  var g = m.userData.gruppo, n = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion);
  return { pos: g.position.clone().add(n.multiplyScalar(0.12)), look: g.position.clone() };
}
function posa3(x, z, th, al) {
  return { pos: new THREE.Vector3(x, EYE, z),
           look: new THREE.Vector3(x + Math.sin(th), EYE + SU + Math.tan(al), z + Math.cos(th)) };
}
function posaPasso() {
  if (visita === 'sala' || visita === 'osserva' || visita === 'torna')
    return posa3(E.x, E.z, E.yaw + testa[0], E.alza + testa[1]);
  var p = at(s);
  return posa3(p[0], p[1], rotta(s) + testa[0], testa[1]);
}
function entra(m) {
  viaLaDritta();
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
var tinti = [];
function tinto(m) { m.color.set(INCHIOSTRO); return m; }

function misura() {
  if (!renderer) return;
  var w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = fovBase = w < h ? 82 : 68;
  camera.updateProjectionMatrix();
}

function giro(adesso) {
  if (!acceso) return;
  var dt = Math.min(0.05, (adesso - prima) / 1000) || 0.016; prima = adesso;

  if (mode === 'cammina') {
    var dolce = reduced ? 0.4 : 0.045;
    if (visita === 'percorso') {
      s += (sT - s) * dolce;
      if (Math.abs(sT - s) < 0.001) s = sT;
    } else if (visita === 'sala' || visita === 'osserva') {
      E.x += (ET.x - E.x) * dolce; E.z += (ET.z - E.z) * dolce;
      E.yaw += (ET.yaw - E.yaw) * 0.08; E.alza += (ET.alza - E.alza) * 0.08;
    } else if (visita === 'torna') {
      var k = Math.min(1, (adesso - ritorno.t0) / ritorno.dur), e = k * k * (3 - 2 * k);
      var p0 = at(s), a = ritorno.da;
      E.x = a.x + (p0[0] - a.x) * e; E.z = a.z + (p0[1] - a.z) * e;
      E.yaw = angolo(a.yaw, rotta(s), e); E.alza = a.alza * (1 - e);
      if (k >= 1) { visita = 'percorso'; sala = null; aggiornaBottone(true); }
    }
    testa[0] += (testaT[0] - testa[0]) * 0.05; testa[1] += (testaT[1] - testa[1]) * 0.05;
    if (visita === 'percorso') aggiornaBottone(false);
    aggiornaNome();
    var p = posaPasso();
    camera.position.copy(p.pos); camera.lookAt(p.look);
    var C = CARTELLO;
    if (C && C.mesh) C.passo(camera.position.distanceTo(C.mesh.position), dt);
    renderer.render(scene, camera);
  } else if (mode === 'entra') {
    anim.t = Math.min(1, anim.t + dt / (reduced ? 0.2 : 0.9));
    tra(anim.a, anim.b, anim.t * anim.t * anim.t);
    renderer.render(scene, camera);
    if (anim.t >= 1) { mode = 'pagina'; apriPagina(anim.m.userData); }
  } else if (mode === 'esce') {
    anim.b = posaPasso();
    anim.t = Math.min(1, anim.t + dt / (reduced ? 0.2 : 0.7));
    tra(anim.a, anim.b, 1 - Math.pow(1 - anim.t, 3));
    renderer.render(scene, camera);
    if (anim.t >= 1) {
      mode = 'cammina';
      document.body.classList.remove('ed-vola');
    }
  }
  /* nella pagina la stanza sta ferma, e non si ridisegna */
  giroId = requestAnimationFrame(giro);
}

/* ------------------------------------------------------------------ *
 * accendere e spegnere
 * ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ *
 * IL PARQUET (30 settembre 2026): quadrotte di legno a raggiera, dalla
 * fotografia di parquet-foto.jpg, non piu' le doghe chiare disegnate qui.
 * La piastrella la ritaglia costruisci-parquet.sh sulle fughe, ed e' una
 * quadrotta di larghezza per due di altezza. PASSO_PARQUET e' il lato di
 * una quadrotta nel mondo. Da lontano la nebbia bianca se lo mangia.
 * ------------------------------------------------------------------ */
var PARQUET = null, PASSO_PARQUET = 1.2;
function parquet() {
  if (PARQUET) return PARQUET;
  PARQUET = new THREE.TextureLoader().load(fresco('parquet.webp'), undefined, undefined,
    function () { console.warn('edificio: non trovo parquet.webp'); });
  PARQUET.wrapS = PARQUET.wrapT = THREE.RepeatWrapping;
  PARQUET.repeat.set(400 / PASSO_PARQUET, 400 / (2 * PASSO_PARQUET));
  PARQUET.anisotropy = ANISO;
  return PARQUET;
}

function costruisci() {
  try { renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true }); }
  catch (e) { console.warn('edificio: niente WebGL'); return false; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  ANISO = renderer.capabilities.getMaxAnisotropy();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(BIANCO);
  /* LA NEBBIA E' LA LUCE: quel che e' lontano non sparisce, sbianca nel
     colore della sala - e' l'aria di una galleria grande */
  scene.fog = new THREE.Fog(BIANCO, 16, 62);
  camera = new THREE.PerspectiveCamera(68, 1, 0.05, 200);
  muroMat = new THREE.MeshBasicMaterial({ color: BIANCO });
  tinti = [];
  muri = []; foto = []; tex = [];
  var pav = new THREE.Mesh(new THREE.PlaneGeometry(400, 400),
    new THREE.MeshBasicMaterial({ map: parquet() }));
  pav.rotation.x = -Math.PI / 2; pav.position.set(12, -0.001, -70);
  scene.add(pav);
  disegna();
  arreda();
  ptr = new THREE.Vector2(); ray = new THREE.Raycaster();
  misura();
  return true;
}
var ASCOLTI = [
  [window, 'wheel', rotella, { passive: false }], [window, 'keydown', tasto], [window, 'keyup', tasto],
  [window, 'resize', misura]
];
function accendi(dove) {
  if (acceso) return true;
  acceso = true; var v = ++volta;
  stile(); colori();
  tela = document.createElement('canvas');
  tela.id = 'edificio'; tela.setAttribute('aria-label', tr(PAROLE.tela));
  dritta = el('div');
  dritta.id = 'ed-dritta';
  dritta.textContent = tr(PAROLE.dritta)[matchMedia('(hover: none)').matches ? 'dito' : 'mano'];
  pagina = el('article'); pagina.id = 'lavoro';
  corpo = el('div', 'corpo'); pagina.appendChild(corpo);
  var casa = dove || document.body;
  casa.appendChild(tela); casa.appendChild(pagina); casa.appendChild(dritta);

  prepara().then(function () {
    if (!acceso || v !== volta) return;
    if (!costruisci()) return;
    tela.addEventListener('pointerdown', premi);
    tela.addEventListener('pointermove', muovi);
    tela.addEventListener('pointerup', lascia);
    tela.addEventListener('pointercancel', annulla);
    tela.addEventListener('pointerleave', lasciaMouse);
    ASCOLTI.forEach(function (a) { a[0].addEventListener(a[1], a[2], a[3]); });
    mode = 'cammina'; testa = [0, 0]; testaT = [0, 0];
    visita = 'percorso'; sala = null; esplorabile = null;
    fermate();
    STANZE.forEach(function (r) { r.meta = null; r.vano = null; });
    /* SI ARRIVA DA LONTANO: in fondo al corridoio, come da un'altra stanza,
       col vano della prima sala davanti - lo si vede incorniciato, prima di
       entrarci. Collab puo' chiedere una sala (PIANO.dopo = { lavoro: i }):
       allora in fondo al corridoio che porta a quella. */
    var dopo = window.PIANO && window.PIANO.dopo;
    if (window.PIANO) window.PIANO.dopo = null;
    /* otto metri prima del vano: abbastanza per vederlo intero, con la
       cornice del muro intorno, e non tanto da perderlo in fondo al
       corridoio */
    var qui = dopo && STANZE[dopo.lavoro] ? STANZE[dopo.lavoro] : STANZE[0];
    var ingresso = vano(qui);                  // dove il corridoio entra nella sala
    s = Math.max(0, ingresso - 11); sT = Math.max(0, ingresso - 8);
    if (reduced) s = sT;
    bottoneSala = el('button'); bottoneSala.id = 'ed-sala'; bottoneSala.type = 'button';
    bottoneSala.addEventListener('click', function (e) {
      e.stopPropagation();
      if (visita === 'sala' || visita === 'osserva') continuaVisita(); else esploraSala();
    });
    tela.parentNode.appendChild(bottoneSala);
    nomeSala = el('div'); nomeSala.id = 'ed-nome'; nomeSala.setAttribute('aria-hidden', 'true');
    nomeSala.appendChild(el('h2')); nomeSala.appendChild(el('p'));
    tela.parentNode.appendChild(nomeSala); nomeQui = null;
    prima = performance.now();
    giroId = requestAnimationFrame(giro);
    void tela.offsetHeight;
    tela.classList.add('visibile');
    document.body.classList.add('ed-dentro');
    if (window.PIANO && window.PIANO.veste) window.PIANO.veste(BIANCO, INCHIOSTRO);
    /* la dritta aspetta che la macchina abbia finito di entrare (ma non
       troppo: 1,4 s); e se poi nessuno si muove, un passo da sola */
    agito = false;
    setTimeout(function () { mostraDritta(); }, reduced ? 200 : 1400);
    if (!reduced) setTimeout(accenno, 3200);
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
  pagina.remove(); if (dritta) dritta.remove();
  if (bottoneSala) { bottoneSala.remove(); bottoneSala = null; }
  if (nomeSala) { nomeSala.remove(); nomeSala = null; }
  if (window.PIANO && window.PIANO.sveste) window.PIANO.sveste();
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
  /* dove si e': serve a tarare e a controllare da fuori */
  stato: function () {
    return { s: +s.toFixed(2), sT: +sT.toFixed(2), fine: +S_END.toFixed(1), visita: visita,
             esplorabile: esplorabile ? esplorabile.i : null, E: E,
             appese: foto.filter(function (m) { return m.userData.f; }).map(function (m) {
               var g = m.userData.gruppo.position;
               return [m.userData.f.id, +g.x.toFixed(1), +g.z.toFixed(1)]; }) };
  },
  rifai: function () {},          // la tela e' sempre a tutto schermo
  lingua: LINGUA
};
})();
