/* =========================================================================
   LE PAGINE — bio, collab, mail e contacts.
   -------------------------------------------------------------------------
   Quattro stanze che non sono spazi ma cose da leggere: una pagina
   verticale nella penombra, come la pagina di un lavoro dell'edificio. La
   testa (BIO, COLLAB...) e' quella del piano, e fa da titolo: qui dentro non
   si ripete.

   - BIO: una scena ferma guidata dallo scorrere. Prima il nome, il ruolo e
     la citta'; scorrendo si dissolvono, e al loro posto si scrive il testo
     una parola alla volta - cosa fa, perche', con chi. Finito il testo, in
     fondo compaiono i disegni di look! e mail.
   - COLLAB (bianca): un invito, non un curriculum - chi cerca per lavorare
     con lei, e la busta per mandarle il portfolio.
   - MAIL (bianca): una riga, la busta grande, l'indirizzo. La busta apre la
     posta di chi guarda con l'indirizzo di Vittoria gia' scritto. In fondo
     showroom e look!.
   - CONTACTS non e' piu' una pagina: sta in fondo a bio, dopo il testo -
     una fascia per contatto, scritte grandi che scorrono.
   LO STILE E' QUELLO DI BIO (30 settembre 2026): tutto in stampatello,
   blocchi compatti, poche parole e molto vuoto intorno. Niente corsivi di
   presentazione, niente chiuse: scrivere e' sempre la busta in alto.

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
/* BIO (30 settembre 2026, quarto giro): un blocco solo, tutto in stampatello,
   tutto bianco - monolitico, senza schermate vuote fra una frase e l'altra.
   Tre cose: cosa fa, perche' lo fa, con chi lavora. Segnaposto nel tono
   giusto. */
var BIO = {
  nome: 'Vittoria',
  ruolo: { it: 'Fotografia e art direction', en: 'Photography and art direction' },
  dove:  { it: 'Milano · Torino', en: 'Milan · Turin' },
  /* LE PAROLE CHIAVE fra due asterischi, ognuna col suo colore: i colori
     delle cornici, schiariti per il nero, a turno - cosi' due chiavi vicine
     non hanno mai lo stesso. Il resto e' bianco. */
  testo: {
    it: 'Fotografo *moda* e ne curo la *direzione artistica*: *editoriali*, *lookbook* e *campagne*, dall\'idea allo scatto finale. ' +
        'Perché un capo si capisce solo addosso a qualcuno, *in movimento*: il mio lavoro è trovare quell\'istante. ' +
        'Lavoro con *designer* indipendenti, *negozi* e *marchi* di moda.',
    en: 'I photograph *fashion* and *art-direct* it: *editorials*, *lookbooks* and *campaigns*, from the idea to the final image. ' +
        'Because a garment only makes sense on someone, *in motion*: my job is to find that moment. ' +
        'I work with independent *designers*, *stores* and fashion *brands*.'
  },
  /* rosso, paglia, cobalto, verde, arancio */
  chiavi: ['#F5332A', '#E0B25C', '#6283FF', '#43B472', '#FF8C33']
};
/* quanto scorrere vale una parola, e quanto la testata prima di sparire */
var SCRIVE = { parola: 34, testata: 0.55 };
/* SE NESSUNO SCORRE, LA PAGINA PARTE DA SOLA (1 ottobre 2026): dopo
   l'attesa il nome svanisce e le parole si scrivono, tante al secondo, fino
   a look!. Basta toccare, scorrere o premere un tasto e la mano torna a chi
   guarda. Intanto, sotto il nome, l'invito a scorrere. */
var DASOLA = { attesa: 2200, invito: 700, giu: 0.45, andata: 650, sosta: 250, ritorno: 750 };

/* COLLAB E' UN INVITO (30 settembre 2026): e' per chi vuole lavorare con
   lei - stylist, truccatori, set designer, modelle e modelli -, non l'elenco
   di chi c'e' stato. Le figure fra asterischi hanno i colori delle chiavi di
   bio, nella versione per la carta. */
var COLLAB = {
  testo: {
    it: 'Cerco *stylist*, *truccatori*, *set designer*, *modelle e modelli* per editoriali e progetti personali.',
    en: 'I am looking for *stylists*, *make-up artists*, *set designers*, *models* for editorials and personal projects.'
  },
  invito: { it: 'Mandami il tuo portfolio', en: 'Send me your portfolio' },
  chiavi: ['#E0301E', '#B8893A', '#2448C8', '#2E8552', '#EE7A1E']
};

var POSTA = {
  attacco: { it: 'Progetti, collaborazioni, disponibilità.',
             en: 'Projects, collaborations, availability.' },
  scrivimi: { it: 'Scrivimi', en: 'Write to me' },
  oggetto: { it: 'Richiesta di disponibilità', en: 'Availability request' }
};

/* LE VIE: i disegni del piano, che portano alle loro stanze. Ogni pagina
   dice quali vuole in alto a destra, di fronte alla freccia, e quali nella
   fascia ferma in fondo (vedi in fondo al file). */
