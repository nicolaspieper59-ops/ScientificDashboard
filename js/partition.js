export function initPartition({ Bus }) {
  function jouerPartition({ tempo = 800, canvasId = 'canvasPartition' } = {}) {
    const partition = JSON.parse(localStorage.getItem('partitionPoetique') || '[]');
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width;
    canvas.height = r.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    partition.forEach((note, i) => {
      setTimeout(() => {
        // 🎶 Son
        Bus.emit('audio:play', { id: note.son.replace('.mp3',''), vol: 0.4 });

        // 🌈 Halo
        Bus.emit('ui:halo', { color: note.halo, gain: note.vibration });

        // 🌬️ Respiration
        Bus.emit('breath:start', { cycle: note.respiration, color: note.halo });

        // 📜 Journal
        logRituel(`Note ${note.note} (${note.grandeur}) jouée`, { time: note.time });

        // 🌀 Visualisation
        const x = (canvas.width / (partition.length + 1)) * (i + 1);
        const y = canvas.height / 2 + (note.note.charCodeAt(0) - 67) * 10;
        ctx.fillStyle = note.halo;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(note.note, x - 4, y - 10);
      }, i * tempo);
    });
  }

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

  function logRituel(event, data = {}) {
    const row = { event, data, at: new Date().toISOString() };
    const arr = JSON.parse(localStorage.getItem('journalRituel') || '[]');
    arr.push(row);
    localStorage.setItem('journalRituel', JSON.stringify(arr));
    const el = document.createElement('div');
    el.textContent = `${row.at} — ${event}`;
    document.getElementById('log')?.prepend(el);
  }

  window.jouerPartition = jouerPartition;
  window.visualiserPartition = visualiserPartition;
          }
          
