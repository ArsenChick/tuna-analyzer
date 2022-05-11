import React from 'react'

import "./../scss/page_not_found/page_not_found.scss";

function PageNotFound() {
  return (
    <div className="page-content not-found center-page-align">
      <h1> Oh, no!</h1>
      <p> An error has occurred! Don't worry, we've already assigned this task to our best robot. </p>
      <br></br>
      <p> In the meantime, try these links: </p>
      <ul>
        <li><a> Analyzer </a></li>
        <li><a> Log in </a></li>
      </ul>
    </div>
  );
}

export default PageNotFound;
