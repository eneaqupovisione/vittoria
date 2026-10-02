/* =========================================================================
   IL TUFFO — la stanza di "look!", nella penombra.
   -------------------------------------------------------------------------
   E' demo/tuffo.html rifatto: stesso comportamento, stessa velatura, gli
   stessi numeri delle manopole (sono tarati, e le ragioni stanno scritte
   la' accanto a ognuno). Due differenze volute:

   - NIENTE LIBRERIA. Il tuffo usa three.js dal CDN; qui non c'e' nessuna
     dipendenza esterna, come nel resto di drawings/. Serviva poco: cento
     riquadri sono seicento vertici, un disegno solo, e lo shader e' lo
     stesso di la'.
   - IL FONDO E' NERO, dal 29 settembre 2026. Dopo l'ingresso - che e' del
     colore del fondale della fotografia - nel sito esistono solo il bianco
     e il nero: lo showroom e' una galleria bianca, il campo e' il buio. Su
     nero le fotografie si staccano e la nebbia dei riquadri lontani le
     spegne senza sporcarle. Per guardare l'altra strada: ?campo=bianco.

   LE FOTOGRAFIE CI SONO (29 settembre 2026), e sono quelle vere: le porta
   porta-le-foto.sh, le elenca foto.json, e qui si impacchettano in un
   ATLANTE - una tela sola con dentro tutte, in griglia - cosi' il campo
   resta un disegno solo, con una tessitura sola e una chiamata sola. Ogni
   riquadro prende la FORMA della sua fotografia: niente tagli.
   ========================================================================= */
