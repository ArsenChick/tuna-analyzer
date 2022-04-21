import { EssentiaTFInputExtractor } from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-model.es.js";
import { EssentiaWASM } from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js';

const extractor = new EssentiaTFInputExtractor(EssentiaWASM, 'musicnn', false);

function outputFeatures(f) {
  postMessage({ features: f });
}

function computeFeatures(audioData) {
  const featuresStart = Date.now();
  
  const features = extractor.computeFrameWise(audioData, 256);
  console.info(`Feature extraction took: ${Date.now() - featuresStart}`);

  return features;
}

onmessage = (msg) => {
  if (msg.data.audio) {
    console.log("From FE worker: I've got audio!");
    const audio = new Float32Array(msg.data.audio);
    const features = computeFeatures(audio);
    outputFeatures(features);
  }
}