import React from 'react';
import { preprocess, shortenAudio } from '../scripts/audioUtils';
import '../scss/analyzer.scss';

const moodModelNames = ['mood_happy', 'mood_aggressive', 'danceability'];

const keyBPMWorkerPath = "./workers/core_extractor.worker.js";
const extractorWorkerPath = "./workers/model_extractor.worker.js";
const moodWorkerPath = "./workers/mood_inference.worker.js";
// const energyWorkerPath = "./workers/energy_inference.worker.js";


class Analyzer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: []
    }

    this.handleUpload = this.handleUpload.bind(this);
    this.audioFile = React.createRef();
    
    this.actx = null;
    this.workers = {
      keyBpm: null,
      featureExtraction: null,
      moodInference: {},
      energyInference: null
    };
    this.activeWorkers = 0;
  }

  componentDidMount() {
    this.workers.keyBpm = new Worker(keyBPMWorkerPath, { type: 'module' });
    this.workers.featureExtraction = new Worker(extractorWorkerPath, { type: 'module' });

    moodModelNames.forEach((mood) => { 
      this.workers.moodInference[mood] = new Worker(moodWorkerPath);
      this.workers.moodInference[mood].postMessage({ name: mood });
    });

    // try {
    //   this.workers.moodInference['test'] = new Worker(moodWorkerPath, { type: 'module' });
    // } catch (e) {
    //   console.log(e);
    // }
    // this.workers.moodInference['test'].postMessage({ name: 'mood_happy' });

    // this.workers.energyInference = new Worker(energyWorkerPath);
    // this.workers.energyInference.postMessage({ start: true });
  }

  handleUpload(event) {    
    event.preventDefault();
    if (!this.actx) {
      try {
        console.log('New context instantiated');
        this.actx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.log(`Sorry, but your browser doesn't support the Web Audio API!`, e);
      }
    }

    const audioFile = this.audioFile.current.files[0];
    audioFile.arrayBuffer().then((ab) => this.analyzeFile(ab));
  }

  analyzeFile(arrayBuffer) {
    this.actx.resume().then(() => {
      this.actx.decodeAudioData(arrayBuffer).then(async (audioBuffer) => {
        console.info("Done decoding audio!");
        let analyzePromises = [];

        const prepocessedAudio = preprocess(audioBuffer);
        await this.actx.suspend();
        const keyBpmPromise = this.getKeyBpm(prepocessedAudio);
        analyzePromises.push(keyBpmPromise);

        let audioData = shortenAudio(prepocessedAudio, 0.15, true);
        const featuresPromise = this.extractFeatures(audioData);
        analyzePromises.push(featuresPromise);

        await featuresPromise.then(async (features) => {
          for (const mood of moodModelNames) {
            const promise = this.getMoodPredictions(mood, features);
            analyzePromises.push(promise);
            await promise;
          }
        });

        // Promise.all(analyzePromises).then((results) => {
        //   const bpm = results[0].bpm;
        //   const features = results[1];
        //   this.getEnergyPredictions(bpm, features);
        // });

        Promise.all(analyzePromises).then((results) => {
          results.splice(1, 1);
          this.outputResults(...results);
        });
      });
    });
  }

  getKeyBpm(audioData) {
    const keyBpm = new Promise((resolve) => {
      this.workers.keyBpm.onmessage = (msg) => {
        if (msg.data.keyData && msg.data.bpm) {
          resolve(msg.data);
        }
      }
    });
    this.workers.keyBpm.postMessage({
      audio: audioData.buffer
    });
    return keyBpm;
  }

  extractFeatures(audioData) {
    const features = new Promise((resolve) => {
      this.workers.featureExtraction.onmessage = (msg) => {
        if (msg.data.features) {
          resolve(msg.data.features);
        }
      };
    });
    this.workers.featureExtraction.postMessage({
      audio: audioData.buffer
    });
    return features;
  }

  getMoodPredictions(mood, features) {
    const moodPreds = new Promise((resolve) => {
      this.workers.moodInference[mood].onmessage = (msg) => {
        if (msg.data.predictions) {
          resolve(msg.data.predictions);
        }
      };
    });
    this.workers.moodInference[mood].postMessage({
      features: features
    });
    return moodPreds;
  }

  getEnergyPredictions(bpm, features) {
    const energy = new Promise((resolve) => {
      this.workers.energyInference.onmessage = (msg) => {
        if (msg.data.predictions) {
          const preds = msg.data.predictions;
          console.log(`energy predictions: `, preds);
          resolve(preds);
        }
      };
    });
    this.workers.energyInference.postMessage({
      bpm: bpm, features: features
    });
    return energy;
  }

  outputResults(keyBpmData, happy, aggressive, dance) {
    const prevState = this.state.results.slice();

    const filename = this.audioFile.current.files[0].name;
    const fullKeyName = `${keyBpmData.keyData.key} ${keyBpmData.keyData.scale}`;

    const happyScaled = (10 * happy).toPrecision(2);
    const aggressiveScaled = (10 * aggressive).toPrecision(2);
    const danceScaled = (10 * dance).toPrecision(2);

    const tableRow = (
      <tr key={prevState.length}>
        <td>{filename}</td>
        <td>{Math.ceil(keyBpmData.bpm)}</td>
        <td>{fullKeyName}</td>
        <td>{happyScaled}</td>
        <td>{aggressiveScaled}</td>
        <td>{danceScaled}</td>
      </tr>
    );

    this.setState({
      results: [...prevState, tableRow]
    });
  }

  render() {
    return (
      <div>
        <h2>Analyzer</h2>
        <form onSubmit={this.handleUpload}>
          <input type="file" ref={this.audioFile} />
          <button type="submit">Submit</button>
        </form>
        <div>
          <table>
            <thead>
              <tr>
                <th>Filename</th>
                <th>BPM</th>
                <th>Key</th>
                <th>Happiness</th>
                <th>Aggressiveness</th>
                <th>Danceability</th>
              </tr>
            </thead>
            <tbody>
              {this.state.results}
            </tbody>
          </table>
        </div>
      </div>      
    );
  }
}

export default Analyzer;