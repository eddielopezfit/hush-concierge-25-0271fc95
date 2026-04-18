/** Encode an AudioBuffer to a WAV Blob */
function encodeWav(buffer: AudioBuffer): Blob {
  const sampleRate = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  const dataSize = data.length * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + dataSize, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, dataSize, true);
  let o = 44;
  for (let i = 0; i < data.length; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, data[i]));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

/**
 * Synthesize a soft two-tone "chime" and return it as a playable HTMLAudioElement.
 * Returns null if the AudioContext is unavailable.
 */
export function buildChimeAudio(): HTMLAudioElement | null {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const sr = ctx.sampleRate;
    const len = sr * 0.6;
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    const f1 = 880, f2 = 1318.5;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 6) * 0.25;
      data[i] = env * (Math.sin(2 * Math.PI * f1 * t) * 0.6 + Math.sin(2 * Math.PI * f2 * t) * 0.4);
    }
    const wavBlob = encodeWav(buf);
    const url = URL.createObjectURL(wavBlob);
    const audio = new Audio(url);
    audio.volume = 0.35;
    ctx.close();
    return audio;
  } catch {
    return null;
  }
}
