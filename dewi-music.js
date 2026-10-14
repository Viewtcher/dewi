/**
 * dewi-music.js – Hintergrund-Loop "Holo-Aufstieg" für dewi.
 * ------------------------------------------------------------
 * Komposition & Sound: Claudio · Technik: reines Web Audio (keine Audiodateien, offline)
 *
 * Musik:   D-Moll, 112 BPM, 16 Takte (~34 s), läuft nahtlos endlos
 *          Teil A (Takt 1–8): Piano, Pad, Bass, Drums
 *          Teil B (Takt 9–16): + Melodie (Soft-Pulse, gedämpfter 8-Bit-Ton)
 *          Reels-Modul: zusätzlich Arpeggio (wird live ein-/ausgeblendet, kein Neustart)
 *
 * Öffentliche API (global: window.DewiMusic)
 *   DewiMusic.unlock(sharedCtx?)   beim ERSTEN Tippen des Nutzers aufrufen (iPhone-Audio-Regel).
 *                                  Optional einen vorhandenen AudioContext der Effekt-Sounds übergeben.
 *   DewiMusic.setEnabled(bool)     Musik an/aus (blendet weich), wird gespeichert
 *   DewiMusic.isEnabled()          -> bool (Standard: true)
 *   DewiMusic.setVolume(0..1)      Musik-Lautstärke (getrennt von Effekt-Sounds), wird gespeichert
 *   DewiMusic.getVolume()          -> 0..1 (Standard: 0.45)
 *   DewiMusic.setReelsMode(bool)   true beim Betreten des Reels-Moduls, false beim Verlassen
 *   DewiMusic.duck(seconds?)       optional: Musik kurz absenken (z. B. unter wichtigen Feedback-Sounds)
 *
 * Das Modul pausiert selbst, wenn die App in den Hintergrund geht, und läuft danach weiter.
 */