window.Tuffo = (function () {
'use strict';

/* LE MANOPOLE. Erano quelle del tuffo, tarate su cento riquadri finti in
   una nuvola larga. Col 29 settembre 2026 le fotografie sono dodici e vere,
   e cento riquadri vorrebbero dire otto copie a testa: una nuvola di
   ripetizioni, che e' esattamente l'effetto da evitare. POCHE E GRANDI:
   ognuna compare UNA VOLTA SOLA, larga, e stanno su un GUSCIO intorno a chi
   guarda invece che in una nuvola piena. Il vuoto che resta non e' un buco,
   e' aria - un provino a contatto in tre dimensioni, non un magazzino. */
var CFG = {
  /* UN'ESPLOSIONE DI FOTOGRAFIE, ferma a mezz'aria. Non un guscio - li' si
     vedevano appiccicate una sull'altra - e nemmeno un tunnel: una nuvola
     dentro cui si gira intorno.

     PERCHE' SI SENTA LA DISTANZA, tre cose e tutte e tre insieme:
     1. SONO TUTTE DELLA STESSA MISURA. Se una e' grande e una piccola, non
        si sa piu' se quella piccola e' piccola o lontana: la misura sullo
        schermo smette di dire la distanza. Misure uguali nel mondo, e
        allora quanto si vede grande E' quanto e' vicina.
     2. IL FONDO SE LE MANGIA. Piu' sono lontane piu' si sciolgono nel nero,
        come la foschia con le montagne: e' l'unica cosa che separa due
        fotografie sovrapposte senza bisogno di muoversi.
     3. NON SI STA MAI DEL TUTTO FERMI. La nuvola gira sempre, piano: le
        vicine scorrono via in fretta, le lontane quasi non si muovono, ed
        e' cosi' che l'occhio capisce che una sta dietro l'altra. */
  raggio:    60,     // il volume in cui stanno sparse
  schiaccio: 0.66,   // l'asse verticale vale meno: la nuvola e' schiacciata
  misura:    13,     // il lato lungo, UGUALE PER TUTTE
  veloDa:    56,     // da qui comincia a sciogliersi nel fondo
  veloA:     168,    // qui e' sparita
  senso:     0.0026, // radianti per pixel trascinato
  frenata:   0.94,   // quanto resta della velocita' a ogni giro: la corsa
                     // continua dopo che la mano ha lasciato
  deriva:    0.022,  // radianti al secondo quando nessuno tocca
  molla:     0.10,   // quanto la distanza si avvicina alla meta'
  zoomPasso: 0.0016,
  fuocoSu:   0.10,   // quanto cresce quella guardata
  fuocoGiu: -0.04,   // quanto rientrano le altre
  smorza:    0.55,   // quanto sbiadiscono verso il fondo
  fuocoTau:  130,    // ms
  distMin:   18,
  /* ALLONTANARSI HA UN FONDO (30 settembre 2026). Prima si arrivava a 240, e
     la nuvola si scioglieva tutta nella foschia: si finiva nel nero pieno,
     senza niente da guardare. Adesso ci si ferma a 150, con la nuvola
     intera e piccola nel buio. */
  distMax:   150,
  /* SI STA AL BORDO DELLA NUVOLA, non dentro e non davanti. Da qui le
     vicine sono grandi e le lontane piccole, e fra le due c'e' tutta la
     profondita' che serve. */
  distCasa:  78,
  faldaMin:  0.14,   // quanto ci si avvicina al polo prima di ribaltare
  /* LO SCOPPIO. All'apertura le fotografie stanno tutte in un punto, e da
     li' scoppiano fuori: partono insieme, corrono, e si fermano piano nel
     loro posto. La macchina intanto si tira indietro, che e' il gesto di
     chi fa un passo per guardare una cosa che gli si apre davanti.
     Due secondi scarsi: piu' lungo non e' piu' bello, e' piu' lento. */
  scoppioDa: 0.05,   // da che frazione del raggio partono
  entraDa:   30,     // da quanto vicino guarda la macchina, all'inizio
  entraGiro: 0.75,   // e quanto si e' girati
  entraDura: 1900,   // ms
  fov:       55,
  /* L'ATTRAZIONE (30 settembre 2026). Una fotografia si lascia tirare dal
     puntatore, ma solo quando ci si e' vicini: entro 'tiroRaggio' volte la
     sua mezza misura. Tirassero tutte, da qualunque distanza, la nuvola si
     accartoccerebbe dietro alla mano - il casino. 'tiro' e' quanta strada
     fa verso il puntatore, in frazione della distanza, e cala dritta fino
     a zero sul bordo del raggio: comincia piano e non scatta. Al massimo
     una fotografia si sposta di un quinto della sua misura. */
  tiroRaggio: 1.7,
  tiro:       0.8,
  tiroTau:    160,   // ms: quanto ci mette a seguire
  /* DAVANTI. Toccata, una fotografia lascia il suo posto e viene davanti a
     chi guarda, grande quasi quanto lo schermo ('davanti' e' quanto ne
     occupa). Le altre restano dove sono, nella foschia. Un altro tocco, o
     Esc, o un trascinamento, e torna al suo posto. */
  davanti:    0.70,
  davantiGiu: 0.07,  // e scende un filo: in cima c'e' il titolo
  davantiTau: 260
};



/* L'ATLANTE. Una griglia di celle quadrate: ogni fotografia sta dentro la
   sua SENZA essere tagliata, e il riquadro pesca esattamente il rettangolo
   che occupa. Le celle sono 512, che su un riquadro grande e vicino
   bastano - e' un campo, non una stampa. */
var CELLA = 512;
var FOTO = [], ATLANTE = null, quadri3 = [];

/* IL COLORE DELLA PAGINA, chiesto alla pagina. Il piano ha una variabile
   sola per il fondo: qui non si ricopia, si legge. Un valore che non si
   sa leggere non deve spegnere la stanza, quindi c'e' un ripiego. */
function dallaPagina(nome, ripiego) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  var m = /^#([0-9a-f]{6})$/i.exec(v);
  if (!m) return ripiego;
  var n = parseInt(m[1], 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
/* IL NERO NON E' #000 E IL BIANCO NON E' #FFF: un nero pieno fa sembrare
   sporco il nero delle fotografie, e un bianco pieno abbaglia intorno a una
   stampa. Sono il quasi-nero e il quasi-bianco della carta. */
var NERO = [0.043, 0.043, 0.047], BIANCO = [0.969, 0.965, 0.957];
var FONDO = NERO;

var tela, gl, prog, statico, mobile, N = CFG.quanti, volta = 0, telaAtlante = null;
var centri, misure, fuochi, acceso = false, giro = null;

/* ------------------------------------------------------------------ *
 * Matrici. Il minimo, scritto a mano.
 * ------------------------------------------------------------------ */
function prospettiva(fov, rapporto, vicino, lontano) {
  var f = 1 / Math.tan(fov * Math.PI / 360), nf = 1 / (vicino - lontano);
  return [f / rapporto,0,0,0,  0,f,0,0,
          0,0,(lontano + vicino) * nf,-1,  0,0,2 * lontano * vicino * nf,0];
}
function meno(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function per(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function croce(a, b) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
function unita(v) {
  var d = Math.sqrt(per(v, v)) || 1;
  return [v[0]/d, v[1]/d, v[2]/d];
}
function perMat(a, b) {
  var o = new Array(16);
  for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
    var s = 0;
    for (var k = 0; k < 4; k++) s += a[k*4+j] * b[i*4+k];
    o[i*4+j] = s;
  }
  return o;
}

/* ------------------------------------------------------------------ *
 * Lo shader. E' quello del tuffo, con una sola sostituzione: dove la'
 * si prende il colore dall'atlante, qui c'e' una tinta piena.
 *
 * Il riquadro guarda la camera SENZA UNA RIGA DI TRIGONOMETRIA: si porta
 * il centro in spazio camera e li' si aggiungono gli angoli alle sole xy,
 * che in quello spazio SONO gia' gli assi dello schermo.
 * ------------------------------------------------------------------ */
/* LA PRECISIONE VA DICHIARATA, e non e' pignoleria. Nel vertice i float
   sono highp per difetto, nel frammento no: tutto quel che ATTRAVERSA i
   due - gli uniform in comune e i varying - deve avere la stessa
   precisione, o il programma non si lega e non si vede niente. Le
   matrici e le posizioni restano highp, dove serve davvero. */
var VERT =
 'attribute vec2 angolo; attribute vec3 centro; attribute vec2 misura;' +
 'attribute vec4 quadro;  attribute float fuoco; attribute vec3 sposta;' +
 'uniform mat4 vista; uniform mat4 proiezione;' +
 /* L'APERTURA: a zero tutte le fotografie stanno nello stesso punto, al
    centro; a uno sono al loro posto. E' lo scoppio, e si fa qui - una
    moltiplicazione - invece di riscrivere il disegno a ogni fotogramma. */
 'uniform float apertura;' +
 'uniform mediump float fuocoAttivo; uniform float su; uniform float giu;' +
 'varying mediump vec2 vUv; varying mediump float vProf; varying mediump float vFuoco;' +
 'varying mediump vec2 vPieno;' +
 'void main(){' +
 '  vPieno = vec2(angolo.x + 0.5, 0.5 - angolo.y);' +
 '  vec4 v = vista * vec4(centro * apertura, 1.0);' +
 /* lo spostamento sta in spazio camera: il tiro verso il puntatore, e la
    strada fino a davanti agli occhi di quella toccata */
 '  v.xyz += sposta;' +
    /* uno avanti e gli altri indietro, scritto come una somma sola: cosi'
       e' continuo, e non c'e' un istante in cui sono avanti tutti e due */
 '  v.xy += angolo * misura * (1.0 + su * fuoco + giu * (fuocoAttivo - fuoco));' +
 /* la v si legge al contrario: nella tela l'origine e' in alto */
 '  vUv = quadro.xy + vec2(angolo.x + 0.5, 0.5 - angolo.y) * quadro.zw;' +
 '  vFuoco = fuoco; vProf = -v.z;' +
 '  gl_Position = proiezione * v;' +
 '}';

var FRAG =
 'precision mediump float;' +
 'uniform float veloDa; uniform float veloA; uniform vec3 fondo;' +
 'uniform mediump float fuocoAttivo; uniform float smorza; uniform sampler2D atlante;' +
 'uniform sampler2D alta; uniform float usaAlta;' +
 'varying mediump vec2 vUv; varying mediump float vProf; varying mediump float vFuoco;' +
 'varying mediump vec2 vPieno;' +
 'void main(){' +
 '  float velo = smoothstep(veloDa, veloA, vProf);' +
 '  velo = velo * (1.0 - vFuoco);' +            // il guardato esce dalla foschia
 '  velo = mix(velo, 1.0, smorza * (fuocoAttivo - vFuoco));' +  // gli altri ci entrano
 '  vec3 scatto = usaAlta > 0.5 ? texture2D(alta, vPieno).rgb : texture2D(atlante, vUv).rgb;' +
 '  gl_FragColor = vec4(mix(scatto, fondo, velo), 1.0);' +
 '}';

function compila(t, s) {
  var o = gl.createShader(t);
  gl.shaderSource(o, s); gl.compileShader(o);
  if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
  return o;
}

/* ------------------------------------------------------------------ *
 * Il campo.
 * ------------------------------------------------------------------ */
/* dove sta la fotografia numero i: sparsa nel volume, col seme, cosi' la
   nuvola e' sempre la stessa. La radice cubica tiene conto che in una sfera
   il guscio e' piu' largo del centro: senza, si affollerebbero in mezzo.
   E NESSUNA TROPPO VICINA A UN'ALTRA: se due capitano appiccicate si
   spinge la seconda piu' in la', se no a schermo si leggono come una sola
   cosa schiacciata. */
function nellEsplosione(i, gia) {
  for (var prova = 0; prova < 24; prova++) {
    var r = CFG.raggio * Math.cbrt(0.12 + 0.88 * caso(i, 1 + prova * 3));
    var c = caso(i, 2 + prova * 3) * 2 - 1, s = Math.sqrt(1 - c * c);
    var f = caso(i, 3 + prova * 3) * Math.PI * 2;
    var p = [r * s * Math.cos(f), r * c * CFG.schiaccio, r * s * Math.sin(f)];
    var vicina = false;
    for (var j = 0; j < gia.length; j++) {
      var q = gia[j];
      if (Math.hypot(p[0]-q[0], p[1]-q[1], p[2]-q[2]) < CFG.misura * 1.9) { vicina = true; break; }
    }
    if (!vicina) return p;
  }
  return p;
}
/* un caso col seme: la spirale e' sempre la stessa, non balla a ogni
   apertura - e cosi' le due copie combaciano */
function caso(i, n) {
  var x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ *
 * L'ATLANTE. Si chiede foto.json, si tirano giu' le fotografie piccole e
 * si impacchettano in una tela sola, in celle quadrate. Ognuna sta nella
 * sua cella per intero - nessun taglio - e si segna il rettangolo esatto
 * che occupa: e' quello che il riquadro andra' a pescare.
 * La tela e' di lato una potenza di due, se no niente mipmap, e da lontano
 * i riquadri brulicherebbero.
 * ------------------------------------------------------------------ */
var pronto = null;
function due(n) { var p = 1; while (p < n) p *= 2; return p; }
function porta() {
  if (pronto) return pronto;
  pronto = fetch('foto.json' + (window.MARCA || ''))
    .then(function (r) { if (!r.ok) throw new Error('foto.json'); return r.json(); })
    .then(function (d) {
      /* A QUOTA, non tutte: di ogni gruppo entrano quelle che stanno
         appese ("muro" in foto.json). Se entrasse tutto il servizio di moda,
         quattordici scatti su ventuno, il campo direbbe che Vittoria fa una
         cosa sola. */
      FOTO = [];
      d.settori.forEach(function (s) {
        s.foto.slice(0, s.muro || s.foto.length).forEach(function (f) { FOTO.push(f); });
      });
      if (!FOTO.length) throw new Error('foto.json e\' vuoto');
      return Promise.all(FOTO.map(function (f) {
        return new Promise(function (ok) {
          var im = new Image();
          im.onload = function () { ok(im); };
          im.onerror = function () { ok(null); };
          im.src = 'foto/' + f.id + '-450.webp' + (window.MARCA || '');
        });
      }));
    })
    .then(function (imgs) {
      var n = FOTO.length, col = Math.ceil(Math.sqrt(n)), rig = Math.ceil(n / col);
      var cv = document.createElement('canvas');
      cv.width = due(col * CELLA); cv.height = due(rig * CELLA);
      var x = cv.getContext('2d');
      quadri3 = [];
      FOTO.forEach(function (f, i) {
        var cx = (i % col) * CELLA, cy = ((i / col) | 0) * CELLA;
        var w = f.ar >= 1 ? CELLA : Math.round(CELLA * f.ar);
        var h = f.ar >= 1 ? Math.round(CELLA / f.ar) : CELLA;
        var ox = cx + (CELLA - w) / 2, oy = cy + (CELLA - h) / 2;
        if (imgs[i]) x.drawImage(imgs[i], ox, oy, w, h);
        else { x.fillStyle = f.colore || '#888888'; x.fillRect(ox, oy, w, h); }
        quadri3.push({ ar: f.ar, u: ox / cv.width, v: oy / cv.height,
                       du: w / cv.width, dv: h / cv.height });
      });
      telaAtlante = cv;
    });
  pronto.catch(function () { pronto = null; });      // la prossima volta si riprova
  return pronto;
}
/* LA FOTOGRAFIA DAVANTI E' IN ALTA (30 settembre 2026). Nell'atlante ogni
   fotografia e' di 450 pixel: da lontano bastano, grande quanto lo schermo
   si vedeva sgranata. Quella toccata si chiede a 1800, da sola, e quando
   arriva si ridisegna sopra la sua copia piccola. Si tiene quella caricata,
   cosi' sfogliando avanti e indietro non si richiede niente. */
var ALTE = {};
function alta(i) {
  if (ALTE[i] !== undefined || !gl) return ALTE[i] || null;
  ALTE[i] = null;
  var im = new Image(), g = gl, v = volta;
  im.onload = function () {
    if (g !== gl || v !== volta) return;         // la stanza nel frattempo si e' spenta
    var t = g.createTexture();
    g.bindTexture(g.TEXTURE_2D, t);
    g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, im);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
    ALTE[i] = t;
  };
  im.onerror = function () { delete ALTE[i]; };
  im.src = 'foto/' + FOTO[i].id + '-1800.webp' + (window.MARCA || '');
  return null;
}
function caricaAtlante() {
  ALTE = {};
  ATLANTE = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, ATLANTE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, telaAtlante);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
}

function costruisci() {
  N = FOTO.length;
  centri = new Float32Array(N * 3);
  misure = new Float32Array(N * 2);
  fuochi = new Float32Array(N);
  tiri = new Float32Array(N * 2);
  avanti = new Float32Array(N);
  scelta = -1;

  var ANG = [[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,-0.5],[0.5,0.5],[-0.5,0.5]];
  var dati = new Float32Array(N * 6 * 11);
  var messe = [];
  for (var i = 0; i < N; i++) {
    var p = nellEsplosione(i, messe);
    messe.push(p);
    centri[i*3] = p[0]; centri[i*3+1] = p[1]; centri[i*3+2] = p[2];

    /* LA STESSA MISURA PER TUTTE: il lato lungo vale CFG.misura e l'altro
       si ricava dal formato. Cosi' quanto si vede grande dice quanto e'
       vicina, e non quanto e' grande. */
    var q = quadri3[i], f = q.ar;
    var l = f >= 1 ? CFG.misura : CFG.misura * f;
    var a = f >= 1 ? CFG.misura / f : CFG.misura;
    misure[i*2] = l; misure[i*2+1] = a;

    for (var v = 0; v < 6; v++) {
      var o = (i*6 + v) * 11;
      dati[o]   = ANG[v][0]; dati[o+1] = ANG[v][1];
      dati[o+2] = p[0]; dati[o+3] = p[1]; dati[o+4] = p[2];
      dati[o+5] = l;    dati[o+6] = a;
      dati[o+7] = q.u;  dati[o+8] = q.v; dati[o+9] = q.du; dati[o+10] = q.dv;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, statico);
  gl.bufferData(gl.ARRAY_BUFFER, dati, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, mobile);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(N * 6 * 4), gl.DYNAMIC_DRAW);
}

function lega(nome, n, passo, salto, buf) {
  var l = gl.getAttribLocation(prog, nome);
  if (l < 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(l);
  gl.vertexAttribPointer(l, n, gl.FLOAT, false, passo, salto);
}

/* ------------------------------------------------------------------ *
 * CHI GUARDA GIRA INTORNO ALLA NUVOLA. Si trascina per girarla, si scorre
 * per avvicinarsi o allontanarsi. E non si ferma mai del tutto: la corsa si
 * consuma piano, e quando nessuno tocca la nuvola continua a girare da
 * sola. E' quel movimento che fa vedere le distanze: le fotografie vicine
 * scorrono in fretta, le lontane quasi stanno ferme.
 * ------------------------------------------------------------------ */
var giroT = 0.6, giroF = 1.15, velT = 0, velF = 0, apertura = 1;
var dist = CFG.distCasa, distMeta = CFG.distCasa;
var mano = null, dita = {}, pinza = 0, punta = null, guardato = -1;
var scelta = -1, tiri = null, avanti = null, tocco = null;
var entrata = 0;        // quando e' cominciato l'arrivo
var CALMA = matchMedia('(prefers-reduced-motion: reduce)').matches;
var GROSSO = matchMedia('(pointer: coarse)').matches;

function giu(e) {
  /* la cattura del puntatore sa lanciare se l'id non e' attivo, e senza
     rete l'eccezione ammazzerebbe il trascinamento sul nascere */
  try { tela.setPointerCapture(e.pointerId); } catch (x) {}
  dita[e.pointerId] = { x: e.clientX, y: e.clientY };
  var chiavi = Object.keys(dita);
  if (chiavi.length === 2) {
    var a = dita[chiavi[0]], b = dita[chiavi[1]];
    pinza = Math.hypot(a.x-b.x, a.y-b.y);
  }
  mano = { x: e.clientX, y: e.clientY };
  tocco = { x: e.clientX, y: e.clientY, t: performance.now() };
  entrata = 0;                       // chi tocca prende il comando
  velT = velF = 0;
}
function muovi(e) {
  punta = { x: e.clientX, y: e.clientY };
  if (!dita[e.pointerId]) return;
  dita[e.pointerId] = { x: e.clientX, y: e.clientY };
  var chiavi = Object.keys(dita);
  if (chiavi.length >= 2) {
    var a = dita[chiavi[0]], b = dita[chiavi[1]];
    var d = Math.hypot(a.x-b.x, a.y-b.y);
    if (pinza > 0) distMeta = limita(distMeta * (pinza / d), CFG.distMin, CFG.distMax);
    pinza = d;
    return;
  }
  if (!mano) return;
  var dx = e.clientX - mano.x, dy = e.clientY - mano.y;
  mano = { x: e.clientX, y: e.clientY };
  /* chi trascina gira la nuvola: quella davanti torna al suo posto */
  if (tocco && Math.hypot(e.clientX - tocco.x, e.clientY - tocco.y) > 6) {
    tocco = null; scelta = -1;
  }
  /* AFFERRA E TIRA, su tutti e due gli assi: la nuvola segue la mano. */
  velT = dx * CFG.senso; velF = -dy * CFG.senso;
  giroT += velT; giroF = limita(giroF + velF, CFG.faldaMin, Math.PI - CFG.faldaMin);
}
/* UN TOCCO, non un trascinamento: fermo e breve. Su una fotografia la
   porta davanti; con una gia' davanti, qualunque tocco la rimanda al posto. */
var ULTIMA = null;
function su(e) {
  if (tocco && dita[e.pointerId] && Object.keys(dita).length === 1 &&
      performance.now() - tocco.t < 450 && ULTIMA) {
    /* con una davanti: toccarla fa passare alla successiva, toccare
       fuori la rimanda al suo posto */
    if (scelta >= 0) {
      if (sullaDavanti(e.clientX, e.clientY)) sfoglia(1); else scelta = -1;
    } else {
      scelta = chiSta({ x: e.clientX, y: e.clientY }, ULTIMA.assi, ULTIMA.occhio, ULTIMA.rapporto);
    }
  }
  tocco = null;
  delete dita[e.pointerId];
  if (!Object.keys(dita).length) { mano = null; pinza = 0; }
}
/* SCORRERE FRA LE FOTOGRAFIE (30 settembre 2026): con una davanti, un
   altro tocco su di lei porta la successiva, nell'ordine di foto.json -
   moda, poi fuori, poi le sparse, e da capo. Quella che se ne va torna al
   suo posto mentre l'altra arriva. Anche le frecce, da tastiera. */
function sfoglia(dir) {
  if (scelta < 0 || !N) return;
  scelta = (scelta + dir + N) % N;
}
/* dove sta sullo schermo quella davanti: al centro, un filo in giu', grande
   quanto la fa 'davanti'. Si guarda il riquadro d'arrivo, non quello di
   adesso: durante il viaggio conta dove sta andando. */
function sullaDavanti(x, y) {
  if (scelta < 0 || !ULTIMA) return false;
  var r = ULTIMA.rapporto, l = misure[scelta*2], a = misure[scelta*2+1];
  var fx = l / r, fy = a;
  var cresce = 1 + CFG.fuocoSu;
  var hx = (fx >= fy ? CFG.davanti : CFG.davanti * fx / fy) * cresce;
  var hy = (fy >= fx ? CFG.davanti : CFG.davanti * fy / fx) * cresce;
  var nx = (x / tela.clientWidth) * 2 - 1, ny = (y / tela.clientHeight) * -2 + 1;
  return Math.abs(nx) <= hx && Math.abs(ny + CFG.davantiGiu * 2) <= hy;
}
function rotella(e) {
  e.preventDefault();
  entrata = 0;
  if (scelta >= 0) return;          // con una davanti, la nuvola sta ferma
  distMeta = limita(distMeta * Math.exp(e.deltaY * CFG.zoomPasso), CFG.distMin, CFG.distMax);
}
function limita(v, a, b) { return v < a ? a : (v > b ? b : v); }

/* La vista, e gli assi che la compongono: gli assi servono anche a sapere
   chi sta sotto il puntatore, quindi si restituiscono. */
function guarda(occhio) {
  var z = unita(occhio);                       // si guarda sempre il centro
  var x = unita(croce([0,1,0], z));
  var y = croce(z, x);
  return {
    x: x, y: y, z: z,
    m: [ x[0], y[0], z[0], 0,
         x[1], y[1], z[1], 0,
         x[2], y[2], z[2], 0,
         -per(x,occhio), -per(y,occhio), -per(z,occhio), 1 ]
  };
}

/* Chi sta sotto il puntatore. Mentre si trascina non si guarda: la mano
   sta girando la scena, e l'evidenziato che salta e' solo rumore. */
function chiGuardo(assi, occhio, rapporto) {
  if (!punta || mano || GROSSO) return -1;
  return chiSta(punta, assi, occhio, rapporto);
}
function chiSta(pt, assi, occhio, rapporto) {
  var nx = (pt.x / tela.clientWidth) * 2 - 1;
  var ny = (pt.y / tela.clientHeight) * -2 + 1;
  var t = Math.tan(CFG.fov * 0.5 * Math.PI / 180);
  var vinto = -1, davanti = -Infinity;
  for (var i = 0; i < N; i++) {
    var d = meno([centri[i*3], centri[i*3+1], centri[i*3+2]], occhio);
    var vz = per(assi.z, d);
    if (vz > -0.5 || vz <= davanti) continue;       // dietro, o gia' battuto
    var prof = -vz, k = 1 + CFG.fuocoSu * fuochi[i];
    if (Math.abs(nx * t * rapporto * prof - per(assi.x, d)) <= misure[i*2]   * k * 0.5 &&
        Math.abs(ny * t            * prof - per(assi.y, d)) <= misure[i*2+1] * k * 0.5) {
      davanti = vz; vinto = i;
    }
  }
  return vinto;
}

/* ------------------------------------------------------------------ *
 * Il giro.
 * ------------------------------------------------------------------ */
var scorso = 0, quadri = new Float32Array(0);
function passo(ora) {
  if (!acceso) return;
  var dt = Math.max(0, Math.min((ora - scorso) / 1000, 0.05)); scorso = ora;

  var l = tela.clientWidth, a = tela.clientHeight;
  var dpr = Math.min(devicePixelRatio || 1, 2);
  if (tela.width !== Math.round(l*dpr) || tela.height !== Math.round(a*dpr)) {
    tela.width = Math.round(l*dpr); tela.height = Math.round(a*dpr);
  }
  gl.viewport(0, 0, tela.width, tela.height);
  var rapporto = (l && a) ? l / a : 1;

  /* L'ARRIVO: si viene da lontano, girando, e la nuvola si assesta.
     Finito quello, comanda la mano. */
  if (entrata) {
    var u = Math.min(1, (ora - entrata) / CFG.entraDura);
    /* parte di scatto e si ferma piano, con un filo di rimbalzo in coda:
       una cosa che scoppia non decelera in modo gentile */
    var e = 1 - Math.pow(1 - u, 4);
    apertura = CFG.scoppioDa + (1 - CFG.scoppioDa) * e + 0.045 * Math.sin(Math.PI * u);
    dist = distMeta = CFG.distCasa + (CFG.entraDa - CFG.distCasa) * (1 - e);
    giroT = 0.6 + CFG.entraGiro * (1 - e);
    if (u >= 1) { entrata = 0; apertura = 1; }
  } else if (!mano) {
    /* la corsa continua e si consuma piano: e' quel che le da' peso. E
       quando si e' fermata, la nuvola gira comunque: senza quel movimento
       le distanze non si vedrebbero. */
    giroT += velT; giroF = limita(giroF + velF, CFG.faldaMin, Math.PI - CFG.faldaMin);
    velT *= CFG.frenata; velF *= CFG.frenata;
    /* da lontano gira un po' piu' svelta: la nuvola e' piccola, e allo
       stesso passo sembrerebbe ferma - fino al doppio, al fondo dello zoom */
    var lontananza = limita((dist - CFG.distCasa) / (CFG.distMax - CFG.distCasa), 0, 1);
    if (!CALMA && Math.abs(velT) < 0.0009) giroT += CFG.deriva * (1 + lontananza) * dt;
  }
  if (!entrata) dist += (distMeta - dist) * CFG.molla;
  /* LO SCOPPIO FINISCE COMUNQUE: chi scorre o trascina mentre la nuvola si
     apre prende il comando della macchina, ma le fotografie devono
     arrivare lo stesso al loro posto - prima restavano ammucchiate al
     centro per sempre */
  if (!entrata && apertura < 1) { apertura += (1 - apertura) * 0.08; if (apertura > 0.999) apertura = 1; }

  var occhio = [dist * Math.sin(giroF) * Math.cos(giroT),
                dist * Math.cos(giroF),
                dist * Math.sin(giroF) * Math.sin(giroT)];
  var assi = guarda(occhio);
  var lontano = CFG.distMax + CFG.raggio * 2;

  guardato = chiGuardo(assi, occhio, rapporto);
  if (scelta >= 0) guardato = scelta;
  ULTIMA = { assi: assi, occhio: occhio, rapporto: rapporto };
  var tan = Math.tan(CFG.fov * 0.5 * Math.PI / 180);
  var kt = 1 - Math.exp(-dt * 1000 / CFG.tiroTau);
  var ka = 1 - Math.exp(-dt * 1000 / CFG.davantiTau);

  /* il fuoco si muove piano verso la sua meta': fuocoTau e' quanto ci
     mette a farsi avanti */
  var k = 1 - Math.exp(-dt * 1000 / CFG.fuocoTau), attivo = 0;
  if (quadri.length !== N * 24) quadri = new Float32Array(N * 24);
  var px = punta && !mano && !GROSSO && scelta < 0 ? (punta.x / l) * 2 - 1 : null;
  var py = px === null ? 0 : (punta.y / a) * -2 + 1;
  for (var i = 0; i < N; i++) {
    fuochi[i] += ((i === guardato ? 1 : 0) - fuochi[i]) * k;
    if (fuochi[i] > attivo) attivo = fuochi[i];

    /* dove sta in spazio camera, con lo scoppio */
    var c = [centri[i*3] * apertura, centri[i*3+1] * apertura, centri[i*3+2] * apertura];
    var d = meno(c, occhio);
    var cx = per(assi.x, d), cy = per(assi.y, d), cz = per(assi.z, d), prof = -cz;

    /* IL TIRO: dove sarebbe il puntatore alla sua profondita', e quanto e'
       lontano dal suo centro rispetto alla sua misura */
    var tx = 0, ty = 0;
    if (px !== null && prof > 0.5) {
      var mx = px * tan * rapporto * prof - cx, my = py * tan * prof - cy;
      var raggio = Math.max(misure[i*2], misure[i*2+1]) * 0.5 * CFG.tiroRaggio;
      var dn = Math.hypot(mx, my) / raggio;
      if (dn < 1) { var f = CFG.tiro * (1 - dn); tx = mx * f; ty = my * f; }
    }
    tiri[i*2]   += (tx - tiri[i*2])   * kt;
    tiri[i*2+1] += (ty - tiri[i*2+1]) * kt;

    /* DAVANTI: il punto davanti agli occhi dove la sua misura occupa
       CFG.davanti dello schermo, sul lato che conta */
    avanti[i] += ((i === scelta ? 1 : 0) - avanti[i]) * ka;
    var sx = tiri[i*2], sy = tiri[i*2+1], sz = 0;
    if (avanti[i] > 0.001) {
      var fuori = Math.max(misure[i*2] / (2 * tan * rapporto), misure[i*2+1] / (2 * tan)) / CFG.davanti;
      var u = avanti[i] * avanti[i] * (3 - 2 * avanti[i]);
      var giuY = -CFG.davantiGiu * tan * fuori * 2;
      sx += (-cx - sx) * u; sy += (giuY - cy - sy) * u; sz = (-fuori - cz) * u;
    }
    for (var v = 0; v < 6; v++) {
      var o = (i*6 + v) * 4;
      quadri[o] = fuochi[i]; quadri[o+1] = sx; quadri[o+2] = sy; quadri[o+3] = sz;
    }
  }

  gl.useProgram(prog);
  gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'proiezione'), false,
                      new Float32Array(prospettiva(CFG.fov, rapporto, 0.5, lontano)));
  gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'vista'), false, new Float32Array(assi.m));
  /* LA FOSCHIA SEGUE LA NUVOLA: allontanandosi, si allontana anche lei,
     cosi' le fotografie diventano piccole ma non spariscono nel nero */
  var indietro = Math.max(0, dist - CFG.distCasa);
  gl.uniform1f(gl.getUniformLocation(prog, 'veloDa'), CFG.veloDa + indietro);
  gl.uniform1f(gl.getUniformLocation(prog, 'veloA'), CFG.veloA + indietro);
  gl.uniform1f(gl.getUniformLocation(prog, 'su'), CFG.fuocoSu);
  gl.uniform1f(gl.getUniformLocation(prog, 'giu'), CFG.fuocoGiu);
  gl.uniform1f(gl.getUniformLocation(prog, 'smorza'), CFG.smorza);
  gl.uniform1f(gl.getUniformLocation(prog, 'apertura'), apertura);
  gl.uniform1f(gl.getUniformLocation(prog, 'fuocoAttivo'), attivo);
  gl.uniform3f(gl.getUniformLocation(prog, 'fondo'), FONDO[0], FONDO[1], FONDO[2]);

  gl.bindBuffer(gl.ARRAY_BUFFER, mobile);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, quadri);

  var passoB = 11 * 4;
  lega('angolo', 2, passoB, 0,  statico);
  lega('centro', 3, passoB, 8,  statico);
  lega('misura', 2, passoB, 20, statico);
  lega('quadro', 4, passoB, 28, statico);
  lega('fuoco',  1, 16, 0, mobile);
  lega('sposta', 3, 16, 4, mobile);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, ATLANTE);
  gl.uniform1i(gl.getUniformLocation(prog, 'atlante'), 0);

  gl.clearColor(FONDO[0], FONDO[1], FONDO[2], 1);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform1f(gl.getUniformLocation(prog, 'usaAlta'), 0);
  gl.uniform1i(gl.getUniformLocation(prog, 'alta'), 1);
  gl.depthFunc(gl.LEQUAL);
  gl.drawArrays(gl.TRIANGLES, 0, N * 6);
  /* e sopra, la stessa in alta, se c'e' */
  var ta = scelta >= 0 ? alta(scelta) : null;
  if (ta && avanti[scelta] > 0.05) {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, ta);
    gl.uniform1f(gl.getUniformLocation(prog, 'usaAlta'), 1);
    gl.drawArrays(gl.TRIANGLES, scelta * 6, 6);
    gl.activeTexture(gl.TEXTURE0);
  }

  tela.style.cursor = guardato >= 0 ? 'pointer' : (mano ? 'grabbing' : 'grab');
  giro = requestAnimationFrame(passo);
}

