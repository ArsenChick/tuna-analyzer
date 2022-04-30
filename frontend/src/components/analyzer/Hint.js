import "../../scss/analyzer/hint.scss";

export const Hint = ({active, setActive}) => {
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