export function initRituel({ Bus }) {
  // 📜 Rejouer le journal souterrain
  function rejouerJournalSouterrain() {
    const arr = JSON.parse(localStorage.getItem('journalSouterrain') || '[]');
    arr.forEach((row, i) => {
      setTimeout(() => {
        Bus.emit('ui:halo', { color: '#331100', gain: 0.2 });
        Bus.emit('audio:play', { id: 'souterrain', vol: 0.3 });
        logRituel(`Rejoué : ${row.event}`, row.data);
      }, i * 800);
    });
  }

  // 🌌 Transformer les absences en partition poétique
  function transformerAbsences() {
    const arr = JSON.parse(localStorage.getItem('journalSouterrain') || '[]');
    const absences = arr.filter(e => e.event.includes('absence'));
    const partition = absences.map((e, i) => ({
      note: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][i % 7],
      time: new Date(e.at).toISOString(),
      halo: i % 2 === 0 ? '#000000' : '#552200',
      grandeur: 'absence',
      son: 'respiration.mp3',
      respiration: 10 + i % 5,
      vibration: 0.2 + (i % 3) * 0.1
    }));
    localStorage.setItem('partitionPoetique', JSON.stringify(partition));
    logRituel('Absences transformées en partition', { total: partition.length });
  }

  // 🌀 Visualiser la partition
  function visualiserPartition(canvasId = 'canvasPartition') {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width;
    canvas.height = r.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const partition = JSON.parse(localStorage.getItem('partitionPoetique') || '[]');
    const spacing = canvas.width / (partition.length + 1);
    partition.forEach((note, i) => {
      const x = spacing * (i + 1);
      const y = canvas.height / 2 + (note.note.charCodeAt(0) - 67) * 10;
      ctx.fillStyle = note.halo;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(note.note, x - 4, y - 10);
    });
  }

  // 📤 Exporter le journal rituel
  function exporterRituel() {
    const j = localStorage.getItem('journalRituel') || '[]';
    const blob = new Blob([j], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'journal-rituel.json';
    a.click();
  }

  // 📜 Journal rituel
  function logRituel(event, data = {}) {
    const row = { event, data, at: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('journalRituel') || '[]');
    arr.push(row);
    localStorage.setItem('journalRituel', JSON.stringify(arr));
    const el = document.createElement('div');
    el.textContent = `${row.at} — ${event}`;
    document.getElementById('log')?.prepend(el);
  }

  // 🌐 Expose
  window.rejouerJournalSouterrain = rejouerJournalSouterrain;
  window.transformerAbsences = transformerAbsences;
  window.visualiserPartition = visualiserPartition;
  window.exporterRituel = exporterRituel;
        }
