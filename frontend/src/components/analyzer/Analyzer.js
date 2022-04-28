import React from "react";
import { preprocess, shortenAudio } from "../../scripts/audioUtils";

import { DragAndDrop } from "./DragAndDrop";
import { Hint } from "./Hint";
import "../../scss/analyzer.scss";

const moodModelNames = ["mood_happy", "mood_aggressive", "danceability"];

const keyBPMWorkerPath = "./workers/core_extractor.worker.js";
const extractorWorkerPath = "./workers/model_extractor.worker.js";
const moodWorkerPath = "./workers/mood_inference.worker.js";
// const energyWorkerPath = "./workers/energy_inference.worker.js";

const Description = () => {
  return (
    <div className="description">
      <p className="project-info">
        <span className="project-name">Tuna </span>
        is a web service for music composition analysis.
      </p>
      <p className="project-propose">
        Each user can upload their own musical composition
        for which the service will determine the&nbsp;
        <span className="special-word">tempo</span>,&nbsp;
        <span className="special-word">tonality</span> and
        evaluate several subjective characteristics:&nbsp;
        <span className="special-word">energy</span>,&nbsp;
        <span className="special-word">happiness</span> and&nbsp;
        <span className="special-word">danceability</span>.
      </p>
    </div>
  );
}

class Analyzer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hintActive: false,
      resultsView: []
    }
    
    this.handleUpload = this.handleUpload.bind(this);
    this.setHintActive = this.setHintActive.bind(this);
    
    this.actx = null;
    this.resultsData = [];
    this.workers = {
      keyBpm: null,
      featureExtraction: null,
      moodInference: {},
      energyInference: null
    };
  }

  componentDidMount() {
    this.workers.keyBpm = new Worker(keyBPMWorkerPath, { type: 'module' });
    this.workers.featureExtraction = new Worker(extractorWorkerPath, { type: 'module' });

    moodModelNames.forEach((mood) => { 
      this.workers.moodInference[mood] = new Worker(moodWorkerPath);
      this.workers.moodInference[mood].postMessage({ name: mood });
    });
  }
  
  setHintActive(state) {
    this.setState({
      hintActive: state
    });
  }

  handleUpload(file) {    
    if (!this.actx) {
      try {
        console.log('New context instantiated');
        this.actx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.log(`Sorry, but your browser doesn't support the Web Audio API!`, e);
      }
    }

    this.resultsData.push({ file: file });
    this.showQueued(file.name);
    const audioFile = file;
    audioFile.arrayBuffer().then((ab) => this.analyzeFile(ab));
  }

  showQueued(filename) {
    const prevState = this.state.resultsView.slice();

    const tableRow = (
      <tr key={prevState.length}>
        <td>{filename}</td>
        <td>Loading...</td>
        <td>Loading...</td>
        <td>Loading...</td>
        <td>Loading...</td>
        <td>Loading...</td>
      </tr>
    );

    this.setState({
      resultsView: [...prevState, tableRow]
    });
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

        Promise.all(analyzePromises).then((results) => {
          results.splice(1, 1);
          this.saveResults(...results);
          this.outputResults();
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

  saveResults(keyBpmData, happy, aggressive, dance) {
    let specificResult = this.resultsData.pop();

    specificResult.key = `${keyBpmData.keyData.key} ${keyBpmData.keyData.scale}`;
    specificResult.bpm = Math.ceil(keyBpmData.bpm);
    specificResult.happy = (10 * happy).toPrecision(2);
    specificResult.energy = (10 * aggressive).toPrecision(2);
    specificResult.dance = (10 * dance).toPrecision(2);

    this.resultsData.push(specificResult);
    console.log(this.resultsData);
  }

  outputResults() {
    const prevState = this.state.resultsView.slice();
    prevState.pop();

    const keyJsx = prevState.length;
    const specificResult = this.resultsData[keyJsx];
    const filename = specificResult.file.name;

    const tableRow = (
      <tr key={prevState.length}>
        <td>{filename}</td>
        <td>{specificResult.bpm}</td>
        <td>{specificResult.key}</td>
        <td>{specificResult.happy}</td>
        <td>{specificResult.energy}</td>
        <td>{specificResult.dance}</td>
      </tr>
    );

    this.setState({
      resultsView: [...prevState, tableRow]
    });
  }

  render() {
    return (
      <main className="page-content analyzer-page">
        <div className="in-line">
          <div className="flex-item"> <Description/> </div>
          <div className="flex-item"> <DragAndDrop dropFunction={this.handleUpload} /> </div>
        </div>
        <div>
          <table>
            <thead>
              <tr>
                <th>Filename</th>
                <th>BPM</th>
                <th>Key</th>
                <th>Happiness</th>
                <th>Energy</th>
                <th>Danceability</th>
              </tr>
            </thead>
            <tbody>
              {this.state.resultsView}
            </tbody>
          </table>
        </div>    
        <Hint
          active={this.state.hintActive}
          setActive={this.setHintActive}
        />
      </main>
    );
  }
}

export default Analyzer;

