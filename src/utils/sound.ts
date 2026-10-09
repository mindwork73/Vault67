/**
 * Звуковая подсистема RobCo Pip-Boy
 * Синтезирует механические щелчки терминала, писк Pip-Boy, 
 * щелчки счетчика Гейгера и звук крышек через Web Audio API.
 */

let audioCtx: AudioContext | null = null;
let soundMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

let lastHoverTime = 0;

export const soundManager = {
  isMuted: () => soundMuted,
  setMuted: (muted: boolean) => {
    soundMuted = muted;
  },
  toggleMute: () => {
    soundMuted = !soundMuted;
    return soundMuted;
  },

  // Звук наведения на элемент (Pip-Boy hover blip)
  playHover: () => {
    if (soundMuted) return;
    const now = Date.now();
    if (now - lastHoverTime < 65) return; // троттлинг
    lastHoverTime = now;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // ignore
    }
  },

  // Механический щелчок клавиши терминала
  playClick: () => {
    if (soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before first gesture
    }
  },

  // Звук переключения вкладки в Pip-Boy (высокий электронный писк)
  playTab: () => {
    if (soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.setValueAtTime(2200, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  },

  // Звон крышек / покупка (Caps chime)
  playCaps: () => {
    if (soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const freqs = [1800, 2400, 3100];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, ctx.currentTime + idx * 0.04 + 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.15);
      });
    } catch {
      // ignore
    }
  },

  // Предупреждение / ошибка терминала
  playError: () => {
    if (soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(130, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // ignore
    }
  },

  // Щелчок счетчика Гейгера (RAD)
  playGeiger: () => {
    if (soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.01;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);

      noise.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // ignore
    }
  },

  // Фанфары Vault-Tec при активации пасхалки (Konami Code / Pre-War switch)
  playFanfare: () => {
    if (soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [
        { f: 523.25, d: 0.1 },  // C5
        { f: 659.25, d: 0.1 },  // E5
        { f: 783.99, d: 0.1 },  // G5
        { f: 1046.50, d: 0.3 }  // C6
      ];

      let t = ctx.currentTime;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + note.d);

        t += note.d * 0.9;
      });
    } catch {
      // ignore
    }
  },

  // Звук радара/эхолокатора Pip-Boy (Radar Ping)
  playPing: () => {
    if (soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // ignore
    }
  },

  // Звук включения автомата Nuka-Cola (искрение стартера и розжиг неона)
  playNukaIgnition: () => {
    if (soundMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;
      // 1. Гул трансформатора
      const humOsc = ctx.createOscillator();
      const humGain = ctx.createGain();
      humOsc.type = 'sawtooth';
      humOsc.frequency.setValueAtTime(60, t);
      humGain.gain.setValueAtTime(0.01, t);
      humGain.gain.linearRampToValueAtTime(0.05, t + 0.6);
      humGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      humOsc.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start(t);
      humOsc.stop(t + 1.8);

      // 2. Треск неонового стартера
      [0.2, 0.45, 0.85].forEach((delay) => {
        const spark = ctx.createOscillator();
        const sparkGain = ctx.createGain();
        spark.type = 'square';
        spark.frequency.setValueAtTime(1600, t + delay);
        spark.frequency.exponentialRampToValueAtTime(300, t + delay + 0.04);
        sparkGain.gain.setValueAtTime(0.08, t + delay);
        sparkGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.04);
        spark.connect(sparkGain);
        sparkGain.connect(ctx.destination);
        spark.start(t + delay);
        spark.stop(t + delay + 0.05);
      });

      // 3. Звон розжига неона
      const neonChime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      neonChime.type = 'sine';
      neonChime.frequency.setValueAtTime(880, t + 1.1);
      neonChime.frequency.exponentialRampToValueAtTime(1760, t + 1.4);
      chimeGain.gain.setValueAtTime(0.08, t + 1.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      neonChime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      neonChime.start(t + 1.1);
      neonChime.stop(t + 1.85);
    } catch {
      // ignore
    }
  }
};