var VIE = {
  look:     { dove: 'look.svg',     disegno: 'look',  testo: { it: 'Guarda i lavori', en: 'See the work' } },
  mail:     { dove: 'mail.svg',     disegno: 'busta', testo: { it: 'Scrivimi', en: 'Write to me' } },
  showroom: { dove: 'showroom.svg', disegno: 'porta', testo: { it: 'Lo showroom', en: 'The showroom' } }
};

/* i contatti: href a null finche' non sono veri, e allora non si toccano */
var CONTATTI = {
  righe: [
    { cosa: { it: 'Email', en: 'Email' },         val: INDIRIZZO, href: 'mailto:' + INDIRIZZO },
    { cosa: { it: 'Telefono', en: 'Phone' },      val: '+39 000 000 0000', href: null },
    { cosa: { it: 'WhatsApp', en: 'WhatsApp' },   val: { it: 'Scrivimi su WhatsApp', en: 'Message me on WhatsApp' }, href: null },
    { cosa: { it: 'Instagram', en: 'Instagram' }, val: '@nomeutente', href: null },
    /* la citta' e' la stessa di bio: si prende da li', cosi' non si
       contraddicono. L'agenzia si aggiunge quando c'e'. */
    { cosa: { it: 'Dove', en: 'Based in' },       val: null, href: null }
  ]
};

/* ------------------------------------------------------------------ *
 * LO STILE. Tutto sta a z-index 0, sotto la testa e il francobollo.
 * ------------------------------------------------------------------ */
/* i colori di queste pagine: nero, segno chiaro, testo appena piu' spento,
   e una riga sottile per separare - che sul nero non puo' essere il
   grigio-azzurro della firma, si perderebbe */
