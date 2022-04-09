import '../scss/analyzer.scss';
import React, { useState, useEffect } from 'react';

const FileUploader = props => {
  const hiddenFileInput = React.useRef(null);
  const handleClick = event => {
	  hiddenFileInput.current.click();
  };
  const handleChange = event => {
	  if(event.target.files.length === 1){
		  const fileUploaded = event.target.files[0];
		  props.handleFile(fileUploaded);
	  }
  };
  
  return (
    <>
	  <button className="dnd-select-button" onClick={handleClick}>Select file </button>
      <input type="file" accept=".mp3,.wav,.ogg,.flac" ref={hiddenFileInput} onChange={handleChange} style={{display:'none'}} /> 
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

  const handleDragEnter = event => {
    event.preventDefault();
	d++;
    setDrag(true);
  };

  const handleDragOver = event => {
    event.preventDefault();
	event.stopPropagation();
	if(drag)
		d = 1;
	if (d > 0) {
		setDrag(true);
    }
	if (d <= 0) {
		setDrag(false);
    }
  };

  const handleDragLeave = event => {
    event.preventDefault();
	d--;
	if (d <= 0) {
		setDrag(false);
    }
  };

  const handleDrop = event => {
    event.preventDefault();
	setUnvalid(false);
    setDrag(false);
    let files = [...event.dataTransfer.files];
    setFile(files);
	d = 0;
	if(files.length === 1){
		if(files[0].type === 'audio/mpeg' || files[0].type === 'audio/ogg' || files[0].type === 'audio/wav' || files[0].type === 'audio/flac'){
		  return(
			<div>{props.dropFunction(files[0])}</div>
		  );
		} else {
			setUnvalid(true);
		}
    }
  };
  
  if(drag === true){
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

  return (<div
      id="dnd-container"
      className="dnd-container"
      onDragEnter={event => handleDragEnter(event)}
    >
		<p className="dnd-unselectable-p" >Drag&drop file here</p>
		<p className="dnd-unselectable-p" style={{fontSize: 28}}>or</p>
		<FileUploader handleFile={handleFile}></FileUploader>
	{file.length > 1 &&
	<p className="dnd-unselectable-p" style={{fontSize: 16, color: 'red'}}>Drag files by one at time</p>
	}
	{unvalid === true &&
	<p className="dnd-unselectable-p" style={{fontSize: 16, color: 'red'}}>Unsupported format</p>
	}
	</div>
	
  );
}


function handleFile (file) {
	console.log(file.name);
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


export default function Analyzer() {
  const [hintActive, setHintActive] = useState(false)

  return (
    <main className="page-content analyzer-page">
      <Description/>
	  <DragAndDrop dropFunction={handleFile} />
	  <Hint active={hintActive} setActive={setHintActive}/>
    </main>
  );
}

