export function initCapteurs({ Bus, Pref }) {
  const capteurs = {
    uv: { value: null, unit: 'index', source: 'BLE' },
    co2: { value: null, unit: 'ppm', source: 'BLE' },
    humidite: { value: null, unit: '%', source: 'BLE' },
    vibration: { value: null, unit: 'Hz', source: 'BLE' },
    laser: { value: null, unit: 'mm', source: 'BLE' }
  };

  // BLE
  async function connecterBLE(serviceId, charId, key) {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Cosmo-' }],
        optionalServices: [serviceId]
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(serviceId);
      const char = await service.getCharacteristic(charId);
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', e => {
        const val = e.target.value.getUint16(0, true);
        capteurs[key].value = val;
        Bus.emit(`sensor:${key}`, { value: val, unit: capteurs[key].unit });
      });
      console.log(`Capteur ${key} connecté`);
    } catch (e) {
      console.warn(`Erreur capteur ${key}`, e);
    }
  }

  // API fallback
  async function fetchCapteursAPI() {
    try {
      const res = await fetch('/api/capteurs');
      const data = await res.json();
      for (const key in data) {
        if (capteurs[key]) {
          capteurs[key].value = data[key];
          Bus.emit(`sensor:${key}`, { value: data[key], unit: capteurs[key].unit });
        }
      }
    } catch (e) {
      console.warn('API capteurs indisponible');
    }
  }
  setInterval(fetchCapteursAPI, 10000);

  // Visualisation + Invocation
  Bus.on('sensor:uv', ({ value }) => {
    document.getElementById('meteoUV').textContent = value;
    if (value > 7) Bus.emit('ui:halo', { color: '#ffcc00', gain: 0.4 });
  });

  Bus.on('sensor:co2', ({ value }) => {
    document.getElementById('meteoAir').textContent = `${value} ppm`;
    if (value > 1000) Bus.emit('audio:play', { id: 'respiration', vol: 0.3 });
    Bus.emit('sensor:co2', { ppm: value }); // pour flux enfoui
  });

  Bus.on('sensor:humidite', ({ value }) => {
    document.getElementById('meteoHum').textContent = `${value}%`;
  });

  Bus.on('sensor:vibration', ({ value }) => {
    document.getElementById('vWave').textContent = `${value.toFixed(2)} Hz`;
    if (value > 5) logSouterrain('résonance tellurique', { value });
  });

  Bus.on('sensor:laser', ({ value }) => {
    document.getElementById('laserDistance').textContent = `${value} mm`;
  });

  // Journal souterrain
  function logSouterrain(event, data = {}) {
    const row = { event, data, at: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('journalSouterrain') || '[]');
    arr.push(row);
    localStorage.setItem('journalSouterrain', JSON.stringify(arr));
    const el = document.createElement('div');
    el.textContent = `${row.at} — ${event}`;
    document.getElementById('logSouterrain')?.prepend(el);
  }

  // Connexion manuelle (si souhaitée)
  window.connecterCapteurBLE = connecterBLE;
      }
    
