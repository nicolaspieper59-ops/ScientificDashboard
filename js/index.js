// 🔁 Bus d’événements universel
const Bus = (() => {
  const map = {};
  return {
    on: (ev, fn) => (map[ev] = (map[ev] || []).concat(fn)),
    emit: (ev, data) => (map[ev] || []).forEach(fn => fn(data))
  };
})();

// 🧠 Préférences locales
const Pref = {
  get: (k, d) => {
    try { return JSON.parse(localStorage.getItem('pref:' + k)) ?? d; } catch { return d; }
  },
  set: (k, v) => localStorage.setItem('pref:' + k, JSON.stringify(v))
};

// 🌍 Configuration cosmique
const CONFIG = {
  localisation: {
    latitude: 43.4,
    longitude: 4.8,
    lieu: "Port-Saint-Louis-du-Rhône"
  },
  réseau: {
    mode: "auto",
    websocket: "wss://cockpitcosmique.net/sync"
  },
  journal: {
    max: 100,
    format: "localStorage",
    exportable: true
  }
};

// 🌌 Importation des modules
import { initCockpitCosmique } from './cosmique.js';
import { initCapteurs } from './capteurs.js';
import { initEphemerides } from './ephemerides.js';
import { initRituel } from './rituel.js';
import { initPartition } from './partition.js';
import { initPerformance } from './performance.js';
import { initSouterrainTotal } from './souterrainTotal.js';
import { initRéveil } from './réveil.js';
import { initSolaire } from './solaire.js';
import { initLunaire } from './lunaire.js';
import { initSync } from './sync.js';
import { initConstellation } from './constellation.js';
import { initChoregraphie } from './chorégraphie.js';
import { initIndicateur } from './indicateur.js';
import { initCycle } from './cycle.js';


// 🚀 Initialisation harmonique
initCockpitCosmique();
initCapteurs({ Bus, Pref });
initEphemerides(CONFIG.localisation);
initRituel({ Bus });
initPartition({ Bus });
initPerformance({ Bus });
initSouterrainTotal({ Bus });
initRéveil({ Bus });
initSolaire({ Bus, config: CONFIG });
initLunaire({ Bus, config: CONFIG });
initSync({ Bus });
initConstellation({ Bus });
initChoregraphie({ Bus });
initIndicateur({ Bus });
initCycle({ Bus, config: CONFIG });

        
