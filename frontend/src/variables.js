const moodModelNames = ["mood_happy", "mood_aggressive", "danceability"];

const keyBPMWorkerPath = "./workers/core_extractor.worker.js";
const extractorWorkerPath = "./workers/model_extractor.worker.js";
const moodWorkerPath = "./workers/mood_inference.worker.js";

const exports = {
  moodModelNames,
  keyBPMWorkerPath,
  extractorWorkerPath,
  moodWorkerPath
};

export default exports;