import "../../scss/analyzer/hint.scss";


export const Hint = ({active, setActive}) => {
  return (
    <div className="hint-area">
      <div className={active ? "hint-modal-window _active" : "hint-modal-window"}
        onClick={e => e.stopPropagation()
      }>
        <ul className="hint-content">
          <span>Characteristics description:</span>
          <li>
            <span className="special-word">BPM</span> (Beats Per Minute) a musical term
            that means measuring the tempo of the
            music.
          </li>
          <li>
            <span className="special-word">Key</span> is the group of pitches, or scale, that
            forms the basis of a music composition
            in classical.
          </li>
          <li>
            Elements that give the composition more&nbsp;
            <span className="special-word">energy</span>: higher tones, fast and irregular
            rhythms, dissonant harmony.
          </li>
          <li>
            <span className="special-word">Happiness</span> of the music is usually expressed
            in a fast tempo and in a major key
          </li>
          <li>
            <span className="special-word">Danceability</span> is measured using a mixture
            of song features such as beat strength,
            tempo stability, and overall tempo.
          </li>
        </ul>
        <div className="triangle-down right-triangle-align"></div>
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