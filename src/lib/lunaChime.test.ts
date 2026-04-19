import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildChimeAudio } from "./lunaChime";

// Minimal fake AudioBuffer / AudioContext for jsdom
class FakeAudioBuffer {
  sampleRate: number;
  length: number;
  private data: Float32Array;
  constructor(_ch: number, length: number, sampleRate: number) {
    this.sampleRate = sampleRate;
    this.length = length;
    this.data = new Float32Array(length);
  }
  getChannelData() {
    return this.data;
  }
}

class FakeAudioContext {
  sampleRate = 44100;
  closed = false;
  createBuffer(channels: number, length: number, sampleRate: number) {
    return new FakeAudioBuffer(channels, length, sampleRate);
  }
  close() {
    this.closed = true;
  }
}

describe("buildChimeAudio", () => {
  const originalAudioCtx = (window as unknown as { AudioContext?: unknown }).AudioContext;
  const originalCreateObjectURL = URL.createObjectURL;
  let ctxInstances: FakeAudioContext[] = [];

  beforeEach(() => {
    ctxInstances = [];
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(() => {
      const c = new FakeAudioContext();
      ctxInstances.push(c);
      return c;
    });
    URL.createObjectURL = vi.fn(() => "blob:fake-chime");
  });

  afterEach(() => {
    (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioCtx;
    URL.createObjectURL = originalCreateObjectURL;
    vi.restoreAllMocks();
  });

  it("returns an HTMLAudioElement with the expected volume", () => {
    const audio = buildChimeAudio();
    expect(audio).toBeInstanceOf(HTMLAudioElement);
    expect(audio?.volume).toBeCloseTo(0.35, 5);
  });

  it("uses the synthesized blob URL as the audio source", () => {
    const audio = buildChimeAudio();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(audio?.src).toContain("blob:fake-chime");
  });

  it("closes the AudioContext after generating the chime", () => {
    buildChimeAudio();
    expect(ctxInstances).toHaveLength(1);
    expect(ctxInstances[0].closed).toBe(true);
  });

  it("falls back to webkitAudioContext when AudioContext is missing", () => {
    (window as unknown as { AudioContext?: unknown }).AudioContext = undefined;
    const webkitCtor = vi.fn(() => {
      const c = new FakeAudioContext();
      ctxInstances.push(c);
      return c;
    });
    (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext = webkitCtor;

    const audio = buildChimeAudio();
    expect(webkitCtor).toHaveBeenCalled();
    expect(audio).toBeInstanceOf(HTMLAudioElement);

    delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
  });

  it("returns null when no AudioContext is available", () => {
    (window as unknown as { AudioContext?: unknown }).AudioContext = undefined;
    // ensure webkit is also gone
    delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
    expect(buildChimeAudio()).toBeNull();
  });

  it("returns null when AudioContext construction throws", () => {
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(() => {
      throw new Error("blocked by autoplay policy");
    });
    expect(buildChimeAudio()).toBeNull();
  });
});
