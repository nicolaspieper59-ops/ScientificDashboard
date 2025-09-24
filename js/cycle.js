export function initCycle({ Bus, config }) {
  const { localisation, solaire, lunaire } = config;

  function heureSolaireLocale(date, lon) {
    const utc = date.getUTCHours() + date.getUTCMinutes() / 60;
    const correction = lon * 4 / 60;
    return (utc + correction + 24) % 24;
  }

  function phaseLunaire(date) {
    const synodique = 29.53058867;
    const ref = new Date('2000-01-06T18:14:00Z');
    const diff = (date - ref) / (1000 * 60 * 60 * 24);
    return (diff % synodique + synodique) % synodique;
  }

  function détecterCycle() {
    const now = new Date();
    const hSol = heureSolaireLocale(now, localisation.longitude);
    const phase = phaseLunaire(now);

    // ☀️ Cycle solaire
    if (hSol >= solaire.seuilLever && hSol < solaire.seuilLever + 1) {
      Bus.emit('rituel:soleil', { type: 'lever', halo: solaire.halo.lever, souffle: solaire.souffle.lever });
    } else if (hSol >= solaire.seuilZenith && hSol < solaire.seuilZenith + 1) {
      Bus.emit('rituel:soleil', { type: 'zenith', halo: solaire.halo.zenith, souffle: solaire.souffle.zenith });
    } else if (hSol >= solaire.seuilCoucher && hSol < solaire.seuilCoucher + 1) {
      Bus.emit('rituel:soleil', { type: 'coucher', halo: solaire.halo.coucher, souffle: solaire.souffle.coucher });
    }

    // 🌙 Cycle lunaire
    if (phase < lunaire.seuilNouvelle) {
      Bus.emit('rituel:lune', { type: 'nouvelle', halo: lunaire.halo.nouvelle, souffle: lunaire.souffle.nouvelle });
    } else if (phase > lunaire.seuilPleine - 1 && phase < lunaire.seuilPleine + 1) {
      Bus.emit('rituel:lune', { type: 'pleine', halo: lunaire.halo.pleine, souffle: lunaire.souffle.pleine });
    }

    // 🌋 Souterrain
    if (!navigator.onLine || !('geolocation' in navigator)) {
      Bus.emit('mode:souterrain');
    }

    // 🎭 Performance
    if (phase > 7 && phase < 8 && hSol > 20) {
      Bus.emit('performance:start', { mode: 'nocturne' });
    }
  }

  setInterval(détecterCycle, 60000);
                                    }
                               
