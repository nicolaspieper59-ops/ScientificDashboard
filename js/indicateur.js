export function initIndicateur({ Bus }) {
  const état = {
    gps: false,
    réseau: false,
    capteurs: false,
    modules: {}
  };

  const barre = document.createElement('div');
  barre.id = 'barreIndicateur';
  barre.style.position = 'fixed';
  barre.style.bottom = '0';
  barre.style.left = '0';
  barre.style.width = '100%';
  barre.style.background = '#111';
  barre.style.color = '#fff';
  barre.style.fontSize = '12px';
  barre.style.padding = '4px';
  barre.style.zIndex = '9999';
  document.body.appendChild(barre);

  function updateBarre() {
    const txt = [
      état.réseau ? '📡 Réseau OK' : '🚫 Réseau absent',
      état.gps ? '📍 GPS actif' : '❌ GPS inactif',
      état.capteurs ? '🧭 Capteurs OK' : '⚠️ Capteurs absents'
    ];
    for (const m in état.modules) {
      txt.push(état.modules[m] ? `✅ ${m}` : `❌ ${m}`);
    }
    barre.textContent = txt.join(' · ');
  }

  // 🔍 Test réseau
  setInterval(() => {
    fetch('manifest.json')
      .then(() => { état.réseau = true; updateBarre(); })
      .catch(() => { état.réseau = false; updateBarre(); });
  }, 10000);

  // 🔍 Test GPS
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => { état.gps = true; updateBarre(); },
      err => { état.gps = false; updateBarre(); },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  // 🔍 Test capteurs
  try {
    window.addEventListener('devicemotion', e => {
      état.capteurs = true;
      updateBarre();
    }, { once: true });
  } catch {
    état.capteurs = false;
    updateBarre();
  }

  // 🔍 Écoute des modules
  Bus.on('module:status', ({ nom, actif }) => {
    état.modules[nom] = actif;
    updateBarre();
  });

  updateBarre();
}
