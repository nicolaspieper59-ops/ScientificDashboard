export function initCockpitCosmique() {
  // Vitesse souterraine (corrigée)
  if ('geolocation' in navigator) {
    let last = null;
    navigator.geolocation.watchPosition(pos => {
      const now = Date.now();
      const coords = pos.coords;
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
    }, err => console.warn('GPS error', err), { enableHighAccuracy: true });
  }

  // Halo visuel
  const halo = document.createElement('div');
  halo.style.position = 'fixed';
  halo.style.top = 0;
  halo.style.left = 0;
  halo.style.width = '100vw';
  halo.style.height = '100vh';
  halo.style.pointerEvents = 'none';
  halo.style.transition = 'background 1s ease-out';
  document.body.appendChild(halo);

  window.Bus = window.Bus || { on: () => {}, emit: () => {} };
  Bus.on('ui:halo', ({ color, gain }) => {
    halo.style.background = `${color}33`;
    setTimeout(() => { halo.style.background = 'transparent'; }, gain * 1000);
  });

  // Audio
  Bus.on('audio:play', ({ id, vol = 0.5 }) => {
    const audio = new Audio(`sons/${id}.mp3`);
    audio.volume = vol;
    audio.play();
  });

  // Respiration cosmique
  Bus.on('breath:start', ({ cycle = 8, color = '#552200' }) => {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.borderRadius = '50%';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.background = color;
    el.style.opacity = 0.6;
    el.style.transition = `all ${cycle}s ease-in-out`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.width = '200px';
      el.style.height = '200px';
      el.style.opacity = 0;
    }, 10);
    setTimeout(() => el.remove(), cycle * 1000);
  });

  // Mémoire enfouie
  setInterval(() => {
    const j = JSON.parse(localStorage.getItem('journalSouterrain') || '[]');
    const oubli = Math.max(0, 100 - j.length);
    document.getElementById('vMemoire')?.textContent = oubli.toFixed(0);
  }, 5000);
                                               }
         
