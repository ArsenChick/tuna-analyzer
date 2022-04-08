import React from 'react';
import { preprocess, shortenAudio } from '../scripts/audioUtils';
import '../scss/analyzer.scss';

const modelNames = ['mood_happy', 'danceability'];

class Analyzer extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpload = this.handleUpload.bind(this);
    this.audioFile = React.createRef();
    
    this.actx = null;
    this.inferenceWorkers = {};
    this.keyBPMWorker = null;
    this.featureExtractionWorker = null;
  }

  componentDidMount() {
    modelNames.forEach((n) => { 
      this.inferenceWorkers[n] = new Worker("./workers/model_inference.worker.js");
      this.inferenceWorkers[n].onmessage = (msg) => {
        if (msg.data.predictions) {
          const preds = msg.data.predictions;
          console.log(`${n} predictions: `, preds);
        }
      };
      this.inferenceWorkers[n].postMessage({ name: n });
    });
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
    audioFile.arrayBuffer().then((ab) => {
      this.analyzeFile(ab);
    });
  }

  analyzeFile(arrayBuffer) {
    this.actx.resume().then(() => {
      this.actx.decodeAudioData(arrayBuffer).then(async (audioBuffer) => {
        console.info("Done decoding audio!");

        const prepocessedAudio = preprocess(audioBuffer);
        await this.actx.suspend();
        this.getKeyBPM(prepocessedAudio);

        let audioData = shortenAudio(prepocessedAudio, 0.15, true);
        this.extractFeaturesModel(audioData);
      });
    });
  }

  getKeyBPM(audioData) {
    this.keyBPMWorker = new Worker("./workers/core_extractor.worker.js", { type: 'module' });
    this.keyBPMWorker.onmessage = (msg) => {
      if (msg.data.keyData && msg.data.bpm) {
        console.log(msg.data);
      }
    };
    this.keyBPMWorker.postMessage({
      audio: audioData.buffer,
    });
  }

  extractFeaturesModel(audioData) {
    this.featureExtractionWorker = new Worker("./workers/model_extractor.worker.js", { type: 'module' });
    this.featureExtractionWorker.onmessage = (msg) => {
      if (msg.data.features) {
        modelNames.forEach((n) => {
          this.inferenceWorkers[n].postMessage({
            features: msg.data.features
          });
        });
        msg.data.features = null;
      }
    };
    this.featureExtractionWorker.postMessage({
      audio: audioData.buffer
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
          <div id="danceability">
            <span>Danceability</span>
            <div data-classifier="Danceability"></div>
          </div>
          <div id="mood_happy">
            <span>Happy</span>
            <div data-classifier="Happy"></div>
          </div>
          <div id="bpm-and-key">
            <div id="bpm">
              <div>BPM</div>
              <div id="bpm-value"></div>
            </div>
            <div id="key">
              <div>Key</div>
              <div id="key-value"></div>
            </div>
          </div>
        </div>
      </div>      
    );
  }
}

export default Analyzer;