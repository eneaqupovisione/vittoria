/* =========================================================================
   L'HERO — la mano che copre, e il nero che la segue.
   -------------------------------------------------------------------------
   NON E' UN <video>, ED E' UNA DECISIONE (29 settembre 2026). Un browser
   puo' rifiutarsi di far partire un filmato da solo - Safari con la
   riproduzione automatica spenta, il risparmio energetico sull'iPhone - e
   quando lo fa ci mette sopra il suo pulsante play e l'ingresso non parte
   finche' qualcuno non tocca. Per vedere l'ingresso non si deve toccare
   niente, mai: quindi i fotogrammi se li disegna la pagina, uno per volta,
   su una tela. Sessantacinque immagini piccole a sedici al secondo, che
   nessuna regola del browser puo' fermare. Le fa costruisci-mano.sh, e
   stanno in mano/; quante sono e quanto durano lo dice mano.json.

   Nella pellicola la mano parte lontana e arriva addosso all'obiettivo. Ma
   non copre mai del tutto: il nero non c'e' dentro le immagini, si mette
   sopra.

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

/* ------------------------------------------------------------------ *
 * LA PELLICOLA. Una fila di immagini e un orologio. Fa quel che faceva il
 * <video> - scorre, si puo' rimandare da capo, sa dove sta - e in piu' non
 * chiede permesso a nessuno.
 *
 * NON ASPETTA DI AVERLE TUTTE. Le prime bastano per cominciare: le altre
 * arrivano mentre la mano si muove, e se una tarda si tiene l'ultima
 * arrivata - un fotogramma ripetuto su una mano mossa non si vede, mezzo
 * secondo di schermo fermo si'.
 * ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ *
 * LA PELLICOLA. Una fila di immagini e un orologio. Fa quel che faceva il
 * <video> - scorre, si puo' rimandare da capo, sa dove sta - e in piu' non
 * chiede permesso a nessuno.
 *
 * I FOTOGRAMMI STANNO IN DUE FOGLI, non in novantasette file. Con un file
 * per fotogramma il browser apriva novantasette richieste insieme e se le
 * rubavano la banda a vicenda: tre-sette secondi ciascuna, e l'ingresso non
 * partiva nemmeno col wi-fi pieno. Due fogli sono due richieste, e la
 * seconda arriva mentre la prima scorre gia'. Due e non uno perche' una
 * tela troppo grande, su iPhone, non si decodifica affatto.
 * ------------------------------------------------------------------ */
function Pellicola(tela, dati, verso) {
  var q = dati.quanti;
  this.tela = tela; this.pit = tela.getContext('2d');
  this.largo = dati.largo; this.alto = dati.alto;
  this.colonne = dati.colonne || 7;
  this.fogli = (dati.fogli || []).map(function (f) {
    return { file: f.file, da: f.da, quanti: f.quanti, imm: null };
  });
  this.quanti = q; this.passo = dati.passo;
  this.durata = q * dati.passo / 1000;
  this.tempo = 0; this.ferma = true; this.pronta = false;
  tela.width = dati.largo; tela.height = dati.alto;
  /* la tela su cui si misura vuole UN fotogramma solo, non tutto il foglio:
     si ritaglia qui, e solo quando cambia */
  this.uno = document.createElement('canvas');
  this.uno.width = dati.largo; this.uno.height = dati.alto;
  this.unoPit = this.uno.getContext('2d');
  this.unoQuale = -1;
  /* chi si scopre e' la stessa pellicola letta al contrario */
  this.ordine = [];
  for (var i = 0; i < q; i++) this.ordine.push(verso === 'copre' ? i : q - 1 - i);
}
/* dove sta il fotogramma n dentro i fogli: quale foglio, e in che riquadro */
Pellicola.prototype.dove = function (n) {
  for (var i = 0; i < this.fogli.length; i++) {
    var f = this.fogli[i];
    if (n >= f.da && n < f.da + f.quanti) {
      var l = n - f.da;
      return { imm: f.imm, x: (l % this.colonne) * this.largo,
               y: ((l / this.colonne) | 0) * this.alto };
    }
  }
  return null;
};
/* SI COMINCIA COL PRIMO FOGLIO. Copre i primi due secondi di mano: il
   secondo arriva mentre quello scorre, e se tardasse si resterebbe
   sull'ultimo fotogramma buono invece che sul vuoto. */
