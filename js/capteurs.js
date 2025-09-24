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

  // 🌀 Vitesse intérieure inertielle
  let dernièreVitesse = 0;
  let vitesseMax = 0;
  let distanceTotale = 0;
  let dernièreHeure = Date.now();

  window.addEventListener('devicemotion', e => {
    const ax = e.acceleration.x ?? 0;
    const ay = e.acceleration.y ?? 0;
    const az = e.acceleration.z ?? 0;
    const inertie = Math.sqrt(ax * ax + ay * ay + az * az);

    Bus.emit('capteurs:inertie', inertie);
    const el = document.getElementById('vitesseInterieure');
    if (el) el.textContent = inertie.toFixed(2) + ' m/s²';

    const maintenant = Date.now();
    const dt = (maintenant - dernièreHeure) / 1000;
    dernièreHeure = maintenant;

    const vitesse = inertie * dt;
    const vitesseKmH = vitesse * 3.6;
    dernièreVitesse = vitesseKmH;
    if (vitesseKmH > vitesseMax) vitesseMax = vitesseKmH;
    distanceTotale += vitesse * dt;

    Bus.emit('capteurs:vitesse', {
      instantanée: vitesseKmH,
      max: vitesseMax,
      distance: distanceTotale,
      durée: maintenant
    });

    const vi = document.getElementById('vitesseInstantanee');
    const vm = document.getElementById('vitesseMax');
    const vd = document.getElementById('distanceTotale');

    if (vi) vi.textContent = vitesseKmH.toFixed(4) + ' km/h';
    if (vm) vm.textContent = vitesseMax.toFixed(4) + ' km/h';
    if (vd) vd.textContent = distanceTotale.toFixed(4) + ' m';
  });

  Bus.on('capteurs:resetMax', () => {
    vitesseMax = 0;
    const vm = document.getElementById('vitesseMax');
    if (vm) vm.textContent = '0.0000 km/h';
  });

  // 📜 Journal souterrain
  function logSouterrain(event, data = {}) {
    const row = { event, data, at: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('journalSouterrain') || '[]');
    arr.push(row);
    localStorage.setItem('journalSouterrain', JSON.stringify(arr));
    const el = document.createElement('div');
    el.textContent = `${row.at} — ${event}`;
    document.getElementById('logSouterrain')?.prepend(el);
  }

  // 🔌 Connexion manuelle
  window.connecterCapteurBLE = connecterBLE;
                        }
Bus.on('capteurs:luminosité', ({ value }) => {
  document.getElementById('luminosité').textContent = `${value} lux`;
});

Bus.on('capteurs:son', ({ db, hz }) => {
  document.getElementById('niveauSon').textContent = `${db} dB`;
  document.getElementById('frequenceSon').textContent = `${hz} Hz`;
});

Bus.on('capteurs:niveauBulle', ({ angle }) => {
  document.getElementById('niveauBulle').textContent = `${angle.toFixed(1)}°`;
});

Bus.on('capteurs:boussole', ({ orientation, lune }) => {
  document.getElementById('orientation').textContent = `${orientation}°`;
  document.getElementById('luneDirection').textContent = lune;
});

Bus.on('capteurs:vitesse', ({ instantanée }) => {
  const c = 299792.458; // km/s
  const v = instantanée / 3600; // km/s
  const pourcentLumière = (v / c) * 100;
  const pourcentSon = (v / 0.343) * 100;
  const distanceSL = v * 1; // en secondes-lumière
  const distanceAL = v * 31557600 / c; // en années-lumière
  const distanceUA = v * 3600 / 149597870.7; // en UA

  document.getElementById('vitesseActuelle').textContent = `${instantanée.toFixed(4)} km/h`;
  document.getElementById('pourcentLumière').textContent = `${pourcentLumière.toFixed(8)}%`;
  document.getElementById('pourcentSon').textContent = `${pourcentSon.toFixed(2)}%`;
  document.getElementById('distanceSL').textContent = `${distanceSL.toFixed(6)} s·c`;
  document.getElementById('distanceAL').textContent = `${distanceAL.toExponential(3)} a·l`;
  document.getElementById('distanceUA').textContent = `${distanceUA.toExponential(3)} UA`;
});
       
                          