(function () {
  "use strict";

  // ---------- Einstellungen (localStorage, mit Fallback) ----------
  // Hinweis für Marlin: Falls dewi. bereits einen zentralen Einstellungs-Speicher hat,
  // load()/save() einfach darauf umbiegen.
  // Einbau in dewi. (Marlin, Okt. 2026): dewi. hat einen zentralen Speicher (state.music, state.mvol,
  // state.mtrack in music.js). Darum schreibt dieses Modul nichts mehr selbst in localStorage.
  // Schalter und Lautstärke setzt music.js bei jedem Takt über setEnabled()/setVolume().
  const KEY_ENABLED = "dewi.music.enabled";
  const KEY_VOLUME = "dewi.music.volume";
  function load(key, fallback) { return fallback; }
  function save(key, value) { /* bewusst leer: Speicher liegt in dewi.s state */ }

  let enabled = load(KEY_ENABLED, true);
  let volume = load(KEY_VOLUME, 0.45);
  let reels = false;

  // ---------- Musik-Daten (eigene Komposition) ----------
  const BPM = 112;
  const PROG = [
    { bass: 38, pad: [57, 62, 65, 69], arp: [62, 65, 69, 74] }, // Dm
    { bass: 34, pad: [58, 62, 65, 70], arp: [62, 65, 70, 74] }, // B
    { bass: 41, pad: [57, 60, 65, 69], arp: [60, 65, 69, 72] }, // F
    { bass: 36, pad: [55, 60, 64, 67], arp: [60, 64, 67, 72] }, // C
    { bass: 38, pad: [57, 62, 65, 69], arp: [62, 65, 69, 74] }, // Dm
    { bass: 34, pad: [58, 62, 65, 70], arp: [62, 65, 70, 74] }, // B
    { bass: 43, pad: [55, 62, 67, 70], arp: [62, 67, 70, 74] }, // Gm
    { bass: 45, pad: [57, 61, 64, 69], arp: [61, 64, 69, 73] }, // A (führt zurück zu Dm)
  ];
  const ARP = [0, 1, 2, 3, 1, 2, 3, 2, 0, 1, 2, 3, 1, 2, 3, 1]; // Sechzehntel
  const BASS = [0, 0, 12, 0, 0, 12, 0, 12];                      // Achtel, +12 = Oktave
  // Melodie (Hook): [Start in Sechzehnteln, MIDI-Note, Länge in Sechzehnteln] pro Takt
  const MEL = [
    [[0, 69, 4], [4, 74, 2], [6, 76, 2], [8, 77, 6], [14, 76, 2]],
    [[0, 74, 4], [4, 72, 2], [6, 74, 2], [8, 77, 8]],
    [[0, 72, 4], [4, 69, 2], [6, 72, 2], [8, 77, 4], [12, 76, 4]],
    [[0, 76, 6], [6, 74, 2], [8, 72, 8]],
    [[0, 69, 4], [4, 74, 2], [6, 76, 2], [8, 77, 4], [12, 81, 4]],
    [[0, 79, 6], [6, 77, 2], [8, 74, 8]],
    [[0, 74, 4], [4, 77, 4], [8, 79, 4], [12, 77, 4]],
    [[0, 76, 8], [8, 73, 4], [12, 69, 4]],
  ];
  const TOTAL_STEPS = 16 * 16; // 16 Takte × 16 Sechzehntel

  // Mixer-Pegel pro Spur (in der Hörprobe v3 abgestimmt)
  const LV = { arp: 0.55, piano: 0.7, pad: 0.9, bass: 0.8, drums: 0.7, mel: 0.6 };

  // ---------- Audio-Zustand ----------
  let ctx = null, master, duckGain, bus = {}, noiseBuf, delay;
  let timer = null, step = 0, nextT = 0, running = false;

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const S16 = 60 / BPM / 4; // Dauer einer Sechzehntel in Sekunden
  const masterLevel = () => volume * 0.8;

  function build(sharedCtx) {
    ctx = sharedCtx || new (window.AudioContext || window.webkitAudioContext)();

    // Kompressor hält die Lautstärke gleichmäßig
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22; comp.knee.value = 12; comp.ratio.value = 4;
    comp.attack.value = 0.01; comp.release.value = 0.25;

    duckGain = ctx.createGain(); duckGain.gain.value = 1;   // für DewiMusic.duck()
    master = ctx.createGain(); master.gain.value = 0;        // startet stumm, wird eingeblendet
    comp.connect(duckGain); duckGain.connect(master); master.connect(ctx.destination);

    for (const k in LV) { bus[k] = ctx.createGain(); bus[k].gain.value = LV[k]; bus[k].connect(comp); }
    bus.arp.gain.value = reels ? LV.arp : 0;

    // Pad pumpt im Viertel-Takt ("Sidechain"-Gefühl)
    bus.pump = ctx.createGain(); bus.pump.connect(bus.pad);

    // Echo für Arpeggio und Melodie (punktierte Achtel)
    delay = ctx.createDelay(1); delay.delayTime.value = S16 * 3;
    const fb = ctx.createGain(), wet = ctx.createGain(), dlp = ctx.createBiquadFilter();
    fb.gain.value = 0.32; wet.gain.value = 0.22; dlp.type = "lowpass"; dlp.frequency.value = 2200;
    delay.connect(dlp); dlp.connect(fb); fb.connect(delay); dlp.connect(wet); wet.connect(comp);
    bus.send = ctx.createGain(); bus.send.connect(delay);

    // Rauschen für Hi-Hat und Snare
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  // ---------- Klang-Bausteine ----------
  // Jede Hüllkurve startet bei 0 und endet bei ~0 -> kein Knacken
  function env(g, t, attack, peak, decay) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }
  function filter(type, freq, q) {
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q; return f;
  }
  function osc(type, freq, t, stopT, dest) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    o.connect(dest); o.start(t); o.stop(stopT); return o;
  }

  function arpNote(m, t) {
    const f = filter("lowpass", 2000, 1), g = ctx.createGain(), s = ctx.createGain();
    f.connect(g); g.connect(bus.arp); s.gain.value = 0.5; g.connect(s); s.connect(bus.send);
    env(g, t, 0.004, 0.07, 0.16); osc("square", mtof(m), t, t + 0.25, f);
  }
  function pianoChord(notes, t, vel) {
    notes.forEach((m) => {
      const f = filter("lowpass", 1500), g = ctx.createGain(), g2 = ctx.createGain();
      f.connect(g); g.connect(bus.piano); g2.gain.value = 0.15; g2.connect(f);
      env(g, t, 0.006, 0.05 * vel, 1.6);
      osc("triangle", mtof(m + 12), t, t + 1.8, f);
      osc("sine", mtof(m + 24), t, t + 1.8, g2);
    });
  }
  function pad(notes, t, len) {
    notes.forEach((m) => [-7, 7].forEach((det) => {
      const f = filter("lowpass", 850), g = ctx.createGain();
      f.connect(g); g.connect(bus.pump);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.014, t + 0.35);
      g.gain.setValueAtTime(0.014, t + len - 0.05);
      g.gain.linearRampToValueAtTime(0, t + len + 0.4);
      const o = osc("sawtooth", mtof(m), t, t + len + 0.45, f); o.detune.value = det;
    }));
  }
  function pump(t) {
    const p = bus.pump.gain;
    p.setValueAtTime(0.25, t); p.linearRampToValueAtTime(1, t + (60 / BPM) * 0.6);
  }
  function bassNote(m, t, len) {
    const f = filter("lowpass", 420, 2), g = ctx.createGain(), g2 = ctx.createGain();
    f.connect(g); g.connect(bus.bass); g2.gain.value = 0.25; g2.connect(f);
    env(g, t, 0.006, 0.22, len * 0.9);
    osc("triangle", mtof(m), t, t + len + 0.05, f);
    osc("square", mtof(m), t, t + len + 0.05, g2);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    o.connect(g); g.connect(bus.drums); env(g, t, 0.002, 0.42, 0.26); o.start(t); o.stop(t + 0.32);
  }
  function noise(t, type, freq, peak, decay, q) {
    const s = ctx.createBufferSource(), f = filter(type, freq, q), g = ctx.createGain();
    s.buffer = noiseBuf; s.connect(f); f.connect(g); g.connect(bus.drums);
    env(g, t, 0.002, peak, decay); s.start(t); s.stop(t + decay + 0.05);
  }
  // Melodie: Soft-Pulse (gedämpfter 8-Bit-Ton, kurz gehalten -> lenkt wenig ab)
  function melNote(m, t, len) {
    const f = filter("lowpass", 1300), g = ctx.createGain(), s = ctx.createGain();
    f.connect(g); g.connect(bus.mel); s.gain.value = 0.3; g.connect(s); s.connect(bus.send);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.01);
    g.gain.setTargetAtTime(0.028, t + 0.03, 0.1);
    g.gain.setTargetAtTime(0, t + len * 0.85, 0.04);
    osc("square", mtof(m), t, t + len + 0.3, f);
  }

  // ---------- Sequenzer ----------
  function schedule(st, t) {
    const bar = Math.floor(st / 16), s = st % 16, ch = PROG[bar % 8];
    if (reels) arpNote(ch.arp[ARP[s]], t);
    if (s % 4 === 0) { pump(t); kick(t); }
    if (s % 4 === 2) noise(t, "highpass", 7500, 0.05, 0.04);
    if (s === 4 || s === 12) noise(t, "bandpass", 1700, 0.11, 0.14, 0.8);
    if (s % 2 === 0) bassNote(ch.bass + BASS[s / 2], t, S16 * 2);
    if (s === 0) { pad(ch.pad, t, S16 * 16); pianoChord(ch.pad.slice(1), t, 1); }
    if (s === 10) pianoChord(ch.pad.slice(1), t, 0.6);
    if (bar >= 8) MEL[bar % 8].forEach(([p, m, l]) => { if (p === s) melNote(m, t, l * S16); });
  }

  // Look-ahead-Scheduler: plant 120 ms im Voraus -> sauberes Timing, nahtloser Loop
  function tick() {
    // Nach Hintergrund/Pause nicht alle verpassten Noten auf einmal nachspielen
    if (nextT < ctx.currentTime - 0.2) nextT = ctx.currentTime + 0.05;
    while (nextT < ctx.currentTime + 0.12) {
      schedule(step, nextT);
      nextT += S16;
      step = (step + 1) % TOTAL_STEPS;
    }
    timer = setTimeout(tick, 25);
  }

  function fadeTo(value, seconds) {
    const n = ctx.currentTime;
    master.gain.cancelScheduledValues(n);
    master.gain.setValueAtTime(master.gain.value, n);
    master.gain.linearRampToValueAtTime(value, n + seconds);
  }

  function start() {
    if (!ctx || running) return;
    running = true;
    if (ctx.state !== "running") ctx.resume();
    step = 0; nextT = ctx.currentTime + 0.08;
    tick();
    fadeTo(masterLevel(), 1.5); // sanftes Einblenden
  }

  function stop() {
    if (!ctx || !running) return;
    running = false;
    fadeTo(0, 0.4);
    clearTimeout(timer); timer = null;
  }

  // App in den Hintergrund -> pausieren, zurück -> weiter
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) {
      clearTimeout(timer); timer = null;
      ctx.suspend && ctx.suspend();
    } else if (running) {
      ctx.resume().then(() => { nextT = ctx.currentTime + 0.05; if (!timer) tick(); });
    }
  });

  // ---------- Öffentliche API ----------
  window.DewiMusic = {
    unlock(sharedCtx) {
      if (!ctx) build(sharedCtx);
      if (ctx.state !== "running") ctx.resume();
      if (enabled) start();
    },
    setEnabled(on) {
      enabled = !!on; save(KEY_ENABLED, enabled);
      if (!ctx) return;
      enabled ? start() : stop();
    },
    isEnabled() { return enabled; },
    setVolume(v) {
      volume = Math.min(1, Math.max(0, +v)); save(KEY_VOLUME, volume);
      if (ctx && running) fadeTo(masterLevel(), 0.15);
    },
    getVolume() { return volume; },
    setReelsMode(on) {
      reels = !!on;
      if (bus.arp) bus.arp.gain.setTargetAtTime(reels ? LV.arp : 0, ctx.currentTime, 0.3);
    },
    duck(seconds = 0.8) {
      if (!ctx) return;
      const n = ctx.currentTime, g = duckGain.gain;
      g.cancelScheduledValues(n); g.setValueAtTime(g.value, n);
      g.linearRampToValueAtTime(0.5, n + 0.05);
      g.linearRampToValueAtTime(1, n + seconds);
    },
  };
})();