var NERO = '#0B0B0C', CHIARO = '#F2F2F0', TESTO = '#CFCCC6', RIGA = 'rgba(242,242,240,.28)';
var CARTA = '#F7F6F4', INCHIOSTRO = '#242D33';     // le pagine bianche
var CSS = [
':root { --pg-fondo:' + NERO + '; --pg-segno:' + CHIARO + '; --pg-testo:' + TESTO +
        '; --pg-riga:' + RIGA + '; --pg-piede:calc(84px + env(safe-area-inset-bottom, 0px)); }',
/* LE PAGINE BIANCHE - collab e mail: la carta della galleria e il tratto
   d'inchiostro, come nello showroom */
'.bianca { --pg-fondo:#F7F6F4; --pg-segno:#242D33; --pg-testo:#3A444B; --pg-riga:rgba(36,45,51,.2); }',
'.pg-piede { position:fixed; left:0; right:0; bottom:0; height:var(--pg-piede); z-index:3;',
'  box-sizing:border-box; padding:0 clamp(20px, 5vw, 64px) env(safe-area-inset-bottom, 0px);',
'  display:flex; align-items:center; justify-content:center; gap:clamp(40px, 9vw, 120px);',
'  background:var(--pg-fondo); opacity:0; pointer-events:none; transition:opacity .3s ease; }',
'.pg-piede.acceso { opacity:1; pointer-events:auto; transition:opacity .6s ease .6s; }',
/* in bio i disegni aspettano che il testo sia finito */
'.pg-piede.aspetta { opacity:0 !important; pointer-events:none !important; }',
'.pg-piede.aspetta.pronto { opacity:1 !important; pointer-events:auto !important; transition:opacity .8s ease; }',
'.pg-piede button { height:calc(var(--pg-piede) - 18px - env(safe-area-inset-bottom, 0px)); padding:0; border:0;',
'  background:none; cursor:pointer; color:var(--pg-segno); -webkit-tap-highlight-color:transparent;',
'  transition:transform .28s cubic-bezier(.2,.9,.25,1); }',
'.pg-piede button svg { display:block; height:100%; width:auto; overflow:visible; }',
/* LA PORTA E' STRETTA E ALTA: alla stessa altezza degli altri disegni
   sembrava un francobollo. Sale oltre la fascia, appoggiata in fondo. */
'.pg-piede { align-items:flex-end; padding-bottom:calc(9px + env(safe-area-inset-bottom, 0px)); }',
'.pg-piede button.porta { height:calc((var(--pg-piede) - 18px - env(safe-area-inset-bottom, 0px)) * 1.9); }',
'.pg-piede button.look { height:calc((var(--pg-piede) - 18px - env(safe-area-inset-bottom, 0px)) * 1.35); }',
'.pg-piede button:nth-child(odd) { transform:rotate(-2deg); }',
'.pg-piede button:nth-child(even) { transform:rotate(2deg); }',
'.pg-piede button:focus-visible { outline:none; }',
'.pg-piede button:hover .tratto, .pg-piede button:focus-visible .tratto { transform:translateY(-4px) scale(1.06); }',
'body.pg-dentro #scrivimi { display:none !important; }',
/* IN ALTO A DESTRA, alla stessa altezza della freccia: la via che la pagina vuole li' */
'.pg-su { position:fixed; z-index:3; padding:0; border:0; background:none; cursor:pointer;',
'  color:var(--pg-segno); transform:rotate(2deg); opacity:0; transition:opacity .4s ease, transform .28s cubic-bezier(.2,.9,.25,1);',
'  -webkit-tap-highlight-color:transparent; }',
'.pg-su.acceso { opacity:1; transition:opacity .6s ease .6s, transform .28s cubic-bezier(.2,.9,.25,1); }',
'.pg-su svg { display:block; height:100%; width:auto; overflow:visible; }',
'.pg-su:focus-visible { outline:none; }',
'.pg-su:hover .tratto, .pg-su:focus-visible .tratto { transform:translateY(-3px) scale(1.07); }',
/* DOPO L'INGRESSO ESISTONO SOLO IL BIANCO E IL NERO. La galleria e'
   bianca; queste pagine - bio, collab, mail, contacts - sono il nero, come
   il campo di look!. Il grigio della penombra resta all'ingresso, che e' il
   colore del fondale della fotografia, e non arriva fin qui. */
/* LA PAGINA STA FRA LA TESTA E LA FASCIA: il testo scorre e si ferma sotto
   la freccia e sopra la fascia, e non passa sotto a nessuna delle due. Il francobollo del piano, che galleggiava sopra il testo, in
   queste pagine non c'e': le sue strade stanno nella fascia. */
'.pg { position:fixed; top:var(--testa-alta, 0px); left:0; right:0; bottom:var(--pg-piede); z-index:0; overflow-x:hidden; overflow-y:auto;',
'  -webkit-overflow-scrolling:touch; touch-action:pan-y; -webkit-user-select:text; user-select:text;',
'  background:var(--pg-fondo); color:var(--pg-segno);',
'  opacity:0; transition:opacity .3s ease; }',
'.pg.acceso { opacity:1; transition:opacity .6s ease .6s; }',   // dopo il fondo della pagina
'.pg-corpo { max-width:1100px; margin:0 auto; padding:clamp(40px, 9vh, 110px) clamp(20px, 5vw, 64px) 120px;',
'  transform:translateY(24px); transition:transform .3s ease; }',
'.pg.acceso .pg-corpo { transform:none; transition:transform .9s cubic-bezier(.2,.8,.2,1) .15s; }',
'.pg-stampa { font-family:var(--stampatello); font-weight:800; font-stretch:expanded;',
'  text-transform:uppercase; letter-spacing:.02em; line-height:1; }',
'.pg :focus-visible { outline:2px solid var(--pg-segno); outline-offset:4px; }',
/* BIO: una scena ferma (sticky) dentro una pagina lunga; lo scorrere la
   guida. Tutto in stampatello, tutto bianco. */
'.pg-corpo.pg-bio { max-width:none; padding:0; transform:none !important; }',
'.pg-scena { position:sticky; top:0; height:var(--scena-h, 70vh); overflow:hidden; }',
'.pg-testata, .pg-scritto { position:absolute; left:0; right:0; top:50%; transform:translateY(-50%);',
'  margin:0 auto; padding:0 clamp(20px, 5vw, 64px); box-sizing:border-box; }',
'.pg-testata { text-align:center; }',
'.pg-testata h1 { margin:0; font-size:clamp(56px, 13vw, 200px); color:var(--pg-segno); line-height:.9; }',
'.pg-testata p { margin:.9em 0 0; font-size:clamp(12px, 1.2vw, 16px); letter-spacing:.14em;',
'  text-indent:.14em; color:var(--pg-segno); }',
'.pg-testata .pg-dove { margin-top:.7em; opacity:.7; }',
'.pg-giu { display:block; margin:clamp(28px, 6vh, 64px) auto 0; width:1px; height:clamp(36px, 6vh, 64px);',
'  background:var(--pg-segno); opacity:0; transform-origin:top; transition:opacity .8s ease; }',
'.pg-giu.visto { opacity:.75; animation:pg-giu 1.8s cubic-bezier(.6,0,.3,1) infinite; }',
'@keyframes pg-giu { 0% { transform:scaleY(0); } 45% { transform:scaleY(1); transform-origin:top; }',
'  55% { transform:scaleY(1); transform-origin:bottom; } 100% { transform:scaleY(0); transform-origin:bottom; } }',
'.pg-scorri { display:block; margin-top:14px; font-size:clamp(10px, 1vw, 12px); letter-spacing:.24em; text-indent:.24em;',
'  color:var(--pg-segno); opacity:0; transition:opacity .8s ease; }',
'.pg-giu.visto + .pg-scorri { opacity:.6; }',
'@media (prefers-reduced-motion: reduce) { .pg-giu, .pg-scorri { display:none; } }',
/* IL TESTO E' UN BLOCCO: stampatello largo e grasso, righe strette, parole
   vicine - un monolito, non un paragrafo. A sinistra e non giustificato: su
   uno schermo stretto la giustificazione apriva buchi fra le parole. */
/* la misura del carattere la trova misura(): quanto basta a riempire la
   scena, lasciando sotto il posto per look! */
'.pg-scritto { max-width:100%; color:var(--pg-segno); top:41%; transition:transform .45s cubic-bezier(.2,.8,.2,1);',
'  font-size:40px; line-height:1.02; letter-spacing:-.008em;',
'  text-align:left; -webkit-hyphens:none; hyphens:none; }',
/* UNA PAROLA NON SCRITTA NON ESISTE: non e' trasparente, non c'e'. Occupa
   il suo posto perche' il blocco non si muova mentre si scrive. */
'.pg-scritto span { visibility:hidden; opacity:0; }',
'.pg-scritto span.scritta { visibility:visible; opacity:1; transition:opacity .18s ease; }',
/* LOOK!, finito il testo: grande, sotto il blocco */
'.pg-avanti { position:absolute; left:50%; bottom:calc(var(--scena-h, 70vh) * .03); height:calc(var(--scena-h, 70vh) * .22);',
'  transform:translateX(-50%) rotate(-2deg) scale(.92); padding:0; border:0; background:none; cursor:pointer;',
'  color:var(--pg-segno); opacity:0; visibility:hidden; -webkit-tap-highlight-color:transparent;',
'  transition:opacity .7s ease, transform .7s cubic-bezier(.2,.9,.25,1), visibility 0s linear .7s; }',
'.pg-avanti.pronto { opacity:1; visibility:visible; transform:translateX(-50%) rotate(-2deg);',
'  transition:opacity .7s ease, transform .7s cubic-bezier(.2,.9,.25,1); }',
'.pg-avanti.pronto:focus-visible { outline:none; }',
'.pg-avanti.pronto:hover .tratto, .pg-avanti.pronto:focus-visible .tratto { transform:translateY(-6px) scale(1.05); }',
'.pg-avanti svg { display:block; height:100%; width:auto; overflow:visible; }',
/* in bio la fascia non c'e': look! e' nella scena, mail in alto */
'.pg-piede.nessuno { display:none; }',
'.pg.senza-piede { bottom:0; }',
/* COLLAB: un blocco, come in bio, e la busta per mandare il portfolio */
'.pg-invito { display:flex; flex-direction:column; align-items:flex-start;',
'  min-height:calc(100vh - var(--testa-alta, 0px) - var(--pg-piede) - 170px); justify-content:center; }',
'.pg-blocco { margin:0; font-size:clamp(32px, 6.6vw, 112px); line-height:1.0; letter-spacing:-.01em;',
'  color:var(--pg-segno); }',
'.pg-invito .pg-manda { margin:clamp(34px, 7vh, 80px) 0 0; align-self:center; }',
'.pg-invito .pg-manda span { font-size:clamp(12px, 1.1vw, 15px); letter-spacing:.14em; }',
/* MAIL: una frase, la busta, l'indirizzo */
'.pg-mail { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;',
'  min-height:calc(100vh - var(--testa-alta, 0px) - var(--pg-piede) - 200px); }',
'.pg-mail .pg-riga1 { margin:0; font-size:clamp(28px, 6vw, 96px); line-height:.98; letter-spacing:-.01em;',
'  color:var(--pg-segno); max-width:14ch; }',
'.pg-mail .pg-manda { margin-top:clamp(30px, 7vh, 80px); }',
'.pg-mail .pg-manda svg { width:clamp(150px, 20vw, 280px); }',
'.pg-indirizzo { margin:clamp(24px, 5vh, 50px) 0 0; font-size:clamp(12px, 1.2vw, 16px); letter-spacing:.14em;',
'  color:var(--pg-segno); -webkit-user-select:all; user-select:all; text-transform:none; }',
'.pg-manda { display:flex; flex-direction:column; align-items:center; gap:10px; margin:clamp(40px, 7vh, 70px) auto 0;',
'  padding:0; border:0; background:none; cursor:pointer; color:var(--pg-segno); transform:rotate(-2deg); text-decoration:none;',
'  transition:transform .28s cubic-bezier(.2,.9,.25,1); }',
'.pg-manda svg { display:block; width:clamp(120px, 12vw, 170px); height:auto; overflow:visible; }',
'.pg-manda span { font-size:17px; letter-spacing:.06em; }',
'.pg-manda:hover .tratto { transform:translateY(-6px) scale(1.05); }',
/* I CONTATTI, in fondo a bio: una fascia per contatto, la scritta grande
   che scorre senza fine - ognuna col suo verso, la sua velocita' e un colore
   delle chiavi. Passandoci sopra la fascia si ferma e si accende: e' li'
   che si tocca. */
'.pg-contatti { min-height:calc(var(--scena-h, 70vh) + 2px); display:flex; flex-direction:column;',
'  justify-content:center; gap:clamp(6px, 1.4vh, 14px); padding:4vh 0 8vh; overflow:hidden; }',
'.pg-fascia { display:block; overflow:hidden; white-space:nowrap; text-decoration:none; color:var(--c);',
'  padding:.06em 0; transition:background-color .25s ease, color .25s ease; -webkit-tap-highlight-color:transparent; }',
'.pg-fascia .pista { display:inline-block; animation:pg-scorre var(--t, 26s) linear infinite;',
'  font-size:clamp(40px, 8.5vw, 150px); line-height:1; letter-spacing:-.01em; }',
'.pg-fascia.indietro .pista { animation-direction:reverse; }',
'.pg-fascia .pista span { padding-right:.6em; }',
'.pg-fascia .pista i { font-style:normal; opacity:.45; padding-right:.6em; }',
/* tutte le fasce si accendono, non solo quelle che sono gia' un collegamento */
'.pg-fascia:hover, .pg-fascia:focus-visible { background:var(--c); color:var(--pg-fondo); outline:none; }',
'.pg-fascia:hover .pista, .pg-fascia:focus-visible .pista { animation-play-state:paused; }',
/* LA PORTA IN FONDO A BIO: una scena ferma lunga due schermi e mezzo */
'.pg-oltre { height:calc(var(--scena-h, 70vh) * 1.8); position:relative; }',
'.pg-oltre-scena { position:sticky; top:0; height:var(--scena-h, 70vh); overflow:hidden; }',
'.pg-porta { position:absolute; left:50%; top:50%; height:46%; padding:0; border:0; background:none; cursor:pointer;',
'  color:var(--pg-segno); transform-origin:51% 45%; transform:translate(-50%, -43%); will-change:transform; }',
'@keyframes pg-scorre { from { transform:translateX(0); } to { transform:translateX(-50%); } }',
'@media (prefers-reduced-motion: reduce) { .pg-fascia .pista { animation:none; } }',
/* sul telefono una colonna sola */
'@media (max-width: 720px) {',
'}'
].join('\n');
function stile() {
  if (document.getElementById('pagine-stile')) return;
  var s = document.createElement('style');
  s.id = 'pagine-stile'; s.textContent = CSS;
  document.head.appendChild(s);
}

