export function initSouterrain({ Bus }) {
  let last = null;
  let oubli = 0;

  function updateVitesse(position) {
    const now = Date.now();
    const coords = position.coords;
    const speed = coords.speed ?? 0;
    const corr = Math.abs(speed * 3.6); // km/h
    document.getElementById('vSub')?.textContent = corr.toFixed(1);

    if (last) {
      const dt = (now - last.time) / 1000;
      const dx = Math.sqrt(
        Math.pow(coords.latitude - last.lat, 2) +
        Math.pow(coords.longitude - last.lon, 2)
      );
      const flux = dx / dt;
      document.getElementById('vFlux')?.textContent = (flux * 1000).toFixed(2);
    }

    last = { lat: coords.latitude, lon: coords.longitude, time: now };

    // Tunnel détecté : précision faible ou vitesse persistante
    if (coords.accuracy > 100 || speed === null) {
      Bus.emit('audio:play', { id: 'souterrain', vol: 0.3 });
      Bus.emit('ui:halo', { color: '#000000', gain: 0.5 });
      logSouterrain('Tunnel détecté — vitesse persistante', { speed: corr });
    }
  }

  function updateOubli() {
    const j = JSON.parse(localStorage.getItem('journalSouterrain') || '[]');
    const max = 100;
    oubli = Math.max(0, 100 - (j.length / max) * 100);
    document.getElementById('vMemoire')?.textContent = oubli.toFixed(0);

    if (oubli > 80) {
      Bus.emit('audio:play', { id: 'respiration', vol: 0.3 });
      Bus.emit('ui:halo', { color: '#000000', gain: 0.6 });
      logSouterrain('Absence transformée en rituel', { oubli });
    }
  }

  function logSouterrain(event, data = {}) {
    const row = { event, data, at: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('journalSouterrain') || '[]');
    arr.push(row);
    localStorage.setItem('journalSouterrain', JSON.stringify(arr));
    const el = document.createElement('div');
    el.textContent = `${row.at} — ${event}`;
    document.getElementById('logSouterrain')?.prepend(el);
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(updateVitesse, err => console.warn('GPS error', err), {
      enableHighAccuracy: true
    });
  }

  setInterval(updateOubli, 5000);
}
