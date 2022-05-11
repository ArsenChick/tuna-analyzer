import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import './index.scss';

import App from './App';
import Analyzer from './components/analyzer/Analyzer';
import Auth from './components/Auth';
import Signup from './components/Signup';
import History from './components/History';
import PageNotFound from './components/PageNotFound';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route exact index element={<Analyzer />} />
          <Route exact path="login" element={<Auth />} />
          <Route exact path="signup" element={<Signup />} />
          <Route exact path="history" element={<History />} />
          <Route path="*" element={<PageNotFound/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
