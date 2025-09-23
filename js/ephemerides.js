export async function initEphemerides({ lat = 43.6, lon = 1.44 }) {
  try {
    const res = await fetch(`https://api.cockpitcosmique.net/ephemerides?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    // ☀️ Soleil
    document.getElementById('culSol')?.textContent = data.soleil.culmination;
    document.getElementById('solVraie')?.textContent = data.soleil.heureVraie;
    document.getElementById('solMoy')?.textContent = data.soleil.heureMoyenne;
    document.getElementById('eqTemps')?.textContent = data.soleil.equationTemps;

    // 🌙 Lune
    document.getElementById('lunePhase')?.textContent = `${data.lune.phase}%`;
    document.getElementById('luneLever')?.textContent = data.lune.lever;
    document.getElementById('luneCoucher')?.textContent = data.lune.coucher;
    document.getElementById('luneCul')?.textContent = data.lune.culmination;

    // 🌊 Marées
    document.getElementById('mareeHauteur')?.textContent = `${data.maree.hauteur} m`;
    document.getElementById('mareeType')?.textContent = data.maree.type;
    document.getElementById('mareeFlux')?.textContent = data.maree.flux;
    document.getElementById('mareeCoef')?.textContent = data.maree.coef;

    // 🎶 Invocation cosmique
    if (data.lune.phase > 95) {
      Bus.emit('ui:halo', { color: '#ccccff', gain: 0.3 });
      Bus.emit('audio:play', { id: 'lune', vol: 0.4 });
      logRituel('Lune pleine détectée', { phase: data.lune.phase });
    }

    if (data.maree.coef > 100) {
      Bus.emit('audio:play', { id: 'maree', vol: 0.3 });
      logRituel('Grande marée détectée', { coef: data.maree.coef });
    }

  } catch (e) {
    console.warn('Éphémérides indisponibles', e);
  }
}

// 📜 Journal rituel
function logRituel(event, data = {}) {
  const row = { event, data, at: new Date().toISOString() };
  const arr = JSON.parse(localStorage.getItem('journalRituel') || '[]');
  arr.push(row);
  localStorage.setItem('journalRituel', JSON.stringify(arr));
  const el = document.createElement('div');
  el.textContent = `${row.at} — ${event}`;
  document.getElementById('log')?.prepend(el);
      }
               
