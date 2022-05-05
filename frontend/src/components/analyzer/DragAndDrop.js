import React, { useState } from "react";
import "../../scss/analyzer/drag_and_drop.scss";


const FileUploader = (props) => {
  const hiddenFileInput = React.useRef(null);
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };
  var u = false;
  const handleChange = (event) => {
    u = false;
    const fileUploaded = event.target.files;
    const checkTypes = [...fileUploaded].map((file) => {
      if (
        file.type !== "audio/mpeg" &&
        file.type !== "audio/ogg" &&
        file.type !== "audio/wav" &&
        file.type !== "audio/flac"
      ){
        props.setUnv(true);
        u = true;
      } 
      return 1;
    }

    );
    Promise.all(checkTypes).then(() => {
      if (u === false) {
        [...fileUploaded].map((file) => {
          props.handleFile(file);
          return 1;
        }
        )
      }
    });
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
        multiple
        style={{ display: "none" }}
      />
    </>
  );
};

export function DragAndDrop(props) {
  const [drag, setDrag] = useState(0);
  const [unvalid, setUnvalid] = useState(0);
  var d = 0;

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
    d = 0;
    let u = false;
    u = false;
    const checkTypes = files.map((file) => {
      if (
        file.type !== "audio/mpeg" &&
        file.type !== "audio/ogg" &&
        file.type !== "audio/wav" &&
        file.type !== "audio/flac"
      ){
        setUnvalid(true);
        u = true;
      }
      return 1; 
    }
    );
    Promise.all(checkTypes).then(() => {
      if (u === false) {
        files.map((file) => {
          props.dropFunction(file);
          return 1;
        }
        )
      }
    });
  }
  
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
      {/*
      {file.length > 1 && (
        <p
          className="dnd-unselectable-p"
          style={{ fontSize: 16, color: "red" }}
        >
          Drag files by one at time
        </p>
      )}
      */}
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