import "../../scss/analyzer/description.scss";


export const Description = () => {
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