/* i disegni che servono: la busta per scrivere e la finestra di look!,
   gli stessi del piano. Si chiedono una volta sola. */
var SEGNI = null;
function segni() {
  if (SEGNI) return SEGNI;
  function testo(f) { return fetch(fresco(f)).then(function (r) { if (!r.ok) throw f; return r.text(); }); }
  /* il disegno in due strati (window.dueStrati, dal piano): alla carezza
     cresce solo il disegno, la parola resta ferma - come dappertutto */
  function disegno(nome) { return function (t) {
    var svg = new DOMParser().parseFromString(t, 'image/svg+xml').documentElement;
    var fondo = svg.querySelector('rect'); if (fondo) fondo.remove();
    svg.querySelectorAll('path').forEach(function (p) { p.setAttribute('fill', 'currentColor'); });
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.setAttribute('aria-hidden', 'true');
    var P = window.PAROLA && window.PAROLA[nome];
    if (P && window.dueStrati) return window.dueStrati(document.importNode(svg, true), P).outerHTML;
    return new XMLSerializer().serializeToString(svg);
  }; }
  SEGNI = Promise.all([
    testo('mail.svg').then(disegno('mail.svg')).catch(function () { return ''; }),
    testo('look.svg').then(disegno('look.svg')).catch(function () { return ''; }),
    testo('showroom.svg').then(disegno('showroom.svg')).catch(function () { return ''; })
  ]).then(function (v) { return { busta: v[0], look: v[1], porta: v[2] }; });
  return SEGNI;
}

