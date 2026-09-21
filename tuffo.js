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
   - IL FONDO NON E' UN TEMA: e' la pagina. Si entra dal piano e non si
     attraversa nessun buio, ne' nessun lampo. Il colore non sta scritto
     qui: si chiede alla pagina la sua variabile --fondo, e la nebbia dei
     riquadri lontani si spegne esattamente in quello. Se domani la
     penombra cambia tinta, questa stanza la segue senza saperlo.

   Per ora le fotografie non ci sono: al loro posto tinte piene. Quando
   arriveranno, cambia una cosa sola — il colore piatto diventa un prelievo
   dall'atlante, esattamente come nel tuffo.
   ========================================================================= */
window.Tuffo = (function () {
'use strict';

/* LE MANOPOLE, prese dal tuffo. Non le ho ritoccate: sono state scelte
   guardando, e cambiarle qui vorrebbe dire ricominciare quel lavoro. */
var CFG = {
  quanti:    100,    // quanti riquadri
  raggio:    70,     // il volume sferico che li contiene
  schiaccio: 0.65,   // l'asse verticale vale il 65% degli altri
  misuraMin: 4,      // il lato lungo del riquadro, minimo
  misuraMax: 11,     //                            massimo
  veloDa:    70,     // da qui comincia a sciogliersi nel fondo
  veloA:     240,    // qui e' sparito
  senso:     0.0026, // radianti per pixel trascinato
  frenata:   0.90,   // quanto resta della velocita' a ogni giro
  deriva:    0.018,  // radianti al secondo quando nessuno tocca
  molla:     0.14,   // quanto la distanza si avvicina alla meta'
  zoomPasso: 0.0016,
  fuocoSu:   0.09,   // quanto cresce quello guardato
  fuocoGiu: -0.035,  // quanto rientrano gli altri
  smorza:    0.50,   // quanto sbiadiscono verso il fondo
  fuocoTau:  130,    // ms
  distMin:   12,
  distMax:   600,
  /* SI STA DENTRO, non davanti. A 150 la nuvola stava in mezzo allo
     schermo con il vuoto intorno: si guardava un oggetto. A 60 - il volume
     ha raggio 70 - si e' dentro, i riquadri arrivano fino ai bordi e
     quelli vicini sono grandi. Si esce col rotellino, se si vuole vedere
     la forma intera. */
  distCasa:  60,     // dove si sta, guardando
  distEntra: 170,    // da dove si arriva entrando: si scende dentro
  faldaMin:  0.12,   // quanto ci si avvicina al polo prima di ribaltare
  fov:       55
};

/* LE TINTE. Le fotografie vere hanno tinte dominanti spente — terre,
   grigi, marroni — e nella penombra si spengono del tutto. Finche' sono segnaposto
   tanto vale che siano belle: rosso di casa, turchese, blu, giallo,
   rosa, viola, arancio, e un inchiostro quasi nero che tiene il ritmo — qui
   ci sta, perche' i riquadri si guardano da vicino e uno scuro fa profondita';
   negli stendardi no, e infatti li' non c'e'. */
var TINTE = ['#E4342B', '#14B3A3', '#2B54C8', '#F5B301',
             '#E86FA6', '#6B3FD4', '#F07422', '#1B1A22'];

/* I FORMATI, quelli veri degli scatti: verticali, orizzontali, quadrati. */
var FORMATI = [2/3, 3/2, 1, 4/5, 5/4, 3/4, 4/3];

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
var FONDO = [0.141, 0.176, 0.200];      // --fondo, se la pagina non lo dice

var tela, gl, prog, statico, mobile, N = CFG.quanti;
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
 'attribute vec3 tinta;  attribute float fuoco;' +
 'uniform mat4 vista; uniform mat4 proiezione;' +
 'uniform mediump float fuocoAttivo; uniform float su; uniform float giu;' +
 'varying mediump vec3 vTinta; varying mediump float vProf; varying mediump float vFuoco;' +
 'void main(){' +
 '  vec4 v = vista * vec4(centro, 1.0);' +
    /* uno avanti e gli altri indietro, scritto come una somma sola: cosi'
       e' continuo, e non c'e' un istante in cui sono avanti tutti e due */
 '  v.xy += angolo * misura * (1.0 + su * fuoco + giu * (fuocoAttivo - fuoco));' +
 '  vTinta = tinta; vFuoco = fuoco; vProf = -v.z;' +
 '  gl_Position = proiezione * v;' +
 '}';

var FRAG =
 'precision mediump float;' +
 'uniform float veloDa; uniform float veloA; uniform vec3 fondo;' +
 'uniform mediump float fuocoAttivo; uniform float smorza;' +
 'varying mediump vec3 vTinta; varying mediump float vProf; varying mediump float vFuoco;' +
 'void main(){' +
 '  float velo = smoothstep(veloDa, veloA, vProf);' +
 '  velo = velo * (1.0 - vFuoco);' +            // il guardato esce dalla foschia
 '  velo = mix(velo, 1.0, smorza * (fuocoAttivo - vFuoco));' +  // gli altri ci entrano
 '  gl_FragColor = vec4(mix(vTinta, fondo, velo), 1.0);' +
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
function dentroLaSfera() {
  /* la radice cubica, se no si affollano tutti al centro */
  var r = CFG.raggio * Math.cbrt(Math.random());
  var c = Math.random() * 2 - 1, s = Math.sqrt(1 - c*c);
  var f = Math.random() * Math.PI * 2;
  return [r*s*Math.cos(f), r*c*CFG.schiaccio, r*s*Math.sin(f)];
}
function tinta(i) {
  var h = TINTE[i % TINTE.length];
  return [parseInt(h.substr(1,2),16)/255,
          parseInt(h.substr(3,2),16)/255,
          parseInt(h.substr(5,2),16)/255];
}

function costruisci() {
  centri = new Float32Array(N * 3);
  misure = new Float32Array(N * 2);
  fuochi = new Float32Array(N);

  /* si mescola il mazzo delle tinte e si distribuisce a giro, invece di
     pescare a caso: pescando, una tinta non uscirebbe mai e un'altra sei
     volte. E' lo stesso errore che nel tuffo teneva fuori diciassette
     fotografie su trentatre. */
  var mazzo = [];
  for (var t = 0; t < TINTE.length; t++) mazzo.push(t);
  for (var i = mazzo.length - 1; i > 0; i--) {
    var j = (Math.random() * (i+1)) | 0, x = mazzo[i]; mazzo[i] = mazzo[j]; mazzo[j] = x;
  }

  var ANG = [[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,-0.5],[0.5,0.5],[-0.5,0.5]];
  var dati = new Float32Array(N * 6 * 10);
  for (i = 0; i < N; i++) {
    var p = dentroLaSfera();
    centri[i*3] = p[0]; centri[i*3+1] = p[1]; centri[i*3+2] = p[2];

    /* il lato LUNGO vale la misura e l'altro si ricava dal formato: cosi'
       un verticale e un orizzontale della stessa misura pesano uguale */
    var lato = CFG.misuraMin + Math.random() * (CFG.misuraMax - CFG.misuraMin);
    var f = FORMATI[(Math.random() * FORMATI.length) | 0];
    var l = f >= 1 ? lato : lato * f;
    var a = f >= 1 ? lato / f : lato;
    misure[i*2] = l; misure[i*2+1] = a;

    var c = tinta(mazzo[i % mazzo.length]);
    for (var v = 0; v < 6; v++) {
      var o = (i*6 + v) * 10;
      dati[o]   = ANG[v][0]; dati[o+1] = ANG[v][1];
      dati[o+2] = p[0]; dati[o+3] = p[1]; dati[o+4] = p[2];
      dati[o+5] = l;    dati[o+6] = a;
      dati[o+7] = c[0]; dati[o+8] = c[1]; dati[o+9] = c[2];
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, statico);
  gl.bufferData(gl.ARRAY_BUFFER, dati, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, mobile);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(N * 6), gl.DYNAMIC_DRAW);
}

function lega(nome, n, passo, salto, buf) {
  var l = gl.getAttribLocation(prog, nome);
  if (l < 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(l);
  gl.vertexAttribPointer(l, n, gl.FLOAT, false, passo, salto);
}

/* ------------------------------------------------------------------ *
 * Chi si guarda intorno.
 * ------------------------------------------------------------------ */
var giroT = 0.6, giroF = 0.35, velT = 0, velF = 0;
var dist = CFG.distEntra, distMeta = CFG.distCasa;
var mano = null, dita = {}, pinza = 0, punta = null, guardato = -1;
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
  /* AFFERRA E TIRA, su tutti e due gli assi. Il segno dell'orizzontale
     era l'opposto di quello della verticale: si tirava a destra e la scena
     andava a sinistra mentre in verticale seguiva la mano, e due assi che
     non vanno d'accordo si sentono subito anche senza saper dire perche'.
     giroT che sale porta la camera alla propria sinistra, cioe' la scena
     a destra: quindi a destra si somma. */
  velT = dx * CFG.senso; velF = -dy * CFG.senso;
  giroT += velT; giroF = limita(giroF + velF, CFG.faldaMin, Math.PI - CFG.faldaMin);
}
function su(e) {
  delete dita[e.pointerId];
  if (!Object.keys(dita).length) { mano = null; pinza = 0; }
}
function rotella(e) {
  e.preventDefault();
  distMeta = limita(distMeta * Math.exp(e.deltaY * CFG.zoomPasso), CFG.distMin, CFG.distMax);
}
function limita(v, a, b) { return v < a ? a : (v > b ? b : v); }

/* Chi sta sotto il puntatore. Mentre si trascina non si guarda: la mano
   sta girando la scena, e l'evidenziato che salta e' solo rumore. */
function chiGuardo(assi, occhio, rapporto) {
  if (!punta || mano || GROSSO) return -1;
  var nx = (punta.x / tela.clientWidth) * 2 - 1;
  var ny = (punta.y / tela.clientHeight) * -2 + 1;
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

  if (!mano) {
    giroT += velT; giroF = limita(giroF + velF, CFG.faldaMin, Math.PI - CFG.faldaMin);
    velT *= CFG.frenata; velF *= CFG.frenata;
    /* la deriva e' un movimento che nessuno ha chiesto: chi ha detto di
       ridurre le animazioni non la vuole, e non e' una preferenza estetica */
    if (!CALMA && Math.abs(velT) < 0.0006) giroT += CFG.deriva * dt;
  }
  dist += (distMeta - dist) * CFG.molla;

  var occhio = [dist * Math.sin(giroF) * Math.cos(giroT),
                dist * Math.cos(giroF),
                dist * Math.sin(giroF) * Math.sin(giroT)];
  var assi = guarda(occhio);
  var mvp = perMat(prospettiva(CFG.fov, rapporto, 0.5, CFG.distMax + CFG.raggio * 2), assi.m);

  guardato = chiGuardo(assi, occhio, rapporto);

  /* il fuoco si muove piano verso la sua meta': fuocoTau e' quanto ci
     mette a farsi avanti */
  var k = 1 - Math.exp(-dt * 1000 / CFG.fuocoTau), attivo = 0;
  if (quadri.length !== N * 6) quadri = new Float32Array(N * 6);
  for (var i = 0; i < N; i++) {
    fuochi[i] += ((i === guardato ? 1 : 0) - fuochi[i]) * k;
    if (fuochi[i] > attivo) attivo = fuochi[i];
    for (var v = 0; v < 6; v++) quadri[i*6 + v] = fuochi[i];
  }

  gl.useProgram(prog);
  gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'proiezione'), false,
                      new Float32Array(prospettiva(CFG.fov, rapporto, 0.5, CFG.distMax + CFG.raggio*2)));
  gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'vista'), false, new Float32Array(assi.m));
  gl.uniform1f(gl.getUniformLocation(prog, 'veloDa'), CFG.veloDa);
  gl.uniform1f(gl.getUniformLocation(prog, 'veloA'), CFG.veloA);
  gl.uniform1f(gl.getUniformLocation(prog, 'su'), CFG.fuocoSu);
  gl.uniform1f(gl.getUniformLocation(prog, 'giu'), CFG.fuocoGiu);
  gl.uniform1f(gl.getUniformLocation(prog, 'smorza'), CFG.smorza);
  gl.uniform1f(gl.getUniformLocation(prog, 'fuocoAttivo'), attivo);
  gl.uniform3f(gl.getUniformLocation(prog, 'fondo'), FONDO[0], FONDO[1], FONDO[2]);

  gl.bindBuffer(gl.ARRAY_BUFFER, mobile);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, quadri);

  var passoB = 10 * 4;
  lega('angolo', 2, passoB, 0,  statico);
  lega('centro', 3, passoB, 8,  statico);
  lega('misura', 2, passoB, 20, statico);
  lega('tinta',  3, passoB, 28, statico);
  lega('fuoco',  1, 4, 0, mobile);

  gl.clearColor(FONDO[0], FONDO[1], FONDO[2], 1);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, N * 6);

  tela.style.cursor = guardato >= 0 ? 'pointer' : (mano ? 'grabbing' : 'grab');
  giro = requestAnimationFrame(passo);
}

