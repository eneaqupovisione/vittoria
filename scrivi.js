/* =========================================================================
   SCRIVERE A MANO — comporre parole con l'alfabeto di Vittoria.
   -------------------------------------------------------------------------
   alfabeto.json ha, per ogni lettera, il suo tracciato e tre misure: quanto
   e' larga, quanto sale sopra la linea di base e quanto scende sotto. Le fa
   costruisci-alfabeto.py dalla fotografia del foglio.

   Comporre e' mettere i tracciati in fila sulla stessa linea di base. La
   linea di base non e' un dettaglio: senza, la "g" e la "p" starebbero
   appoggiate come la "o" invece di scendere, e si vedrebbe che e' una
   macchina a scrivere e non una mano.

   Le lettere restano quelle disegnate: non si stirano, non si raddrizzano.
   Chi scrive due volte la stessa parola ottiene lo stesso segno - e' un
   alfabeto, non una calligrafia viva - ma il disegno e' suo.
   ========================================================================= */
window.Scritta = (function () {
'use strict';

var LETTERE = null, coda = [], chiesto = false;

function carica() {
  chiesto = true;
  fetch('alfabeto.json' + (window.MARCA || ''))
    .then(function (r) { return r.json(); })
    .then(function (d) {
      LETTERE = d.lettere;
      coda.forEach(function (f) { f(); }); coda = [];
    })
    .catch(function () { console.warn('scritta: non trovo alfabeto.json'); });
}

/* Chiama f quando l'alfabeto e' arrivato (subito, se c'e' gia'). */
function pronta(f) {
  if (LETTERE) { f(); return; }
  coda.push(f);
  if (!chiesto) carica();
}

/* Compone il testo e restituisce un <svg> gia' fatto, con la sua
   proporzione. Il colore lo mette chi lo appende, con currentColor. */
function fai(testo, opz) {
  if (!LETTERE) return null;
  opz = opz || {};
  var tra = opz.tra === undefined ? 16 : opz.tra;      // fra una lettera e l'altra
  var spazio = opz.spazio === undefined ? 46 : opz.spazio;
  var x = 0, su = 0, giu = 0, dentro = '';

  for (var i = 0; i < testo.length; i++) {
    var c = testo[i];
    if (c === ' ') { x += spazio; continue; }
    var g = LETTERE[c];
    /* una lettera che non c'e' - un numero, un accento - lascia il suo
       spazio invece di sparire: si vede che manca, e si sa che va disegnata */
    if (!g) { x += spazio; continue; }
    dentro += '<g transform="translate(' + x.toFixed(1) + ',' + (-g.su).toFixed(1) + ')">' +
              '<path d="' + g.d + '"/></g>';
    if (g.su > su) su = g.su;
    if (g.giu > giu) giu = g.giu;
    x += g.l + tra;
  }
  var largo = Math.max(1, x - tra), alto = Math.max(1, su + giu);
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 ' + (-su).toFixed(1) + ' ' + largo.toFixed(1) + ' ' + alto.toFixed(1));
  svg.setAttribute('fill', 'currentColor');
  svg.innerHTML = dentro;
  svg.prop = largo / alto;
  return svg;
}

return { pronta: pronta, fai: fai, c: function () { return !!LETTERE; } };
})();