/* ------------------------------------------------------------------ *
 * Accendere e spegnere.
 * ------------------------------------------------------------------ */
function accendi(dove) {
  if (acceso) return true;
  acceso = true;
  var v = ++volta;
  var chiaro = /[?&]campo=bianco\b/.test(location.search);
  FONDO = chiaro ? BIANCO : NERO;
  /* la testa del piano si veste del campo: sul buio chiara, sul bianco
     d'inchiostro, se no titolo e freccia spariscono dentro il fondo */
  if (window.PIANO && window.PIANO.veste) {
    window.PIANO.veste(chiaro ? '#F7F6F4' : '#0B0B0C', chiaro ? '#242D33' : '#F2F2F0');
  }
  tela = document.createElement('canvas');
  tela.id = 'campo';
  (dove || document.body).appendChild(tela);
  /* PRIMA LE FOTOGRAFIE, POI IL CAMPO: senza atlante non c'e' niente da
     mostrare, e una tela grigia che poi si riempie si vede. */
  porta().then(function () {
    if (!acceso || v !== volta) return;
    avvia();
  }).catch(function (e) {
    console.warn('tuffo: ' + (e && e.message ? e.message : 'non trovo le fotografie'));
  });
  return true;
}
function avvia() {
  gl = tela.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) { console.warn('tuffo: niente contesto WebGL'); return; }

  /* Un "no" muto non serve a nessuno: se qualcosa non si compila o non si
     lega, si dice CHE COSA. Sono le uniche righe che, quando servono,
     valgono mezz'ora. */
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compila(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compila(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('non si legano: ' + gl.getProgramInfoLog(prog));
    }
  } catch (e) {
    console.warn('tuffo: ' + e.message);
    return;
  }

  /* UNA VOLTA SOLA CIASCUNA: niente copie, niente ripetizioni */
  N = Math.min(CFG.quanti, FOTO.length);
  caricaAtlante();
  statico = gl.createBuffer(); mobile = gl.createBuffer();
  costruisci();

  /* si entra da fuori e si scivola dentro: tre secondi, e poi comanda la
     mano. Chi ha chiesto meno animazioni si ritrova gia' dentro. */
  giroT = 0.6; giroF = 1.15; velT = velF = 0; punta = null; mano = null; dita = {};
  dist = distMeta = CFG.distCasa;
  apertura = CALMA ? 1 : CFG.scoppioDa;
  entrata = CALMA ? 0 : performance.now();

  tela.addEventListener('pointerdown', giu);
  tela.addEventListener('pointermove', muovi);
  tela.addEventListener('pointerup', su);
  tela.addEventListener('pointercancel', su);
  tela.addEventListener('pointerleave', function () { punta = null; });
  tela.addEventListener('wheel', rotella, { passive: false });
  addEventListener('keydown', esc, true);   // in cattura: prima dell'Esc del piano, che esce

  scorso = performance.now();
  giro = requestAnimationFrame(passo);
  void tela.offsetHeight;      // vedi provini.js: niente attese sul quadro
  tela.classList.add('visibile');
}

