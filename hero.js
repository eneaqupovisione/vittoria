/* =========================================================================
   L'HERO — il video della mano, e il nero che lo segue.
   -------------------------------------------------------------------------
   Nel filmato la mano parte grande davanti all'obiettivo e si ritira. Ma non
   copre mai del tutto: il nero non c'e' dentro il video, si mette sopra.

   E QUI STA LA COSA. Il nero non e' una dissolvenza a tempo: e' legato a
   QUANTO LA MANO COPRE DAVVERO, misurato sul filmato mentre scorre. Ogni
   fotogramma finisce dentro una tela da 24 per 24 e si contano i pixel
   scuri. Se la mano rallenta, il nero rallenta con lei; se il filmato viene
   rifatto, il nero lo seguira' lo stesso. Una dissolvenza a tempo, invece,
   scollerebbe alla prima modifica e si vedrebbe.

   La taratura - quanto vale "coperto" e quanto "scoperto" per QUESTO
   filmato - sta in mano.json, misurata da costruisci-mano.sh. Non e' un
   numero scelto: e' il minimo e il massimo veri.

   LA FIRMA cambia colore da sola: scura sull'immagine chiara, chiara sul
   buio. Una regola sola che serve tutte e due le prove — e nella versione
   che finisce al buio diventa il cartello di chiusura.

   IL PRE-HERO. La versione che copre non e' una prova a se': e' l'ingresso
   del piano. Il filmato sta DAVANTI alla pagina gia' composta, la mano
   chiude, e quando il buio e' pieno il velo se ne va e sotto c'e' il piano
   - che nel frattempo era li', nello stesso colore. Per questo il "nero"
   non e' nero: e' --fondo, la penombra della fotografia, e lo dice il
   foglio di stile di ogni pagina. Se fosse #000 si vedrebbe uno scalino
   nel momento peggiore, cioe' proprio quello in cui non deve succedere
   niente.

   Chi accende dice tre cose oltre al verso: se un clic RIVEDE il filmato
   (le due prove) o lo SALTA (l'ingresso, dove nessuno vuole rivedere la
   porta che si chiude), e cosa fare quando e' FINITO.

   Le due prove e il piano usano questo stesso file: cambia il verso, non
   la macchina.
   ========================================================================= */