/* ------------------------------------------------------------------ *
 * Accendere e spegnere.
 * ------------------------------------------------------------------ */
function accendi(dove) {
  if (acceso) return true;
  FONDO = dallaPagina('--fondo', FONDO);
  tela = document.createElement('canvas');
  tela.id = 'campo';
  (dove || document.body).appendChild(tela);
  gl = tela.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) { console.warn('tuffo: niente contesto WebGL'); tela.remove(); return false; }

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
    tela.remove(); return false;
  }

  statico = gl.createBuffer(); mobile = gl.createBuffer();
  costruisci();

  /* si arriva da lontano e si scende dentro: la molla fa il resto */
  dist = CFG.distEntra; distMeta = CFG.distCasa;
  giroT = 0.6; giroF = 1.15; velT = velF = 0; punta = null; mano = null; dita = {};

  tela.addEventListener('pointerdown', giu);
  tela.addEventListener('pointermove', muovi);
  tela.addEventListener('pointerup', su);
  tela.addEventListener('pointercancel', su);
  tela.addEventListener('pointerleave', function () { punta = null; });
  tela.addEventListener('wheel', rotella, { passive: false });

  acceso = true; scorso = performance.now();
  giro = requestAnimationFrame(passo);
  void tela.offsetHeight;      // vedi provini.js: niente attese sul quadro
  tela.classList.add('visibile');
  return true;
}

function spegni() {
  if (!acceso) return;
  acceso = false;
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

return {
  accendi: accendi, spegni: spegni,
  acceso: function () { return acceso; },
  /* da dove si sta guardando: serve a tarare, e a sapere dal di fuori se
     la mano sta arrivando davvero fino al campo */
  sguardo: function () { return { giroT: giroT, giroF: giroF, dist: dist, guardato: guardato }; }
};
})();