function el(tag, cls, txt) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt) e.textContent = txt;
  return e;
}
/* ------------------------------------------------------------------ *
 * Le quattro pagine
 * ------------------------------------------------------------------ */
/* il testo, una parola per span; le chiavi fra asterischi coi loro colori a
   turno - il colore e' della parola, non della punteggiatura attaccata */
function conChiavi(dove, testo, colori) {
  var parole = [], inChiave = false, quale = -1;
  testo.split(' ').forEach(function (w, k) {
    if (k) dove.appendChild(document.createTextNode(' '));
    var apre = w.indexOf('*') === 0, chiude = w.lastIndexOf('*') > 0;
    if (apre) { inChiave = true; quale++; }
    var nudo = w.replace(/\*/g, ''), sp = el('span');
    if (inChiave) {
      var m = /^(.*?)([,.:;!?]*)$/.exec(nudo), b = el('b', '', m[1]);
      b.style.color = colori[quale % colori.length]; b.style.fontWeight = 'inherit';
      sp.appendChild(b);
      if (m[2]) sp.appendChild(document.createTextNode(m[2]));
    } else sp.textContent = nudo;
    if (chiude) inChiave = false;
    dove.appendChild(sp); parole.push(sp);
  });
  return parole;
}
/* la porta che si apre sta nel piano (window.costruisciPorta): e' la
 * stessa per la fine di bio e per ogni porta di showroom che si tocca */
function costruisciPorta(b, html) {
  if (window.costruisciPorta) return window.costruisciPorta(b, html);
  b.innerHTML = html || '';
}

