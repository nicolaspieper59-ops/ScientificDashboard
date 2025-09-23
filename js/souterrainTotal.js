export function initSouterrainTotal({ Bus }) {
  let modeActif = false;

  function activerModeSouterrain() {
    if (modeActif) return;
    modeActif = true;
    Bus.emit('audio:play', { id: 'souterrain', vol: 0.4 });
    Bus.emit('ui:halo', { color: '#000000', gain: 1 });
    logSouterrain('Mode souterrain activé');

    // Désactivation des modules réseau
    if (window.stopSync) window.stopSync();
    if (window.stopEphemerides) window.stopEphemerides();

    // Activation des rituels d’oubli
    setInterval(() => {
      const j = JSON.parse(localStorage.getItem('journalSouterrain') || '[]');
      const oubli = Math.max(0, 100 - j.length);
      if (oubli > 80) {
        Bus.emit('audio:play', { id: 'respiration', vol: 0.3 });
        Bus.emit('ui:halo', { color: '#000000', gain: 0.6 });
        logSouterrain('Absence transformée en rituel', { oubli });
      }
    }, 5000);
  }

  function surveillerGPS() {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(pos => {
        const acc = pos.coords.accuracy;
        if (acc > 100 || pos.coords.speed === null) {
          activerModeSouterrain();
        }
      }, err => {
        activerModeSouterrain();
      }, { enableHighAccuracy: true });
    } else {
      activerModeSouterrain();
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

  surveillerGPS();
          }
      
