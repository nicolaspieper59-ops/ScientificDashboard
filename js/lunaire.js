export function initLunaire({ Bus, config }) {
  const { latitude, longitude } = config.localisation;

  function phaseLunaire(date) {
    const synodique = 29.53058867;
    const ref = new Date('2000-01-06T18:14:00Z'); // Nouvelle lune de référence
    const diff = (date - ref) / (1000 * 60 * 60 * 24);
    const phase = (diff % synodique + synodique) % synodique;
    return phase;
  }

  function détecterCycleLunaire() {
    const now = new Date();
    const phase = phaseLunaire(now);
    document.getElementById('phaseLunaire')?.textContent = phase.toFixed(2);

    if (phase < 1) {
      Bus.emit('audio:play', { id: 'nouvelleLune', vol: 0.4 });
      Bus.emit('ui:halo', { color: '#000000', gain: 0.6 });
      Bus.emit('breath:start', { cycle: 10, color: '#000000' });
      logLunaire('🌑 Nouvelle lune');
    } else if (phase > 14.5 && phase < 15.5) {
      Bus.emit('audio:play', { id: 'pleineLune', vol: 0.5 });
      Bus.emit('ui:halo', { color: '#ccccff', gain: 1 });
      Bus.emit('breath:start', { cycle: 6, color: '#ccccff' });
      logLunaire('🌕 Pleine lune');
    } else if (phase > 7 && phase < 8) {
      Bus.emit('audio:play', { id: 'premierQuartier', vol: 0.3 });
      Bus.emit('ui:halo', { color: '#9999ff', gain: 0.4 });
      logLunaire('🌓 Premier quartier');
    } else if (phase > 21 && phase < 22) {
      Bus.emit('audio:play', { id: 'dernierQuartier', vol: 0.3 });
      Bus.emit('ui:halo', { color: '#6666cc', gain: 0.4 });
      logLunaire('🌗 Dernier quartier');
    }
  }

  function logLunaire(event, data = {}) {
    const row = { event, data, at: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('journalLunaire') || '[]');
    arr.push(row);
    localStorage.setItem('journalLunaire', JSON.stringify(arr));
    const el = document.createElement('div');
    el.textContent = `${row.at} — ${event}`;
    document.getElementById('log')?.prepend(el);
  }

  setInterval(détecterCycleLunaire, 60000);
}
  
