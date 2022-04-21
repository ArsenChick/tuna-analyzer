import Essentia from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js';
import { EssentiaWASM } from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js';

const essentia = new Essentia(EssentiaWASM);

function computeKeyBPM (audioSignal) {
  let vectorSignal = essentia.arrayToVector(audioSignal);
  const keyData = essentia.KeyExtractor(vectorSignal, true, 4096, 4096, 12, 3500, 60, 25, 0.2, 'bgate', 16000, 0.0001, 440, 'cosine', 'hann');
  const bpm = essentia.PercivalBpmEstimator(vectorSignal, 1024, 2048, 128, 128, 210, 50, 16000).bpm;

  return {
    keyData: keyData,
    bpm: bpm
  };
}

onmessage = (msg) => {
  if (msg.data.audio) {
    const audioArray = new Float32Array(msg.data.audio);
    postMessage(computeKeyBPM(audioArray));
  }
}