function bio(corpo, S, piede) {
  corpo.classList.add('pg-bio');
  var pg = corpo.parentNode, scena = el('div', 'pg-scena');
  var t = el('header', 'pg-testata');
  t.appendChild(el('h1', 'pg-stampa', BIO.nome));
  t.appendChild(el('p', 'pg-stampa', tr(BIO.ruolo)));
  t.appendChild(el('p', 'pg-stampa pg-dove', tr(BIO.dove)));
  var giu = el('span', 'pg-giu'); giu.setAttribute('aria-hidden', 'true');
  t.appendChild(giu);
  var scorri = el('span', 'pg-scorri pg-stampa', LINGUA === 'en' ? 'scroll' : 'scorri');
  scorri.setAttribute('aria-hidden', 'true');
  t.appendChild(scorri);
  var scritto = el('p', 'pg-scritto pg-stampa'), parole = conChiavi(scritto, tr(BIO.testo), BIO.chiavi);
  var avanti = el('button', 'pg-avanti'); avanti.type = 'button';
  avanti.setAttribute('aria-label', tr(VIE.look.testo));
  avanti.innerHTML = S.look;
  avanti.addEventListener('click', function () { vai('look.svg'); });
  scena.appendChild(t); scena.appendChild(scritto); scena.appendChild(avanti);
  /* la scena e lo scorrere che consuma stanno in un contenitore loro: una
     cosa appiccicata (sticky) resta ferma finche' dura il suo contenitore, e
     se ci fossero dentro anche i contatti starebbe sopra di loro */
  var tratto = el('div'); corpo.appendChild(tratto);
  tratto.appendChild(scena);
  var coda = el('div'); tratto.appendChild(coda);        // lo scorrere che la scena consuma
  /* E DOPO, I CONTATTI: la scena sale via e arrivano le fasce */
  var cont = el('section', 'pg-contatti');
  cont.setAttribute('aria-label', 'Contatti');
  var VELOCI = [28, 22, 31, 25];
  CONTATTI.righe.forEach(function (r, i) {
    if (!r.val) return;                                    // la citta' sta gia' in testa
    var f = el(r.href ? 'a' : 'div', 'pg-fascia pg-stampa' + (i % 2 ? ' indietro' : ''));
    if (r.href) {
      f.href = r.href;
      if (/^https?:/.test(r.href)) { f.target = '_blank'; f.rel = 'noopener'; }
    }
    f.style.setProperty('--c', BIO.chiavi[i % BIO.chiavi.length]);
    f.style.setProperty('--t', VELOCI[i % VELOCI.length] + 's');
    f.setAttribute('aria-label', tr(r.cosa) + ': ' + tr(r.val));
    /* la pista e' la stessa riga due volte: scorre di meta' e ricomincia,
       e non si vede la cucitura */
    var pista = el('span', 'pista'), riga = [];
    for (var k = 0; k < 4; k++) riga.push(tr(r.cosa), tr(r.val) + ' \u2197');
    for (var d = 0; d < 2; d++) riga.forEach(function (t2, n) {
      pista.appendChild(n % 2 ? el('span', '', t2) : el('i', '', t2));
    });
    f.appendChild(pista);
    cont.appendChild(f);
  });
  corpo.appendChild(cont);
  /* E DOPO I CONTATTI, LA PORTA (2 ottobre 2026). Arriva al centro e,
     scorrendo, si apre (la porta del piano, costruisciPorta); in fondo si
     va in showroom con la transizione di sempre. Si puo' anche toccare. */
  var oltre = el('section', 'pg-oltre'), scenaP = el('div', 'pg-oltre-scena');
  var porta = el('button', 'pg-porta'); porta.type = 'button';
  porta.setAttribute('aria-label', tr(VIE.showroom ? VIE.showroom.testo : 'Showroom'));
  costruisciPorta(porta, S.porta);
  porta.addEventListener('click', function () { vai('showroom.svg'); });
  scenaP.appendChild(porta); oltre.appendChild(scenaP);
  corpo.appendChild(oltre);
  var passato = false;
  function attraversa() {
    if (!pg.isConnected) return;
    var h = pg.clientHeight, top = oltre.offsetTop - pg.scrollTop;
    var k = Math.max(0, Math.min(1, -top / (oltre.offsetHeight - h)));   // 0 entra, 1 in fondo
    /* la porta si apre scorrendo; in fondo, la transizione di sempre */
    var ap = Math.max(0, Math.min(1, (k - 0.12) / 0.5)); ap = ap * ap * (3 - 2 * ap);
    if (porta.apriPorta) porta.apriPorta(ap);
    if (k >= 0.97 && !passato) { passato = true; vai('showroom.svg', { aperta: true }); }
    if (k < 0.5) passato = false;
  }
  pg.addEventListener('scroll', attraversa, { passive: true });
  requestAnimationFrame(attraversa);
  var aiContatti = piano().dopo && piano().dopo.contatti;
  if (aiContatti) window.PIANO.dopo = null;
  var calma = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* IL BLOCCO RIEMPIE LA SCENA: si cerca il carattere piu' grande per cui
     il testo intero sta in sei decimi dell'altezza; sotto, un quinto abbondante
     e' di look! */
  function adatta(h) {
    var lo = 16, hi = 220;
    parole.forEach(function (sp) { sp.style.visibility = 'hidden'; });
    for (var n = 0; n < 14; n++) {
      var m = (lo + hi) / 2;
      scritto.style.fontSize = m + 'px';
      if (scritto.offsetHeight <= h * 0.6 && scritto.scrollWidth <= scritto.clientWidth + 1) lo = m; else hi = m;
    }
    scritto.style.fontSize = Math.floor(lo) + 'px';
    parole.forEach(function (sp) { sp.style.visibility = ''; });
  }
  function misura() {
    var h = pg.clientHeight;
    corpo.style.setProperty('--scena-h', h + 'px');
    adatta(h);
    coda.style.height = Math.round(h * SCRIVE.testata + parole.length * SCRIVE.parola + h * 0.25) + 'px';
    scrivi();
  }
  /* LO SCORRERE E' LA PENNA: prima la testata si dissolve, poi le parole
     arrivano una per volta, e tornando su se ne vanno nell'ordine inverso */
  function scrivi() {
    if (!pg.isConnected) return;
    var h = pg.clientHeight, y = pg.scrollTop, via = h * SCRIVE.testata;
    var k = calma ? 1 : Math.min(1, y / via);
    t.style.opacity = (1 - k).toFixed(3);
    t.style.filter = 'blur(' + (k * 8).toFixed(1) + 'px)';
    t.style.visibility = k >= 1 ? 'hidden' : 'visible';
    var quante = calma ? parole.length : Math.floor((y - via * 0.8) / SCRIVE.parola);
    parole.forEach(function (sp, i) { sp.classList.toggle('scritta', i < quante); });
    avanti.classList.toggle('pronto', quante >= parole.length);
    sale(h, Math.min(quante, parole.length));
  }
  /* IL FOGLIO SALE (2 ottobre 2026): la scrittura comincia a meta' della
     scena e la riga che si sta scrivendo resta li', al centro; il blocco
     sale mano a mano, come un foglio nella macchina da scrivere. Quando il
     testo e' finito si ferma dove sta il blocco intero, sopra look!. */
  function sale(h, quante) {
    var fine = h * 0.41 - scritto.offsetHeight / 2;           // dove sta il blocco finito
    var giu = 0;
    if (quante > 0) { var u = parole[quante - 1]; giu = u.offsetTop + u.offsetHeight; }
    var y = calma ? fine : Math.max(fine, h * 0.5 - giu);
    scritto.style.top = '0px';
    scritto.style.transform = 'translateY(' + Math.round(y) + 'px)';
  }
  pg.addEventListener('scroll', scrivi, { passive: true });
  /* si rimisura quando cambia la pagina, non la finestra: la pagina cambia
     anche quando la testa si ridispone */
  if (window.ResizeObserver) new ResizeObserver(function () { misura(); }).observe(pg);
  else addEventListener('resize', misura);
  requestAnimationFrame(function () {
    misura();
    /* dal disegno di contacts si arriva gia' ai contatti, col testo scritto */
    if (aiContatti) pg.scrollTop = cont.offsetTop;
    else if (!calma) daSola();
  });
  /* L'ACCENNO (2 ottobre 2026, al posto della pagina che si scriveva da
     sola): sotto il nome la lineetta e SCORRI; poi, se nessuno si e' mosso,
     la pagina scende appena - il nome comincia a svanire - e torna su,
     una volta sola. Dice che sotto c'e' altro, e lascia la mano a chi
     guarda. Al primo gesto tutto si ferma. */
  function daSola() {
    var fermo = false, t0 = 0;
    function mano() { fermo = true; togli(); }
    var EV = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    function togli() { EV.forEach(function (e) { pg.removeEventListener(e, mano); }); }
    EV.forEach(function (e) { pg.addEventListener(e, mano, { passive: true }); });
    setTimeout(function () { if (pg.scrollTop < 2) giu.classList.add('visto'); }, DASOLA.invito);
    setTimeout(function () {
      if (fermo || !pg.isConnected || pg.scrollTop > 2) { togli(); return; }
      requestAnimationFrame(passo);
    }, DASOLA.attesa);
    function dolce(k) { return k * k * (3 - 2 * k); }
    var ultimo = 0;
    function passo(ora) {
      if (fermo || !pg.isConnected) return;
      /* se la pagina si e' mossa per mano d'altri (barra, tastiera), si ferma */
      if (t0 && Math.abs(pg.scrollTop - ultimo) > 2) { togli(); return; }
      if (!t0) t0 = ora;
      var D = DASOLA, fondo = pg.clientHeight * SCRIVE.testata * D.giu, dt = ora - t0, y;
      if (dt < D.andata) y = fondo * dolce(dt / D.andata);
      else if (dt < D.andata + D.sosta) y = fondo;
      else y = fondo * (1 - dolce(Math.min(1, (dt - D.andata - D.sosta) / D.ritorno)));
      pg.scrollTop = y; ultimo = pg.scrollTop;
      if (dt < D.andata + D.sosta + D.ritorno) requestAnimationFrame(passo); else togli();
    }
  }
}

