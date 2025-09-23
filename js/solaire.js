export function initSolaire({ Bus, config }) {
  const { latitude, longitude } = config.localisation;

  function heureSolaireLocale(date, lon) {
    const utc = date.getUTCHours() + date.getUTCMinutes() / 60;
    const correction = lon * 4 / 60; // 4 min par degré
    return (utc + correction + 24) % 24;
  }

  function détecterCycleSolaire() {
    const now = new Date();
    const hSol = heureSolaireLocale(now, longitude);
    document.getElementById('heureSolaire')?.textContent = hSol.toFixed(2);

    if (hSol >= 5.5 && hSol < 6.5) {
      Bus.emit('audio:play', { id: 'lever', vol: 0.4 });
      Bus.emit('ui:halo', { color: '#ffcc66', gain: 0.6 });
      Bus.emit('breath:start', { cycle: 6, color: '#ffcc66' });
      logSolaire('Lever solaire');
    } else if (hSol >= 12 && hSol < 13) {
      Bus.emit('audio:play', { id: 'zenith', vol: 0.5 });
      Bus.emit('ui:halo', { color: '#ffffcc', gain: 1 });
      Bus.emit('breath:start', { cycle: 8, color: '#ffffcc' });
      logSolaire('Zénith solaire');
    } else if (hSol >= 18 && hSol < 19) {
      Bus.emit('audio:play', { id: 'coucher', vol: 0.4 });
      Bus.emit('ui:halo', { color: '#ff9966', gain: 0.6 });
      Bus.emit('breath:start', { cycle: 10, color: '#ff9966' });
      logSolaire('Coucher solaire');
    }
  }

  function logSolaire(event, data = {}) {
    const row = { event, data, at: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('journalSolaire') || '[]');
    arr.push(row);
    localStorage.setItem('journalSolaire', JSON.stringify(arr));
    const el = document.createElement('div');
    el.textContent = `${row.at} — ${event}`;
    document.getElementById('log')?.prepend(el);
  }

  setInterval(détecterCycleSolaire, 60000); // vérifie chaque minute
                           }
