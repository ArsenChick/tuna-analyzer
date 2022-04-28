import React, { useState, useEffect } from "react";
import { preprocess, shortenAudio } from "../scripts/audioUtils";
import "../scss/analyzer.scss";

const moodModelNames = ["mood_happy", "mood_aggressive", "danceability"];

const keyBPMWorkerPath = "./workers/core_extractor.worker.js";
const extractorWorkerPath = "./workers/model_extractor.worker.js";
const moodWorkerPath = "./workers/mood_inference.worker.js";
// const energyWorkerPath = "./workers/energy_inference.worker.js";

const FileUploader = (props) => {
  const hiddenFileInput = React.useRef(null);
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };
  const handleChange = (event) => {
    if (event.target.files.length === 1) {
      const fileUploaded = event.target.files[0];
      if (
        fileUploaded.type === "audio/mpeg" ||
        fileUploaded.type === "audio/ogg" ||
        fileUploaded.type === "audio/wav" ||
        fileUploaded.type === "audio/flac"
      ) {
        props.handleFile(fileUploaded);
        props.setUnv(false);
      } else {
        props.setUnv(true);
      }
    }
  };

  return (
    <>
      <button className="dnd-select-button" onClick={handleClick}>
        Select file{" "}
      </button>
      <input
        type="file"
        accept=".mp3,.wav,.ogg,.flac"
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
};

function DragAndDrop(props) {
  const [drag, setDrag] = useState(0);
  const [unvalid, setUnvalid] = useState(0);
  const [file, setFile] = useState(0);
  var d = 0;

  useEffect(() => {
    const timer = setTimeout(() => {}, 5);
    return () => clearTimeout(timer);
  }, []);

  const handleDragEnter = (event) => {
    event.preventDefault();
    d++;
    setDrag(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (drag) d = 1;
    if (d > 0) setDrag(true);
    if (d <= 0) setDrag(false);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    d--;
    if (d <= 0) {
      setDrag(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setUnvalid(false);
    setDrag(false);

    let files = [...event.dataTransfer.files];
    setFile(files);
    d = 0;

    if (files.length === 1) {
      if (
        files[0].type === "audio/mpeg" ||
        files[0].type === "audio/ogg" ||
        files[0].type === "audio/wav" ||
        files[0].type === "audio/flac"
      ) {
        return <div>{props.dropFunction(files[0])}</div>;
      } else {
        setUnvalid(true);
      }
    }
  };
  
  if (drag === true) {
	  return (
      <div
        id="dnd-container-active"
        className="dnd-container-active"
        onDrop={event => handleDrop(event)}
        onDragOver={event => handleDragOver(event)}
        onDragLeave={event => handleDragLeave(event)}
        onDragEnter={event => handleDragEnter(event)}
      >
      <p className="dnd-unselectable-p">Drag&drop file here</p>

      </div>
    );
  }

  return (
    <div
      id="dnd-container"
      className="dnd-container"
      onDragEnter={(event) => handleDragEnter(event)}
    >
      <p className="dnd-unselectable-p">Drag&drop file here</p>
      <p className="dnd-unselectable-p" style={{ fontSize: 28 }}>
        or
      </p>
      <FileUploader
        setUnv={setUnvalid}
        handleFile={props.dropFunction}
      ></FileUploader>
      {file.length > 1 && (
        <p
          className="dnd-unselectable-p"
          style={{ fontSize: 16, color: "red" }}
        >
          Drag files by one at time
        </p>
      )}
      {unvalid === true && (
        <p
          className="dnd-unselectable-p"
          style={{ fontSize: 16, color: "red" }}
        >
          Unsupported format
        </p>
      )}
    </div>
  );
}

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

const Hint = ({active, setActive}) => {
  return (
    <div className="hint-area">
      <div className={active ? "hint-modal-window active" : "hint-modal-window"}
        onClick={e => e.stopPropagation()
      }>
        <ul className="hint-content">
          <span>Characteristics description:</span>
          <li>
            <b>BPM</b> (Beats Per Minute) a musical term
            that means measuring the tempo of the
            music.
          </li>
          <li>
            <b>Key</b> is the group of pitches, or scale, that
            forms the basis of a music composition
            in classical.
          </li>
          <li>
            Elements that give the composition more&nbsp;
            <b>energy</b>: higher tones, fast and irregular
            rhythms, dissonant harmony.
          </li>
          <li>
            <b>Happiness</b> of the music is usually expressed
            in a fast tempo and in a major key
          </li>
          <li>
            <b>Danceability</b> is measured using a mixture
            of song features such as beat strength,
            tempo stability, and overall tempo.
          </li>
        </ul>
      </div>
      <button
        className="hint-button"
        onClick={() => { active ? setActive(false) : setActive(true)
      }}>
        ?
      </button>
    </div>
  );
}


class Analyzer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hintActive: false,
      results: []
    }
    
    this.audioFile = null;
    this.handleUpload = this.handleUpload.bind(this);
    this.setHintActive = this.setHintActive.bind(this);
    
    this.actx = null;
    this.workers = {
      keyBpm: null,
      featureExtraction: null,
      moodInference: {},
      energyInference: null
    };
    // this.activeWorkers = 0;
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

    this.audioFile = file;
    const audioFile = file;
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

    const filename = this.audioFile.name;
    const fullKeyName = `${keyBpmData.keyData.key} ${keyBpmData.keyData.scale}`;

    const happyScaled = (10 * happy).toPrecision(2);
    const aggressiveScaled = (10 * aggressive).toPrecision(2);
    const danceScaled = (10 * dance).toPrecision(2);

    const tableRow = (
      <tr key={prevState.length} className="record-info">
        <td className="record-name">{filename}</td>
        <td className="record-tone">{Math.ceil(keyBpmData.bpm)}</td>
        <td className="record-key">{fullKeyName}</td>
        <td className="record-happiness">{happyScaled}</td>
        <td className="record-aggressiveness">{aggressiveScaled}</td>
        <td className="record-danceability">{danceScaled}</td>
      </tr>
    );

    this.setState({
      results: [...prevState, tableRow]
    });
  }

  render() {
    return (
      <main className="page-content analyzer-page">
        <div className="in-line">
          <div className="flex-item"> <Description/> </div>
          <div className="flex-item"> <DragAndDrop dropFunction={this.handleUpload} /> </div>
        </div>
        <div className="analysis-history">
          <table>
            <thead>
              <tr className="titles">
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
        <Hint
          active={this.state.hintActive}
          setActive={this.setHintActive}
        />
      </main>
    );
  }
}

export default Analyzer;