function collab(corpo, S) {
  var box = el('div', 'pg-invito');
  var p = el('p', 'pg-blocco pg-stampa');
  conChiavi(p, tr(COLLAB.testo), COLLAB.chiavi);
  box.appendChild(p);
  var a = el('button', 'pg-manda'); a.type = 'button';
  a.setAttribute('aria-label', tr(COLLAB.invito));
  a.innerHTML = S.busta;
  a.appendChild(el('span', 'pg-stampa', tr(COLLAB.invito)));
  a.addEventListener('click', function () { vai('mail.svg'); });
  box.appendChild(a);
  corpo.appendChild(box);
}

/* MAIL E' UNA PORTA, non un modulo: una frase, la busta, e l'indirizzo in
   chiaro per chi preferisce copiarlo. La busta apre la posta di chi guarda
   - qualunque sia - con l'indirizzo di Vittoria gia' scritto. */
function posta(corpo, S) {
  var box = el('div', 'pg-mail');
  box.appendChild(el('p', 'pg-riga1 pg-stampa', tr(POSTA.attacco)));
  var a = el('a', 'pg-manda');
  a.href = 'mailto:' + INDIRIZZO + '?subject=' + encodeURIComponent(tr(POSTA.oggetto));
  a.setAttribute('aria-label', tr(POSTA.scrivimi));
  a.innerHTML = S.busta;
  box.appendChild(a);
  box.appendChild(el('p', 'pg-indirizzo pg-stampa', INDIRIZZO));
  corpo.appendChild(box);
}