Pellicola.prototype.carica = function (fatto) {
  var p = this, visto = false;
  function presa(f, cosa) {
    f.imm = cosa;
    if (f === p.fogli[0] && !visto) { visto = true; p.pronta = true; p.disegna(); fatto(); }
  }
  this.fogli.forEach(function (f) {
    var url = f.file + (window.MARCA || '');
    if (window.createImageBitmap && window.fetch) {
      fetch(url).then(function (r) { return r.blob(); })
        .then(function (b) { return createImageBitmap(b); })
        .then(function (bm) { presa(f, bm); })
        .catch(function () { presa(f, null); });
      return;
    }
    var im = new Image();
    im.onload = function () {
      if (im.decode) im.decode().then(function () { presa(f, im); }, function () { presa(f, im); });
      else presa(f, im);
    };
    im.onerror = function () { presa(f, null); };
    im.src = url;
  });
};
/* a che punto siamo, in fotogrammi: la parte intera e quanto manca al prossimo */
Pellicola.prototype.quale = function () {
  return Math.max(0, Math.min(this.quanti - 1, Math.floor(this.tempo * 1000 / this.passo)));
};
Pellicola.prototype.frazione = function () {
  var x = this.tempo * 1000 / this.passo;
  return Math.max(0, Math.min(1, x - Math.floor(x)));
};
/* il fotogramma di adesso, ritagliato dal foglio: serve alla misura del
   buio, che vuole un'immagine sola da contare */
Pellicola.prototype.immagine = function () {
  var i = this.quale();
  if (i !== this.unoQuale) {
    var d = this.dove(this.ordine[i]);
    if (!d || !d.imm) return this.unoQuale >= 0 ? this.uno : null;
    this.unoPit.drawImage(d.imm, d.x, d.y, this.largo, this.alto, 0, 0, this.largo, this.alto);
    this.unoQuale = i;
  }
  return this.unoQuale >= 0 ? this.uno : null;
};
/* DUE FOTOGRAMMI ALLA VOLTA, SFUMATI. A ventiquattro al secondo un
   fotogramma resta fermo quaranta millesimi, e su uno schermo che ne
   disegna sessanta si vede lo scatto. Disegnando quello di adesso e sopra,
   in trasparenza, quello dopo - tanta quanta parte del suo tempo e' gia'
   passata - il movimento non salta mai: e' la dissolvenza continua che in
   un filmato fa il mosso naturale. */
Pellicola.prototype.mostra = function (n, alfa) {
  var d = this.dove(n);
  if (!d || !d.imm) return false;
  this.pit.globalAlpha = alfa;
  this.pit.drawImage(d.imm, d.x, d.y, this.largo, this.alto, 0, 0, this.largo, this.alto);
  this.pit.globalAlpha = 1;
  return true;
};
Pellicola.prototype.disegna = function () {
  var i = this.quale();
  if (!this.mostra(this.ordine[i], 1)) return;
  var f = this.frazione();
  if (f > 0.02 && i + 1 < this.quanti) this.mostra(this.ordine[i + 1], f);
};
/* l'orologio e' il tempo vero, non il conto dei giri: se la scheda va in
   secondo piano e i giri si fermano, tornando non si recupera un secondo
   di mano tutto insieme - si riparte da dove il tempo dice */
Pellicola.prototype.corri = function (aOgniGiro, allaFine) {
  if (!this.ferma) return;
  var p = this, scorso = performance.now();
  this.ferma = false;
  (function giro(ora) {
    if (p.ferma) return;
    p.tempo = Math.min(p.durata, p.tempo + Math.min(0.1, (ora - scorso) / 1000));
    scorso = ora;
    p.disegna();
    aOgniGiro();
    if (p.tempo >= p.durata) { p.ferma = true; allaFine(); return; }
    requestAnimationFrame(giro);
  })(scorso);
};
Pellicola.prototype.dacapo = function () { this.tempo = 0; this.ferma = true; this.disegna(); };
Pellicola.prototype.finito = function () { return this.tempo >= this.durata; };

