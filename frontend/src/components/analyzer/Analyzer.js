import React from "react";
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import { preprocess, shortenAudio } from "../../scripts/audioUtils";
import { toBase64 } from "../../scripts/fileUtils";

import { Description } from "./Description";
import { DragAndDrop } from "./DragAndDrop";
import { Hint } from "./Hint";
import "../../scss/analyzer/analyzer.scss";

const moodModelNames = ["mood_happy", "mood_aggressive", "danceability"];

const keyBPMWorkerPath = "./workers/core_extractor.worker.js";
const extractorWorkerPath = "./workers/model_extractor.worker.js";
const moodWorkerPath = "./workers/mood_inference.worker.js";
// const energyWorkerPath = "./workers/energy_inference.worker.js";


class Analyzer extends React.Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      hintActive: false,
      resultsView: []
    }

    const { cookies } = props;
    this.accessToken = cookies.get('access_token') || false;
    
    this.handleUpload = this.handleUpload.bind(this);
    this.setHintActive = this.setHintActive.bind(this);
    
    this.actx = null;
    this.resultsData = [];
    this.audioFiles = [];

    this.analyzesInQueue = [];
    this.currentInSend = null;

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

  componentWillUnmount() {
    this.workers.keyBpm.terminate();
    this.workers.featureExtraction.terminate();
    moodModelNames.forEach((mood) =>
      this.workers.moodInference[mood].terminate());
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

    const queueNo = this.state.resultsView.length;
    this.resultsData.push({ filename: file.name });
    this.audioFiles.push({ file: file, ticket: queueNo });
    this.showQueued(file.name);

    this.analyzesInQueue.push(new Promise(async (resolve) => {
      if (this.analyzesInQueue.length !== 0) {
        await this.analyzesInQueue[this.analyzesInQueue.length - 1];
        this.analyzesInQueue.shift();
      }

      this.showAnalyzing(queueNo, file.name);
      const audioFile = file;
      audioFile.arrayBuffer()
        .then((ab) => this.analyzeFile(ab)
          .then((results) => {
            this.saveResults(queueNo, ...results);
            this.outputResults(queueNo);

            if (this.accessToken) {
              this.currentInSend = new Promise((resolve) => {
                this.sendResults(queueNo)
                  .then((response) => {
                    this.showServerSaved(queueNo, response);
                    resolve(response);
                  });
              });
            }

            resolve(this.analyzesInQueue.length);
          }));
    }));
  }

  showQueued(filename) {
    const prevState = this.state.resultsView.slice();
    const tableRow = (
      <tr key={prevState.length} className="record-row waiting">
        <td>{filename}</td>
        {[...Array(5).keys()].map((num) =>
          <td key={num}>Waiting...</td>
        )}
        {this.accessToken && <td>Waiting...</td>}
      </tr>
    );

    this.setState({
      resultsView: [...prevState, tableRow]
    });
  }

  showAnalyzing(queueNo, filename) {
    const prevState = this.state.resultsView.slice();
    const tableRow = (
      <tr key={queueNo} className="record-row loading">
        <td>{filename}</td>
        {[...Array(5).keys()].map((num) =>
          <td key={num}>Loading...</td>
        )}
        {this.accessToken && <td>Waiting...</td>}
      </tr>
    );
    
    prevState[queueNo] = tableRow;
    this.setState({
      resultsView: prevState
    });
  }

  analyzeFile(arrayBuffer) {
    return this.actx.resume().then(async () => {
      return await this.actx.decodeAudioData(arrayBuffer)
        .then(async (audioBuffer) => {
        console.info("Done decoding audio!");
        let analyzePromises = [];

        const prepocessedAudio = preprocess(audioBuffer);
        await this.actx.suspend();
        const keyBpmPromise = this.getKeyBpm(prepocessedAudio);
        analyzePromises.push(keyBpmPromise);

        let audioData = shortenAudio(prepocessedAudio, 0.15, true);
        const featuresPromise = this.extractFeatures(audioData);
        analyzePromises.push(featuresPromise);

        let features = await featuresPromise;
        for (const mood of moodModelNames) {
          const promise = this.getMoodPredictions(mood, features);
          analyzePromises.push(promise);
          await promise;
        }

        return await Promise.all(analyzePromises).then((results) => {
          results.splice(1, 1);
          return results;
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

  saveResults(queueNo, keyBpmData, happy, aggressive, dance) {
    let specificResult = this.resultsData[queueNo];
    specificResult.key = `${keyBpmData.keyData.key} ${keyBpmData.keyData.scale}`;
    specificResult.bpm = Math.round(keyBpmData.bpm);
    specificResult.happy = Math.round(10 * happy);
    specificResult.energy = Math.round(10 * aggressive);
    specificResult.dance = Math.round(10 * dance);
  }

  outputResults(queueNo) {
    const prevState = this.state.resultsView.slice();
    const specificResult = this.resultsData[queueNo];
    const filename = specificResult.filename;

    const tableRow = (
      <tr key={queueNo} className="record-row">
        <td className="record-name">{filename}</td>
        <td className="record-tone">{specificResult.bpm}</td>
        <td className="record-key">{specificResult.key}</td>
        <td className="record-happiness">{specificResult.happy}</td>
        <td className="record-aggressiveness">{specificResult.energy}</td>
        <td className="record-danceability">{specificResult.dance}</td>
        {this.accessToken && <td>Waiting...</td>}
      </tr>
    );
    prevState[queueNo] = tableRow;
    this.setState({
      resultsView: prevState
    });
  }

  async sendResults(queueNo) {
    this.showSending(queueNo);

    const fileRecord = this.audioFiles.find((record) => record.ticket === queueNo);
    const base64 = await toBase64(fileRecord.file);
    const jsonBody = this.getResultJSON(queueNo, base64);

    const requestOptions = {
      mode: "cors",
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + this.accessToken,
        "Content-Type": "application/json",
      },
      body: jsonBody
    };
    
    return await fetch("/api/save_results", requestOptions)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        if (json.msg === "Upload done") return true;
        else return false;
      });
  }

  getResultJSON(queueNo, base64File) {
    const resultToSend = this.resultsData[queueNo];
    let jsonObj = {
      bpm: resultToSend.bpm,
      tone: resultToSend.key,
      dance: resultToSend.dance,
      energy: resultToSend.energy,
      happiness: resultToSend.happy,
      version: "0",
      file: {
        filename: resultToSend.filename,
        content: base64File
      }
    };
    return JSON.stringify(jsonObj);
  }

  showSending(queueNo) {
    const prevState = this.state.resultsView.slice();
    const specificResult = this.resultsData[queueNo];
    const filename = specificResult.filename;

    const tableRow = (
      <tr key={queueNo} className="record-row">
        <td className="record-name">{filename}</td>
        <td className="record-tone">{specificResult.bpm}</td>
        <td className="record-key">{specificResult.key}</td>
        <td className="record-happiness">{specificResult.happy}</td>
        <td className="record-aggressiveness">{specificResult.energy}</td>
        <td className="record-danceability">{specificResult.dance}</td>
        <td>Saving...</td>
      </tr>
    );

    prevState[queueNo] = tableRow;
    this.setState({
      resultsView: prevState
    });
  }

  showServerSaved(queueNo, response) {
    const prevState = this.state.resultsView.slice();
    const specificResult = this.resultsData[queueNo];
    const filename = specificResult.filename;

    const tableRow = (
      <tr key={queueNo} className="record-row">
        <td className="record-name">{filename}</td>
        <td className="record-tone">{specificResult.bpm}</td>
        <td className="record-key">{specificResult.key}</td>
        <td className="record-happiness">{specificResult.happy}</td>
        <td className="record-aggressiveness">{specificResult.energy}</td>
        <td className="record-danceability">{specificResult.dance}</td>
        <td>{response ? "Saved" : "Error"}</td>
      </tr>
    );

    prevState[queueNo] = tableRow;
    this.setState({
      resultsView: prevState
    });
  }

  render() {
    return (
      <main className="page-content analyzer-page">
        <div className="in-line inside-padding">
          <div className="flex-item"> <Description/> </div>
          <div className="flex-item"> <DragAndDrop dropFunction={this.handleUpload} /> </div>
        </div>
        <div className="analysis-history">
          <table>
            <thead>
              <tr className="titles">
                <th className="title filename"><span>Filename </span></th>
                <th className="title bpm"><span>BPM </span><span className="question-sign cursor-point">(?)</span>
                                    <ul className="sub-title_list"><li className="sub-title">Bits Per Minute</li></ul></th>
                <th className="title key"><span>Key </span></th>
                <th className="title happiness"><span>H </span><span className="question-sign cursor-point">(?)</span>
                                    <ul className="sub-title_list"><li className="sub-title">Happiness</li></ul></th>
                <th className="title energy"><span>E </span><span className="question-sign cursor-point">(?)</span>
                                    <ul className="sub-title_list"><li className="sub-title">Energy</li></ul></th>
                <th className="title danceability"><span>D </span><span className="question-sign cursor-point">(?)</span>
                                    <ul className="sub-title_list"><li className="sub-title">Danceability</li></ul></th>
                {this.accessToken && <th className="title saved"><span>Saved </span></th>}
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

export default withCookies(Analyzer);