/* ------------------------------------------------------------------ *
 * Una stanza fatta di una pagina: il piano la accende e la spegne come le
 * altre. Una sola alla volta; quella che se ne va svanisce per conto suo.
 * ------------------------------------------------------------------ */
/* la busta in alto a destra si mette di fronte alla freccia: stessa
   altezza, stesso margine dal bordo, un filo piu' grande */
function posaSu(b) {
  var f = document.getElementById('indietro');
  var r = f ? f.getBoundingClientRect() : { top: 24, left: 24, height: 28 };
  var h = Math.max(34, r.height * 1.8);
  b.style.height = h + 'px';
  b.style.top = (r.top + r.height / 2 - h / 2) + 'px';
  b.style.right = Math.max(16, r.left) + 'px';
}
/* ogni pagina: chi e' (per non portare a se stessa), se e' bianca, quale via
   in alto a destra e quali nella fascia in fondo. Senza vie in fondo la
   fascia non c'e', e la pagina arriva fino in fondo. */
function stanza(nome, componi, proprio, opz) {
  var acceso = false, pg = null, piede = null, su = null, volta = 0;
  var bianca = !!opz.bianca, sotto = opz.sotto || [];
  function ripos() { if (su) posaSu(su); }
  function bottone(v, S, cls) {
    var b = el('button', cls); b.type = 'button';
    b.setAttribute('aria-label', tr(v.testo));
    b.innerHTML = S[v.disegno] || tr(v.testo);
    b.addEventListener('click', function () { vai(v.dove); });
    return b;
  }
  return {
    accendi: function (dove) {
      if (acceso) return true;
      acceso = true; var v = ++volta;
      stile();
      pg = el('article', 'pg pg-' + nome + (bianca ? ' bianca' : '') + (sotto.length ? '' : ' senza-piede'));
      var corpo = el('div', 'pg-corpo'); pg.appendChild(corpo);
      (dove || document.body).appendChild(pg);
      piede = el('nav', 'pg-piede' + (bianca ? ' bianca' : '') + (sotto.length ? '' : ' nessuno'));
      (dove || document.body).appendChild(piede);
      document.body.classList.add('pg-dentro');
      if (piano().veste) piano().veste(bianca ? CARTA : NERO, bianca ? INCHIOSTRO : CHIARO);
      segni().then(function (S) {
        if (!acceso || v !== volta) return;
        sotto.forEach(function (k) {
          if (VIE[k].dove !== proprio) piede.appendChild(bottone(VIE[k], S, VIE[k].disegno));
        });
        if (opz.su && VIE[opz.su].dove !== proprio) {
          su = bottone(VIE[opz.su], S, 'pg-su' + (bianca ? ' bianca' : ''));
          (dove || document.body).appendChild(su);
          posaSu(su);
          addEventListener('resize', ripos);
        }
        componi(corpo, S, piede);
        void pg.offsetWidth;
        pg.classList.add('acceso'); piede.classList.add('acceso'); if (su) su.classList.add('acceso');
      });
      return true;
    },
    spegni: function () {
      if (!acceso) return;
      acceso = false; volta++;
      if (piano().sveste) piano().sveste();
      var p = pg, f = piede, u = su;
      p.classList.remove('acceso'); f.classList.remove('acceso');
      p.style.pointerEvents = 'none'; f.style.pointerEvents = 'none';
      if (u) { u.classList.remove('acceso'); u.style.pointerEvents = 'none'; }
      removeEventListener('resize', ripos); su = null;
      document.body.classList.remove('pg-dentro');
      setTimeout(function () { p.remove(); f.remove(); if (u) u.remove(); }, 350);
    },
    acceso: function () { return acceso; },
    indietro: function () { return false; },
    rifai: function () {}
  };
}

/* bio: la busta in alto, look! alla fine del testo (dentro la scena).
   collab: l'invito ha la sua busta; in fondo look!.
   mail: in fondo showroom e look!.
   contacts non c'e' piu': sta in fondo a bio. */
window.Bio      = stanza('bio', bio, 'bio.svg', { su: 'mail' });
window.Collab   = stanza('collab', collab, 'collab.svg', { bianca: true, sotto: ['look'] });
window.Posta    = stanza('mail', posta, 'mail.svg', { bianca: true, sotto: ['showroom', 'look'] });
})();
