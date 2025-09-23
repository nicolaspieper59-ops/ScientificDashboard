export function initRéveil({ Bus }) {
  let réveillé = false;

  function activerRéveil() {
    if (réveillé) return;
    réveillé = true;

    // 🌅 Rituel de renaissance
    Bus.emit('audio:play', { id: 'lune', vol: 0.5 });
    Bus.emit('ui:halo', { color: '#ccccff', gain: 1 });
    Bus.emit('breath:start', { cycle: 12, color: '#ccccff' });
    logRéveil('Connexion céleste retrouvée');

    // 🔁 Réactivation des modules célestes
    if (window.initSync) window.initSync({ Bus });
    if (window.initEphemerides) window.initEphemerides({ lat: 43.6, lon: 1.44 });
  }

  function surveillerConnexion() {
    setInterval(() => {
      fetch('manifest.json')
        .then(() => activerRéveil())
        .catch(() => {});
    }, 5000);
  }

  function logRéveil(event, data = {}) {
    const row = { event, data, at: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('journalRéveil') || '[]');
    arr.push(row);
    localStorage.setItem('journalRéveil', JSON.stringify(arr));
    const el = document.createElement('div');
    el.textContent = `${row.at} — ${event}`;
    document.getElementById('log')?.prepend(el);
  }

  surveillerConnexion();
}