window.Hero = (function () {
'use strict';

/* LA TELA SU CUI SI MISURA, ed e' 64 come nel generatore. Non e' una
   coincidenza da mantenere a mano: la taratura in mano.json viene da una
   griglia 64, e su una griglia piu' grossa gli stessi fotogrammi danno
   frazioni diverse - i blocchi misti fanno una media e cascano dall'altra
   parte della soglia. Con due griglie diverse il massimo misurato qui non
   arriva mai al massimo scritto li', e la stretta resta a meta'. */
var LATO = 64;
var SCURO = 120;        // sotto questo un pixel conta come coperto

/* IL BUIO ARRIVA ALLA FINE, E LO FA LA MANO.
   Prima il velo saliva dal primo istante e l'immagine era gia' ingrigita
   mentre la mano era ancora lontana. Adesso il velo non serve quasi piu':
   a chiudere lo schermo ci pensa la mano vera, che si ingrandisce finche'
   non c'e' altro. Il velo entra solo nell'ultimo pezzo, e serve a una cosa
   sola: la mano e' bruna, la pagina che viene e' blu-grigia, e senza
   qualcosa che le cucia si vedrebbe il salto. */
var VELO_DA = 0.92;     // sotto questa copertura il velo non c'e' proprio

/* LA LUCE SI BRUCIA, E POI SI TAPPA.
   Si era provato a chiudere lo schermo con la sola stretta, ma la mano e'
   aperta: il pieno piu' grande che ha e' un terzo di fotogramma, e per
   riempire con quello ci vorrebbe un ingrandimento di sei volte, dove un
   filmato da 752 righe non e' piu' un filmato.
   E comunque non e' quello che succede davvero. Quando una mano arriva
   sull'obiettivo, la macchina prima SI BRUCIA - resta poca luce, il
   diaframma si apre, e quel poco che passa diventa bianco sparato - e
   subito dopo non passa piu' niente e si fa buio. Sono due movimenti
   opposti uno dietro l'altro, e messi in fila fanno la cosa.
   Alla fine e' nero pieno, non grigio: la luce e' tappata. Quel che viene
   dopo si apre da li'. */
var BRUCIA_DA = 0.52;   // da qui la luce comincia a montare
var TAPPA_DA  = 0.86;   // qui e' al colmo, e da qui crolla
var BRUCIA    = 1.25;   // quanto monta oltre il normale, al colmo

/* LA STRETTA. Il filmato e' un'inquadratura ferma: la mano si avvicina, ma
   la macchina no, e alla fine la mano copre poco piu' di un terzo di
   schermo con le dita aperte. Cosi' invece la macchina entra dentro insieme
   a lei, e quando e' addosso all'obiettivo non resta piu' niente da vedere.
   E serve a un'altra cosa ancora: il filmato e' verticale, su uno schermo
   orizzontale ai lati resta del vuoto, e la stretta se lo mangia.

   SI STRINGE SUL PALMO e non sul centro dell'inquadratura: fra le dita si
   vede attraverso, e una stretta centrata sulle dita lascerebbe lo schermo
   a strisce. Dove sia il palmo lo misura costruisci-mano.sh sul fotogramma
   piu' coperto, e lo scrive in mano.json.

   QUANTO SI STRINGE NON E' UN NUMERO FISSO. Su un portatile orizzontale il
   filmato sta in mezzo e occupa meno di mezza larghezza; su un telefono
   riempie gia'. Per portare la mano addosso allo schermo, nel primo caso ci
   vuole il doppio della stretta del secondo. Quindi si calcola: si parte
   dal riquadro che contiene la mano nell'ultimo fotogramma - lo misura il
   generatore - e si chiede quanta stretta ci vuole perche' copra lo
   schermo. Col margine, perche' quel riquadro ha dentro anche i buchi fra
   le dita. */
var MARGINE = 3.4;      // quanto si esagera oltre il riquadro della mano.
                        // Quel riquadro contiene anche i buchi fra le dita,
                        // quindi coprirlo non basta: a 1,9 restava chiaro
                        // negli angoli, a 2,6 ne restava un filo. A 3,4 il
                        // ritaglio finale e' tutto palmo, su tutti e due i
                        // formati - verificato ritagliando l'ultimo
                        // fotogramma alle misure che ne escono.

function morbida(v) {   // piano di qua e piano di la'
  return v <= 0 ? 0 : (v >= 1 ? 1 : v * v * (3 - 2 * v));
}
function velatura(q) {  // quanto velo, per quanta copertura
  return morbida((q - VELO_DA) / (1 - VELO_DA));
}
function luce(q) {     // quanta luce c'e', per quanta copertura
  if (q <= BRUCIA_DA) return 1;
  if (q <= TAPPA_DA) {
    return 1 + BRUCIA * morbida((q - BRUCIA_DA) / (TAPPA_DA - BRUCIA_DA));
  }
  return (1 + BRUCIA) * (1 - morbida((q - TAPPA_DA) / (1 - TAPPA_DA)));
}
/* LA STRETTA VA A TEMPO, NON A COPERTURA, ed e' l'unica cosa qui dentro che
   lo fa. Tutto il resto - il velo, la luce, la bruciatura - segue la mano
   vera, perche' sono cose che la mano FA. La macchina no: la macchina si
   muove per conto suo, e un movimento di macchina o e' continuo o non e' un
   movimento. Legata alla copertura restava ferma per tre secondi e poi
   partiva tutta in fondo, perche' la copertura resta bassa finche' la mano
   e' lontana.
   E' ESPONENZIALE e non lineare: a passo costante, ingrandire da 1 a 1,1 si
   vede e da 3 a 3,1 no. Con la potenza invece la stretta cresce sempre
   della stessa FRAZIONE al secondo, ed e' cosi' che si legge come una
   velocita' sola.
   PERO' NON PROPRIO SOLA: all'inizio va piu' piano. La PIGRIZIA piega il
   tempo prima di darlo alla potenza — non lo ferma, che sarebbe tornare al
   difetto di prima, lo rallenta. Nel primo quarto del filmato la macchina
   si e' mossa di un sesto della strada invece che di un terzo, e l'ultimo
   pezzo se lo prende lei. A uno la stretta e' a velocita' costante; piu' si
   alza, piu' l'inizio e' pigro. */
var PIGRIZIA = 2.6;

function stretta(t, quanta) {
  var v = t <= 0 ? 0 : (t >= 1 ? 1 : Math.pow(t, PIGRIZIA));
  return Math.pow(quanta, v);
}

function accendi(opz) {
  var video = document.getElementById('film');
  var nero  = document.getElementById('nero');
  var firma = document.getElementById('firma');
  /* LA LUCE MUORE SULLA SCENA INTERA, non sul solo filmato: di fianco c'e'
     il vuoto bianco, e se si spegnesse solo il filmato resterebbero due
     bande accese intorno a un'immagine che muore. */
  var scena = document.getElementById('scena') || video;
  var quanta = 1;   // quanta stretta ci vuole, su QUESTO schermo
  var chiuso = false;
  function chiudi() {
    if (chiuso) return;
    chiuso = true;
    /* CHI PUO' RIVEDERE NON HA FINITO: sulle due prove il filmato riparte
       a ogni clic, e la misura deve restare accesa. All'ingresso invece si
       chiude bottega — se no basta cambiare scheda e tornare perche'
       visibilitychange rimetta il buio su una pagina che non ce l'ha piu'. */
    if (!opz.rivedi) {
      video.removeEventListener('timeupdate', vesti);
      video.removeEventListener('ended', fine);
      document.removeEventListener('visibilitychange', vesti);
      removeEventListener('resize', posaStretta);
      /* e la firma si restituisce com'era: da qui in poi il colore torna
         quello del foglio di stile, non piu' quello della mano */
      firma.style.color = ''; firma.style.opacity = '';
    }
    if (opz.finito) opz.finito();
  }
  /* L'ULTIMO ISTANTE NON SI MISURA.
     Tutto il resto segue la copertura vera, fotogramma per fotogramma, ed e'
     giusto cosi'. Ma la copertura e' una frazione di pixel scuri, e fra la
     griglia del generatore e quella del browser un paio di punti si perdono
     sempre: se il massimo misurato qui si ferma a nove decimi, la luce si
     ferma a un terzo e lo schermo non si chiude - proprio nell'istante in cui
     deve. Quando il filmato finisce la mano E' addosso all'obiettivo, e non
     c'e' niente da misurare: si chiude, in un quarto di secondo, da dove si
     era arrivati. */
  var CHIUSURA = 420;
  function fine() {
    vesti();
    /* solo per chi si copre: dall'altra parte il filmato finisce SCOPERTO,
       e chiudere li' vorrebbe dire spegnere la luce sulla figura appena
       arrivata */
    if (opz.verso !== 'copre') { chiudi(); return; }
    chiudendo = true;
    var da = quanto, t0 = performance.now();
    (function giro(ora) {
      var k = Math.min(1, (ora - t0) / CHIUSURA);
      quanto = da + (1 - da) * morbida(k);
      vestiCon(quanto);   /* la stretta e' gia' al massimo: il filmato e' finito */
      if (k < 1) requestAnimationFrame(giro);
      else chiudi();
    })(t0);
  }
  /* si parte da coperto o da scoperto a seconda del verso */
  var taratura = null, quanto = opz.verso === 'copre' ? 0 : 1;
  var tela  = document.createElement('canvas');
  tela.width = tela.height = LATO;
  var ctx = tela.getContext('2d', { willReadFrequently: true });

  var fuoco = [0.5, 0.5];

  /* IL PRIMO ISTANTE, prima che arrivi qualunque fotogramma. Il foglio di
     stile parte dal buio: bene per chi si scopre, sbagliato per chi si copre,
     che lampeggerebbe di buio prima della prima misura. */
  /* MUTO ANCHE DA COPIONE, e non solo nell'attributo: su iPhone la partenza
     automatica la concede il browser solo a un video muto, e certe versioni
     guardano la proprieta' e non l'attributo. webkit-playsinline e' per i
     telefoni vecchi, dove playsinline da solo non basta e il video partirebbe
     a tutto schermo. */
  video.muted = true;
  video.setAttribute('webkit-playsinline', '');

  nero.style.opacity = velatura(quanto);
  video.style.transform = 'scale(1)';
  scena.style.filter = 'brightness(' + luce(quanto).toFixed(3) + ')';
  video.src = opz.file;

  fetch('mano.json').then(function (r) { return r.json(); }).then(function (d) {
    taratura = d;
    if (d.fuoco && d.fuoco.length === 2) fuoco = d.fuoco;
    posaStretta();
  }).catch(function () {
    console.warn('hero: non trovo mano.json, il nero non sara\' tarato');
  });

  /* DOVE STA IL PALMO SULLO SCHERMO. Il punto lo sappiamo in frazioni del
     FOTOGRAMMA, ma il filmato sta nella pagina con object-fit:cover, che lo
     ingrandisce finche' copre e taglia quel che avanza: fra le due cose c'e'
     di mezzo un ingrandimento e uno scarto, e vanno rifatti a mano. Senza
     questo la stretta andrebbe sul centro dello schermo, che e' un altro
     punto, e la mano scapperebbe di lato proprio mentre chiude. */
  function posaStretta() {
    var W = video.clientWidth, H = video.clientHeight;
    var vl = video.videoWidth, va = video.videoHeight;
    if (!W || !H || !vl || !va) return;
    /* COME STA NELLA PAGINA lo decide il foglio di stile, e va chiesto a
       lui: dentro (contain) su uno schermo piu' largo del filmato, coprendo
       (cover) su uno piu' stretto. Le due misure sono diverse, e la stretta
       sbagliata di qualche punto porta il palmo fuori bersaglio. */
    var s = getComputedStyle(video).objectFit === 'contain'
          ? Math.min(W / vl, H / va) : Math.max(W / vl, H / va);
    var dl = vl * s, da = va * s;
    video.style.transformOrigin =
      Math.round(W / 2 + (fuoco[0] - 0.5) * dl) + 'px ' +
      Math.round(H / 2 + (fuoco[1] - 0.5) * da) + 'px';
    var m = taratura && taratura.mano;
    if (m) quanta = MARGINE * Math.max(W / (m[0] * dl), H / (m[1] * da));
  }
  addEventListener('resize', posaStretta);

  /* DOVE SIAMO NEL FILMATO, da zero a uno. Chi si copre va avanti, chi si
     scopre va indietro: in tutti e due i casi uno vuol dire "mano addosso
     all'obiettivo", che e' il punto in cui la stretta e' al massimo. */
  function quando() {
    var d = video.duration;
    if (!d || !isFinite(d)) return opz.verso === 'copre' ? 0 : 1;
    var t = Math.min(1, Math.max(0, video.currentTime / d));
    return opz.verso === 'copre' ? t : 1 - t;
  }
  function posa() {
    video.style.transform = 'scale(' + stretta(quando(), quanta).toFixed(4) + ')';
  }

  /* QUANTO E' COPERTO LO SCHERMO, e non quanto e' scuro il fotogramma.
     Non e' la stessa cosa, e per un pezzo lo e' stata per sbaglio. Il
     filmato non si vede mai tutto: object-fit ne taglia i lati o le teste,
     e la stretta ne mostra ogni volta di meno. Misurando tutto il
     fotogramma, meta' di quel che si contava era roba fuori dallo schermo -
     e siccome sul telefono il taglio e' diverso che sul computer, il buio
     arrivava in un momento diverso sui due, e su nessuno dei due nel
     momento giusto. Adesso si misura SOLO IL PEZZO CHE SI VEDE, ricavato a
     ritroso da come sta nella pagina e da quanto si e' stretto.
     Cosi' uno vuol dire una cosa sola, ovunque: lo schermo e' tutto scuro. */
  function finestra() {
    var W = video.clientWidth, H = video.clientHeight;
    var vl = video.videoWidth, va = video.videoHeight;
    if (!W || !H || !vl || !va) return null;
    var dentro = getComputedStyle(video).objectFit === 'contain';
    var s = dentro ? Math.min(W / vl, H / va) : Math.max(W / vl, H / va);
    var k = stretta(quando(), quanta);
    /* dove cade il centro della stretta, e dove comincia il filmato disegnato */
    var ox = W / 2 + (fuoco[0] - 0.5) * vl * s;
    var oy = H / 2 + (fuoco[1] - 0.5) * va * s;
    var px = (W - vl * s) / 2, py = (H - va * s) / 2;
    /* si torna indietro: dal bordo dello schermo al pixel del filmato */
    function da(bordo, o, p) { return (o + (bordo - o) / k - p) / s; }
    var ua = Math.max(0,  da(0, ox, px)), ub = Math.min(vl, da(W, ox, px));
    var va_ = Math.max(0, da(0, oy, py)), vb = Math.min(va, da(H, oy, py));
    if (!(ub > ua && vb > va_)) return null;
    /* E QUANTO DI SCHERMO NE OCCUPA. Quando il filmato sta DENTRO, di fianco
       c'e' il fondale chiaro: e' schermo anche quello, ed e' chiaro. Contando
       solo i pixel del filmato si direbbe che lo schermo e' scuro mentre meta'
       e' ancora bianca. Quindi si pesa: la frazione contata vale per la fetta
       che occupa. Quando la stretta e' arrivata a coprire tutto, la fetta e'
       uno e il peso sparisce da se'. */
    var area = ((ub - ua) * s * k) * ((vb - va_) * s * k) / (W * H);
    return [ua, va_, ub - ua, vb - va_, Math.min(1, area)];
  }

  function copertura() {
    if (!taratura || video.readyState < 2) return quanto;
    var f = finestra();
    try {
      if (f) ctx.drawImage(video, f[0], f[1], f[2], f[3], 0, 0, LATO, LATO);
      else ctx.drawImage(video, 0, 0, LATO, LATO);
    }
    catch (e) { return quanto; }
    var d = ctx.getImageData(0, 0, LATO, LATO).data, n = 0;
    /* UNA TELA SU CUI NON E' STATO DISEGNATO NIENTE E' NERA, e nera vuol dire
       coperto: se il browser non ci da' il fotogramma - scheda in secondo
       piano, decodifica non pronta - la pagina resterebbe al buio per sempre.
       L'alfa lo dice: dopo un disegno vero e' 255, prima e' 0. */
    if (d[3] === 0 && d[LATO*LATO*2 + 3] === 0) return quanto;
    for (var i = 0; i < d.length; i += 4) {
      /* luce percepita, non media dei tre canali: il verde pesa il triplo
         del blu, e la mano e' calda - con la media si sbaglierebbe */
      if (0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2] < SCURO) n++;
    }
    var c = n / (LATO * LATO) * (f ? f[4] : 1);
    /* IL TETTO E' UNO, e non piu' il massimo misurato sul filmato intero.
       Adesso si conta quel che si vede, e "tutto quel che si vede e' scuro"
       e' proprio uno: la mano ha coperto lo schermo, punto. Il pavimento
       resta quello del generatore - quanto scuro c'e' quando la mano non
       c'e' - perche' la figura e la sua ombra qualcosa contano sempre. */
    var lo = taratura.scoperto;
    return Math.max(0, Math.min(1, (c - lo) / (1 - lo)));
  }

  function vesti() {
    if (chiudendo) return;          // l'ultimo istante non si fa correggere
    vestiCon(copertura());
  }
  var chiudendo = false;
  function vestiCon(q) {
    quanto = q;
    var velo = velatura(quanto);
    nero.style.opacity = velo;
    posa();
    scena.style.filter = 'brightness(' + luce(quanto).toFixed(3) + ')';
    /* la firma passa da scura a chiara man mano che il velo sale */
    var v = Math.round(27 + (255 - 27) * velo);
    firma.style.color = 'rgb(' + v + ',' + v + ',' + v + ')';
    /* e sull'immagine chiara si vede, sul velo si vede, in mezzo no:
       nella traversata sparisce, ed e' giusto cosi' */
    firma.style.opacity = Math.abs(velo - 0.5) * 2 * 0.85 + 0.15;
  }

  var calma = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function giro() {
    vesti();
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(giro);
    else requestAnimationFrame(giro);
  }

  /* DUE RETI, e servono. La misura gira sui fotogrammi, e i fotogrammi si
     fermano se la scheda passa in secondo piano: senza queste, chi torna
     sulla pagina troverebbe il nero rimasto su. timeupdate scatta lo stesso
     quattro volte al secondo, ended chiude i conti. */
  video.addEventListener('timeupdate', vesti);
  video.addEventListener('ended', fine);
  document.addEventListener('visibilitychange', vesti);

  video.addEventListener('loadedmetadata', posaStretta);
  video.addEventListener('loadeddata', function () {
    posaStretta();
    if (calma) {
      /* chi ha chiesto di ridurre le animazioni non vuole la mano: si mostra
         il fotogramma scoperto e basta, senza nero */
      video.currentTime = opz.verso === 'copre' ? 0 : video.duration - 0.05;
      nero.style.opacity = 0; video.style.transform = ''; scena.style.filter = '';
      firma.style.color = ''; firma.style.opacity = 1;
      chiudi();
      return;
    }
    giro();
    video.play().catch(function () {
      /* se il browser rifiuta la partenza automatica si resta sul primo
         fotogramma, e si riprova al primo segno di vita: il tocco arriva
         prima del clic, e su iPhone e' quello che conta */
      var riprova = function () { video.play().catch(function () {}); };
      document.addEventListener('touchstart', riprova, { once: true, passive: true });
      document.addEventListener('pointerdown', riprova, { once: true });
    });
  });

  /* IL CLIC VUOL DIRE TRE COSE, e la prima viene prima di tutte.
     SE IL FILMATO E' FERMO, il clic lo fa partire. Su iPhone la partenza
     automatica non e' garantita - basta il risparmio energetico - e quando
     non parte il sistema ci mette sopra il suo pulsante. Chi tocca vuole
     vedere il filmato, non saltarlo: prima di quel tocco non e' cominciato
     niente, e non c'e' niente da saltare. Senza questa riga il primo tocco
     sul telefono portava dritti dentro, e sembrava un guasto.
     Poi: sulle due prove si guarda il filmato, e un clic lo rimanda da capo.
     All'ingresso del piano il filmato e' una porta, e chi clicca mentre
     scorre sta dicendo "ho capito, fammi entrare". */
  document.body.addEventListener('click', function () {
    if (calma) return;
    if (video.paused && !chiuso) { video.play(); return; }
    if (opz.rivedi) {
      /* si rivede: la chiusura forzata va disfatta, se no la misura resta
         zittita e il filmato riparte con lo schermo gia' spento */
      chiudendo = false; chiuso = false;
      video.currentTime = 0; video.play(); return;
    }
    if (video.duration) video.currentTime = video.duration;
    vesti(); chiudi();
  });
}

return { accendi: accendi };
})();
