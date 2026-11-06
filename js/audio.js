// =====================================================================
// Sound: 8-bit music + sound effects generated in code (no files needed),
// plus the voiceover (MP3s, or the browser's voice as a stand-in).
// =====================================================================
(function () {
  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let musicOn = true, voiceOn = true;
  let musicTimer = null, currentSong = null;
  const MUSIC_VOL = 0.34, MUSIC_DUCKED = 0.12;
  function duck(on) {
    if (!ctx || !musicGain) return;
    const t = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setValueAtTime(musicGain.gain.value, t);
    musicGain.gain.linearRampToValueAtTime(on ? MUSIC_DUCKED : MUSIC_VOL, t + 0.25);
  }

  function init() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    // iPhone: keep playing even when the silent switch is on (Safari 17+)
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = MUSIC_VOL; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
  }

  // phones pause sound when you switch apps or lock the screen: wake it up again
  const wake = () => { if (ctx && ctx.state !== "running") ctx.resume().catch(() => {}); };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });
  window.addEventListener("pointerdown", wake, true);

  function tone(freq, start, dur, type, gainNode, vol, slideTo) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(vol || 0.5, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(gainNode || sfxGain);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function noise(start, dur, vol) {
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buf; g.gain.value = vol || 0.3;
    src.connect(g); g.connect(sfxGain); src.start(start);
  }

  const N = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

  const SFX = {
    blip() { const t = ctx.currentTime; tone(880, t, 0.06, "square", sfxGain, 0.3); },
    select() { const t = ctx.currentTime; tone(660, t, 0.07, "square"); tone(990, t + 0.07, 0.1, "square"); },
    boing() { const t = ctx.currentTime; tone(220, t, 0.25, "square", sfxGain, 0.4, 660); },
    jump() { const t = ctx.currentTime; tone(330, t, 0.15, "square", sfxGain, 0.3, 880); },
    step() { const t = ctx.currentTime; noise(t, 0.03, 0.08); },
    clonk() { const t = ctx.currentTime; tone(140, t, 0.18, "triangle", sfxGain, 0.8, 60); noise(t, 0.12, 0.35); },
    coin() { const t = ctx.currentTime; tone(988, t, 0.08, "square"); tone(1319, t + 0.08, 0.3, "square"); },
    door() { const t = ctx.currentTime; noise(t, 0.35, 0.25); tone(200, t, 0.3, "triangle", sfxGain, 0.3, 400); },
    whoosh() { const t = ctx.currentTime; noise(t, 0.25, 0.3); tone(600, t, 0.25, "sine", sfxGain, 0.2, 1500); },
    ding() { const t = ctx.currentTime; tone(1568, t, 0.4, "triangle", sfxGain, 0.5); },
    poof() { const t = ctx.currentTime; noise(t, 0.12, 0.2); tone(1200, t, 0.1, "sine", sfxGain, 0.15, 2400); },
    type() { const t = ctx.currentTime; tone(1200 + Math.random() * 200, t, 0.02, "square", sfxGain, 0.06); },
    cleared() {
      const t = ctx.currentTime;
      [72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.09, 0.15, "square", sfxGain, 0.35));
      tone(N(88), t + 0.36, 0.5, "square", sfxGain, 0.35);
    },
    fanfare() {
      const t = ctx.currentTime;
      const seq = [[67, 0], [67, .12], [67, .24], [72, .36], [76, .72], [74, .96], [76, 1.08], [79, 1.2]];
      seq.forEach(([n, d]) => tone(N(n), t + d, n === 79 ? 0.9 : 0.25, "square", sfxGain, 0.35));
      [48, 55, 60].forEach((n) => tone(N(n), t + 1.2, 0.9, "triangle", sfxGain, 0.4));
    },
  };

  // ---- Music: tiny step sequencer. Each song = tempo + bars of [lead, bass] ----
  const SONGS = {
    title: { bpm: 112, lead: [76, 0, 79, 0, 81, 79, 76, 0, 74, 0, 76, 0, 72, 0, 0, 0, 76, 0, 79, 0, 84, 83, 81, 0, 79, 0, 81, 79, 76, 0, 0, 0],
      bass: [48, 0, 48, 0, 55, 0, 55, 0, 53, 0, 53, 0, 55, 0, 55, 0, 48, 0, 48, 0, 57, 0, 57, 0, 53, 0, 55, 0, 48, 0, 0, 0] },
    calm: { bpm: 84, lead: [76, 0, 0, 79, 0, 0, 74, 0, 72, 0, 0, 0, 69, 0, 71, 0, 72, 0, 0, 76, 0, 0, 79, 0, 77, 0, 76, 0, 74, 0, 0, 0],
      bass: [45, 0, 0, 0, 52, 0, 0, 0, 41, 0, 0, 0, 48, 0, 0, 0, 43, 0, 0, 0, 50, 0, 0, 0, 45, 0, 0, 0, 52, 0, 0, 0] },
    upbeat: { bpm: 128, lead: [72, 74, 76, 0, 79, 0, 76, 0, 77, 76, 74, 0, 72, 0, 0, 0, 74, 76, 77, 0, 81, 0, 79, 0, 77, 76, 74, 0, 76, 0, 0, 0],
      bass: [48, 0, 48, 55, 48, 0, 48, 55, 53, 0, 53, 60, 53, 0, 53, 60, 50, 0, 50, 57, 50, 0, 50, 57, 55, 0, 55, 62, 55, 0, 55, 0] },
    explore: { bpm: 100, lead: [72, 0, 76, 79, 0, 76, 74, 0, 72, 0, 69, 0, 71, 0, 0, 0, 72, 0, 76, 79, 0, 81, 79, 0, 77, 0, 76, 0, 74, 0, 0, 0],
      bass: [48, 0, 55, 0, 48, 0, 55, 0, 45, 0, 52, 0, 43, 0, 50, 0, 41, 0, 48, 0, 41, 0, 48, 0, 43, 0, 50, 0, 43, 0, 50, 0] },
  };
  function playMusic(name) {
    if (name && name === currentSong && musicTimer) return;
    currentSong = name;
    stopMusicLoop();
    if (!ctx || !musicOn || !name) return;
    const song = SONGS[name];
    const step = 60 / song.bpm / 2;
    let i = 0, next = ctx.currentTime + 0.05;
    musicTimer = setInterval(() => {
      while (next < ctx.currentTime + 0.2) {
        const l = song.lead[i % song.lead.length], b = song.bass[i % song.bass.length];
        if (l) tone(N(l), next, step * 0.9, "square", musicGain, 0.35);
        if (b) tone(N(b), next, step * 1.8, "triangle", musicGain, 0.6);
        if (i % 4 === 2) noiseHat(next);
        i++; next += step;
      }
    }, 50);
  }
  function noiseHat(t) {
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * 0.03);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / len);
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; g.gain.value = 0.12; s.connect(g); g.connect(musicGain); s.start(t);
  }
  function stopMusicLoop() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }

  // ---- Voiceover ----
  let voAudio = null, voToken = 0;
  let lang = { code: "en", speech: "en-GB", text: (n) => (window.VO || {})[n] };
  const missing = new Set();
  function pickVoice() {
    if (!("speechSynthesis" in window)) return null;
    const vs = speechSynthesis.getVoices();
    const full = lang.speech.toLowerCase(), base = full.split("-")[0];
    const same = vs.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(base));
    return same.find((v) => v.lang.toLowerCase().replace("_", "-") === full && /male|daniel|arthur|george|ryan|oliver|thomas|jorge|kyoko|otoya/i.test(v.name))
      || same.find((v) => v.lang.toLowerCase().replace("_", "-") === full) || same[0] || null;
  }
  function stopVoice() {
    voToken++;
    duck(false);
    if (voAudio) { voAudio.pause(); voAudio = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
  // Resolves when the line finishes (or immediately if voice is off).
  // Uses audio/vo/<lang>/vo_XX.mp3; if that file is missing, the browser's own
  // voice for that language reads the line (silent if the device has none).
  function speak(num) {
    stopVoice();
    if (!voiceOn || !num) return Promise.resolve();
    duck(true);
    return speakInner(num).then((v) => { duck(false); return v; });
  }
  function speakInner(num) {
    const token = voToken;
    const key = lang.code + num;
    const tts = () => new Promise((res) => {
      if (!CONFIG.TTS_FALLBACK || !("speechSynthesis" in window)) return res();
      const v = pickVoice();
      if (!v) return res();
      const u = new SpeechSynthesisUtterance(lang.text(num));
      u.voice = v; u.lang = lang.speech; u.rate = 1.05; u.pitch = 0.95;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      setTimeout(res, 15000);
    });
    if (missing.has(key)) return tts();
    return new Promise((res) => {
      const a = new Audio(CONFIG.VO_PATH + lang.code + "/vo_" + String(num).padStart(2, "0") + ".mp3");
      voAudio = a;
      const fail = () => { missing.add(key); if (token === voToken) tts().then(res); else res(); };
      a.onended = () => res();
      a.onerror = fail;
      a.play().catch(fail);
    });
  }

  window.Sound = {
    init,
    sfx(name) { try { if (ctx && SFX[name]) SFX[name](); } catch (e) {} },
    music: playMusic,
    speak, stopVoice,
    setLanguage(code, speech, text) { lang = { code, speech, text }; },
    get musicOn() { return musicOn; },
    get voiceOn() { return voiceOn; },
    toggleMusic() { musicOn = !musicOn; if (musicOn) playMusic(currentSong); else stopMusicLoop(); return musicOn; },
    toggleVoice() { voiceOn = !voiceOn; if (!voiceOn) stopVoice(); return voiceOn; },
  };
  if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = () => {};
})();