function accendi(opz) {
  var tela2 = document.getElementById('film');
  var pel = null;
  var nero  = document.getElementById('nero');
  var firma = document.getElementById('firma');
  /* LA LUCE MUORE SULLA SCENA INTERA, non sul solo filmato: di fianco c'e'
     il vuoto bianco, e se si spegnesse solo il filmato resterebbero due
     bande accese intorno a un'immagine che muore. */
  var scena = document.getElementById('scena') || tela2;
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
  /* QUANDO PARTE, E COSA SUCCEDE SE NON PARTE.
     ATTESA: un respiro prima di far correre il filmato. Serve a non
     bruciare i primi fotogrammi mentre la pagina sta ancora finendo di
     comporsi - la mano comincia a muoversi quando c'e' qualcuno che guarda.
     E' un respiro, non un'attesa: un terzo di secondo.
     SENZA: NESSUNO DEVE TOCCARE LO SCHERMO PER VEDERE L'INGRESSO, mai, ne'
     da telefono ne' da computer. Se il browser rifiuta la partenza
     automatica - Safari con la riproduzione automatica spenta, il risparmio
     energetico sull'iPhone - prima si restava fermi sul primo fotogramma ad
     aspettare un tocco, col pulsante play di sistema sopra. Adesso no: si
     controlla se il filmato si e' mosso davvero, e se non si e' mosso
     l'ingresso si fa lo stesso, senza la mano: la luce si brucia, il buio
     si chiude, e il piano arriva. Chi guarda non aspetta niente.
     MORTO: e se i fotogrammi non arrivano proprio - rete che non risponde -
     si entra comunque, ma DOPO AVER ASPETTATO SUL SERIO. A due secondi e
     mezzo scattava mentre il primo foglio stava ancora scendendo, e
     l'ingresso si perdeva la mano con la rete in ordine. */
  var ATTESA = 330, MORTO = 9000;
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
  nero.style.opacity = velatura(quanto);
  tela2.style.transform = 'scale(1)';
  scena.style.filter = 'brightness(' + luce(quanto).toFixed(3) + ')';

  /* DOVE STA IL PALMO SULLO SCHERMO. Il punto lo sappiamo in frazioni del
     FOTOGRAMMA, ma il filmato sta nella pagina con object-fit:cover, che lo
     ingrandisce finche' copre e taglia quel che avanza: fra le due cose c'e'
     di mezzo un ingrandimento e uno scarto, e vanno rifatti a mano. Senza
     questo la stretta andrebbe sul centro dello schermo, che e' un altro
     punto, e la mano scapperebbe di lato proprio mentre chiude. */
  function posaStretta() {
    var W = tela2.clientWidth, H = tela2.clientHeight;
    var vl = pel && pel.largo, va = pel && pel.alto;
    if (!W || !H || !vl || !va) return;
    /* COME STA NELLA PAGINA lo decide il foglio di stile, e va chiesto a
       lui: dentro (contain) su uno schermo piu' largo del filmato, coprendo
       (cover) su uno piu' stretto. Le due misure sono diverse, e la stretta
       sbagliata di qualche punto porta il palmo fuori bersaglio. */
    var s = getComputedStyle(tela2).objectFit === 'contain'
          ? Math.min(W / vl, H / va) : Math.max(W / vl, H / va);
    var dl = vl * s, da = va * s;
    tela2.style.transformOrigin =
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
    var d = pel && pel.durata;
    if (!d || !isFinite(d)) return opz.verso === 'copre' ? 0 : 1;
    var t = Math.min(1, Math.max(0, pel.tempo / d));
    return opz.verso === 'copre' ? t : 1 - t;
  }
  function posa() {
    tela2.style.transform = 'scale(' + stretta(quando(), quanta).toFixed(4) + ')';
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
    var W = tela2.clientWidth, H = tela2.clientHeight;
    var vl = pel && pel.largo, va = pel && pel.alto;
    if (!W || !H || !vl || !va) return null;
    var dentro = getComputedStyle(tela2).objectFit === 'contain';
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
    if (!taratura || !pel || !pel.pronta) return quanto;
    var f = finestra(), im = pel.immagine();
    if (!im) return quanto;
    try {
      if (f) ctx.drawImage(im, f[0], f[1], f[2], f[3], 0, 0, LATO, LATO);
      else ctx.drawImage(im, 0, 0, LATO, LATO);
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
    mira = copertura(); ultimaMisura = performance.now();
    vestiCon(mira);
  }
  /* LA MISURA NON VA A SESSANTA AL SECONDO. Contare i pixel scuri vuol dire
     rileggere la tela dalla scheda video, e a ogni giro di schermo e'
     proprio la cosa che fa perdere fotogrammi. Si misura venticinque volte
     al secondo - piu' spesso di quanto la pellicola cambi immagine - e fra
     una misura e l'altra il velo ci scivola sopra invece di saltarci. Il
     risultato e' piu' fluido di prima, non meno: quel che si vede muoversi
     e' continuo, quel che si conta no. */
  var mira = quanto, ultimaMisura = 0;
  function passoDelVelo() {
    if (chiudendo) return;
    var ora = performance.now();
    if (ora - ultimaMisura > 38) { mira = copertura(); ultimaMisura = ora; }
    quanto += (mira - quanto) * 0.45;
    vestiCon(quanto);
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

  /* UNA RETE, e serve: se la scheda passa in secondo piano i giri si
     fermano, e chi torna troverebbe il nero rimasto su. */
  document.addEventListener('visibilitychange', vesti);

  var partito = false, arrivato = false;
  function pronta() {
    arrivato = true;
    posaStretta();
    if (calma) {
      /* chi ha chiesto di ridurre le animazioni non vuole la mano: si
         mostra il primo fotogramma e basta, senza nero */
      pel.tempo = 0; pel.disegna();
      nero.style.opacity = 0; tela2.style.transform = ''; scena.style.filter = '';
      firma.style.color = ''; firma.style.opacity = 1;
      chiudi();
      return;
    }
    vesti();
    /* IL RESPIRO PRIMA DI PARTIRE: giusto il tempo che la pagina finisca di
       comporsi, se no i primi fotogrammi corrono mentre nessuno guarda.
       E' un respiro, non un'attesa. */
    setTimeout(parti, ATTESA);
  }
  function parti() {
    if (chiuso || partito) return;
    partito = true;
    pel.corri(passoDelVelo, fine);
  }
  /* SE LE IMMAGINI NON ARRIVANO PROPRIO - rete che non risponde - non si
     resta fermi a guardare il vuoto: si entra lo stesso, con la luce che si
     brucia e il buio che si chiude. */
  function senzaMano() {
    if (chiuso || chiudendo || partito || arrivato) return;
    chiudendo = true;
    var da = quanto, t0 = performance.now(), DUR = 900;
    (function passo(ora) {
      var k = Math.min(1, (ora - t0) / DUR);
      quanto = da + (1 - da) * morbida(k);
      vestiCon(quanto);
      if (k < 1) requestAnimationFrame(passo);
      else chiudi();
    })(t0);
  }
  setTimeout(function () { if (!arrivato && !partito && !calma) senzaMano(); }, MORTO);

  /* si chiedono la taratura e i fotogrammi insieme: la prima dice come
     vestire la mano, i secondi sono la mano */
  fetch('mano.json' + (window.MARCA || '')).then(function (r) { return r.json(); }).then(function (d) {
    taratura = d;
    if (d.fuoco && d.fuoco.length === 2) fuoco = d.fuoco;
    if (!d.pellicola) throw new Error('mano.json non ha la pellicola');
    pel = new Pellicola(tela2, d.pellicola, opz.verso);
    posaStretta();
    /* ?senza-mano prova la strada di chi le immagini non le riceve */
    if (/[?&]senza-mano\b/.test(location.search)) { senzaMano(); return; }
    pel.carica(pronta);
  }).catch(function (e) {
    console.warn('hero: ' + (e && e.message ? e.message : 'niente taratura'));
    senzaMano();
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
    /* solo sulle due prove un clic fa ripartire il filmato fermo: al piano
       il clic vuol dire "fammi entrare", e per vedere l'ingresso non si
       tocca mai niente */
    if (!pel) return;
    if (opz.rivedi) {
      /* si rivede: la chiusura forzata va disfatta, se no la misura resta
         zittita e la pellicola riparte con lo schermo gia' spento */
      chiudendo = false; chiuso = false;
      pel.dacapo(); pel.corri(passoDelVelo, fine); return;
    }
    pel.tempo = pel.durata; pel.ferma = true;
    vesti(); chiudi();
  });
}

return { accendi: accendi };
})();
