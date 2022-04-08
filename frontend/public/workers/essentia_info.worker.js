import Essentia from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js';
import { EssentiaWASM } from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js';

const essentia = new Essentia(EssentiaWASM);

onmessage = (msg) => {
  if (msg.data.start) {
    postMessage({
      essentiaVersion: essentia.version,
      algoNames: essentia.algorithmNames,
    })
  }
}