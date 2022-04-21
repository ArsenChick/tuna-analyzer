/* eslint-disable no-undef */
// importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
importScripts("https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-model.umd.js");

const MUSIC_TAGS = [
  'rock', 'pop', 'alternative', 'indie', 'electronic', 'female vocalists', 'dance','00s', 
  'alternative rock', 'jazz', 'beautiful', 'metal', 'chillout', 'male vocalists', 'classic rock',
  'soul', 'indie rock', 'Mellow', 'electronica', '80s', 'folk', '90s', 'chill', 'instrumental', 
  'punk', 'oldies', 'blues', 'hard rock', 'ambient', 'acoustic', 'experimental', 'female vocalist',
  'guitar', 'Hip-Hop', '70s', 'party', 'country', 'easy listening', 'sexy', 'catchy', 'funk', 
  'electro', 'heavy metal', 'Progressive rock', '60s', 'rnb', 'indie pop', 'sad', 'House', 'happy'
];

const NON_ENERGY_TAGS = [
  '60s', '70s', '80s', '90s', '00s', 'oldies', 'female vocalist', 'female vocalists', 
  'male vocalists', 'sad', 'happy', 'guitar', 'beautiful', 'acoustic', 'instrumental',
  'catchy', 'sexy', 'experimental', 'ambient', 'electro',  'electronica', 'electronic'
];

const ENERGY_COEFS = [0.75, 1.5, 2.75, 4, 5, 6, 7, 8.25, 9.5, 22];
const ENERGY_LEVELS = [
  ['folk', 'chill', 'Mellow', 'jazz', 'chillout', 'indie'],
  ['country', 'easy listening', 'blues'],
  ['indie pop', 'soul', 'funk'],
  ['party', 'pop', 'punk'],
  ['punk', 'dance'],
  ['alternative rock', 'indie rock', 'alternative'],
  ['Hip-Hop', 'rnb', 'rock', 'classic rock', 'Progressive rock'],
  ['House'],
  ['hard rock', 'metal'],
  ['heavy metal']
];

let model;
let trackBpm;
let modelLoaded = false;
let modelReady = false;
let energyLevelMap = new Map();

function makeEnergyLevelMap() {
  ENERGY_LEVELS.forEach((level, i) => {
    level.forEach((genre) => energyLevelMap.set(genre, ENERGY_COEFS[i]));
  });
}

function initModel() {
  model = new EssentiaModel.TensorflowMusiCNN(tf, getModelURL());
  
  loadModel().then((isLoaded) => {
    if (isLoaded) {
      modelLoaded = true;
      warmUp();
    } 
  });
}

function getModelURL() {
  return `../models/msd-musicnn-1/model.json`;
}

async function loadModel() {
  await model.initialize();
  console.info(`Autotagging model has been loaded!`);
  return true;
}

function warmUp() {
  const fakeFeatures = {
    melSpectrum: getZeroMatrix(187, 96),
    frameSize: 187,
    melBandsSize: 96,
    patchSize: 187
  };

  const fakeStart = Date.now();

  model.predict(fakeFeatures, false).then(() => {
    console.info(`energy: Warm up inference took: ${Date.now() - fakeStart}`);
    modelReady = true;
    if (modelLoaded && modelReady) console.log('energy loaded and ready.');
  });
}

async function initTensorflowWASM() {
  if (tf.getBackend() !== "wasm") {
    importScripts("../lib/tf-backend-wasm-3.5.0.js");
    tf.setBackend("wasm");
    tf.ready()
      .then(() => {
        console.info("tfjs WASM backend successfully initialized!");
        initModel();
      })
      .catch(() => {
        console.error(`tfjs WASM could NOT be initialized, defaulting to ${tf.getBackend()}`);
        return false;
      });
  }
}


function outputPredictions(p) {
  postMessage({ predictions: p });
}

function getTopFiveGenres(arrayOfArrays) {
  return arrayOfArrays.map((array) =>
    array
      .map((value, i) => [MUSIC_TAGS[i], value])
      .filter((tag) => !NON_ENERGY_TAGS.includes(tag[0]))
  );
}

function summarizeGenres(arrayOfArrays) {
  const iter = arrayOfArrays[Symbol.iterator]();
  let genresSum = new Map(iter.next().value);

  for (let array of iter) {
    array.forEach((tag) => {
      const prev = genresSum.get(tag[0]);
      genresSum.set(tag[0], prev + tag[1]);
    });
  }

  return new Map([...genresSum.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5));
}

function getEnergyLevel(genre) {
  return energyLevelMap.get(genre);
}

function getBpmInfluence(bpm) {
  if (bpm < 60) return -1;
  else if (bpm >= 60 && bpm <= 80) return -0.85;
  else if (bpm > 80 && bpm < 96) return -0.55;
  else if (bpm > 124 && bpm < 140) return 0.45;
  else if (bpm >= 140 && bpm < 160) return 1.1;
  else if (bpm >= 160) return 1.5;
  return 0;
}

function modelPredict(features) {
  if (modelReady) {
    const inferenceStart = Date.now();

    model.predict(features, true).then((predictions) => {
      const genrePathces = getTopFiveGenres(predictions);
      const genreSummary = summarizeGenres(genrePathces);
      console.log(genreSummary);

      let weightSum = 0;
      genreSummary.forEach((v) => weightSum += v);

      let energy = 0;
      genreSummary.forEach((value, genre) => {
        energy += value * getEnergyLevel(genre) / weightSum;
      });
      energy += getBpmInfluence(trackBpm);

      if (energy > 10) energy = 10;
      if (energy < 0) energy = 0;

      console.info(`energy: Inference took: ${Date.now() - inferenceStart}`);
      // output to main thread
      outputPredictions(energy);
    });
  }
}

function getZeroMatrix(x, y) {
  let matrix = new Array(x);
  for (let f = 0; f < x; f++) {
    matrix[f] = new Array(y).fill(0);
  }
  return matrix;
}

onmessage = (msg) => {
  if (msg.data.start) {
    makeEnergyLevelMap();
    initTensorflowWASM();
  } else if (msg.data.bpm && msg.data.features) {
    console.log("From energy inference worker: I've got features!");
    trackBpm = msg.data.bpm;
    modelPredict(msg.data.features);
  }
};