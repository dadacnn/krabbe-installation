const audio = document.getElementById('audio');
    const btn = document.getElementById('playBtn');
    const status = document.getElementById('status');
    const viz = document.getElementById('viz');

    // Build visualizer bars
    const barCount = 32;
    const bars = [];
    for (let i = 0; i < barCount; i++) {
      const b = document.createElement('div');
      b.className = 'bar';
      const h = 8 + Math.sin(i / barCount * Math.PI) * 44 + Math.random() * 10;
      b.style.setProperty('--h', h + 'px');
      viz.appendChild(b);
      bars.push(b);
    }

    let animFrame;
    let isPlaying = false;

    // Web Audio for real visualizer (if available)
    let analyser, dataArray, source;

    function setupAnalyser() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch(e) {
        analyser = null;
      }
    }

    function animateBars() {
      if (!isPlaying) return;
      animFrame = requestAnimationFrame(animateBars);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        bars.forEach((b, i) => {
          const val = dataArray[Math.floor(i * dataArray.length / barCount)] / 255;
          const h = 4 + val * 52;
          b.style.height = h + 'px';
        });
      } else {
        // Fake animation
        const t = Date.now() / 400;
        bars.forEach((b, i) => {
          const h = 4 + Math.abs(Math.sin(t + i * 0.4)) * 50;
          b.style.height = h + 'px';
        });
      }
    }

    function togglePlay() {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        btn.classList.remove('playing');
        status.textContent = 'PAUSED';
        status.classList.remove('on');
        bars.forEach(b => { b.classList.remove('active'); b.style.height = '4px'; });
        cancelAnimationFrame(animFrame);
      } else {
        if (!analyser) setupAnalyser();
        audio.play().then(() => {
          isPlaying = true;
          btn.classList.add('playing');
          status.textContent = 'NOW PLAYING — LOOP';
          status.classList.add('on');
          bars.forEach(b => b.classList.add('active'));
          animateBars();
        }).catch(e => {
          status.textContent = 'PLAYBACK ERROR';
        });
      }
    }

    // Auto-play attempt on load
    window.addEventListener('load', () => {
      audio.play().then(() => {
        if (!analyser) setupAnalyser();
        isPlaying = true;
        btn.classList.add('playing');
        status.textContent = 'NOW PLAYING — LOOP';
        status.classList.add('on');
        bars.forEach(b => b.classList.add('active'));
        animateBars();
      }).catch(() => {
        // Blocked by browser — user must tap
      });
    });