/* Esc rimanda al suo posto quella davanti, e basta: non esce dalla stanza.
   Le frecce sfogliano. */
function esc(e) {
  if (scelta < 0) return;
  var dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (dir) { sfoglia(dir); e.preventDefault(); e.stopPropagation(); return; }
  if (e.key === 'Escape') { scelta = -1; e.stopPropagation(); }
}
function spegni() {
  if (!acceso) return;
  removeEventListener('keydown', esc, true);
  acceso = false; volta++;
  if (giro) cancelAnimationFrame(giro);
  tela.classList.remove('visibile');
  var t = tela;
  setTimeout(function () {
    /* si butta via il contesto: una tela WebGL viva che nessuno guarda
       tiene occupata la scheda video e continua a costare */
    var p = gl && gl.getExtension('WEBGL_lose_context');
    if (p) p.loseContext();
    t.remove();
  }, 700);
  gl = null;
}

/* un passo indietro (la freccia, Esc, il tasto del browser): prima si
   rimanda al suo posto quella davanti, poi si esce */
function indietro() {
  if (scelta >= 0) { scelta = -1; return true; }
  return false;
}

return {
  accendi: accendi, spegni: spegni, indietro: indietro,
  acceso: function () { return acceso; },
  /* dove si e' dentro al tunnel: serve a tarare, e a sapere dal di fuori
     se la mano sta arrivando davvero fino al campo */
  sguardo: function () { return { giroT: giroT, giroF: giroF, dist: dist, guardato: guardato, scelta: scelta }; }
};
})();
