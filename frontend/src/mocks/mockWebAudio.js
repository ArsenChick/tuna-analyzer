Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    resume: jest.fn(() => new Promise((res) => res(true))),
    suspend: jest.fn(() => new Promise((res) => res(true))),
    decodeAudioData: jest.fn((audioBuffer) => new Promise((res) => res("audiobufferhehe")))
  })),
});
