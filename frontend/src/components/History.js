import "../scss/history/history.scss";
import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import * as Icon from "react-feather";


function Result(props) {
  return (
    <>
      <tr>
        <td>{props.date}</td>
        <td>{props.name.slice(37)}</td>
        <td>{props.bpm}</td>
        <td>{props.tone}</td>
        <td>{props.happiness}</td>
        <td>{props.energy}</td>
        <td>{props.dance}</td>
        <td>{props.version}</td>
        <td>
          {
            <button
              id={"download"+props.id}
              className="result-button download-button"
              onClick={() => {
                props.downloadFile(props.id);
              }}
            >
              <Icon.Download size={20} />
            </button>
          }
        </td>
        <td>
          {
            <button
              id={"delete"+props.id}
              className="result-button delete-button"
              onClick={() => {
                props.deleteRes(props.id);
              }}
            >
              <Icon.Trash2 size={20} />
            </button>
          }
        </td>
      </tr>
    </>
  );
}

function DataList(props) {
  let results = props.data.map((res, i) => {
    return (
      <Result
        key={i}
		    id={res.id}
        bpm={res.bpm}
        name={res.name}
        tone={res.tone}
        happiness={res.happiness}
        energy={res.energy}
        dance={res.dance}
        version={res.version}
        date={res.date}
        deleteRes={props.deleteRes}
	    	downloadFile={props.downloadFile}
      />
    );
  });
  if (results.length < 1) {
    return <div id="noSaves" className="center-page-align inside-padding">No results were yet saved</div>;
  }

  return <>{results}</>;
}

function Table(props) {
  return (
    <div>
      <table id="resultTable" className="results-history">
        <thead>
          <tr className="titles">
            <th className="title date"><span>Date </span></th>
            <th className="title filename"><span>Filename </span></th>
            <th className="title bpm"><span>BPM </span><span className="question-sign cursor-point">(?)</span>
                                <ul className="sub-title_list"><li className="sub-title">Beats per Minute</li></ul></th>
            <th className="title key"><span>Key </span></th>
            <th className="title happiness"><span>H </span><span className="question-sign cursor-point">(?)</span>
                                <ul className="sub-title_list"><li className="sub-title">Happiness</li></ul></th>
            <th className="title energy"><span>E </span><span className="question-sign cursor-point">(?)</span>
                                    <ul className="sub-title_list"><li className="sub-title">Energy</li></ul></th>
            <th className="title danceability"><span>D </span><span className="question-sign cursor-point">(?)</span>
                                <ul className="sub-title_list"><li className="sub-title">Danceability</li></ul></th>
            <th className="title version">Version</th>

            <th className="title download">Download</th>
            <th className="title delete">Delete</th>
          </tr>
        </thead>
        <tbody>
          <DataList
            data={props.data}
            deleteRes={props.deleteRes}
            downloadFile={props.downloadFile}
          />
        </tbody>
      </table>
    </div>
  );
}

function PageButton(props) {
  if (props.curPage === props.id) {
    return (
      <>
        <button
          className="page-button num-page"
          onClick={() => {
            props.handler(props.id);
          }}
        >
          {props.id}
        </button>
      </>
    );
  }
  return (
    <>
      <button
        id={"page"+props.id}
        className="page-button"
        onClick={() => {
          props.handler(props.id);
        }}
      >
        {props.id}
      </button>
    </>
  );
}
function Footer(props) {
  var pageList = [];
  var i = 0;
  var max = 0;
  if (props.curPage < props.maxPages - 1) {
    if (props.pages > props.maxPages - 1)
      max = props.maxPages;
    else max = props.pages;
  } else if (props.pages - props.curPage < props.maxPages - 2) {
    i = props.pages - props.maxPages;
    max = props.pages;
  } else {
    i = props.curPage - Math.floor(props.maxPages / 2) - 1;
    max = props.curPage + Math.floor(props.maxPages / 2);
  }
  for (; i < max; i++) {
    pageList.push(i + 1);
  }
  let buttons = pageList.map((i) => {
    return (
      <PageButton id={i} handler={props.handler} curPage={props.curPage} />
    );
  });
  return(
  <div id="paginationFooter">
  {pageList.length > 0 &&
    <div className="page-buttons">
      <button
        className="page-button"
        onClick={() => {
          props.handler(1);
        }}
      >
	    {'<<'}
      </button>
	  <button
        className="page-button"
        onClick={() => {
          props.handler(props.curPage - 1);
        }}
      >
	    {'<'}
      </button>
      {buttons}
	  <button
        className="page-button"
        onClick={() => {
          props.handler(props.curPage + 1);
        }}
      >
	    {'>'}
      </button>
	  <button
        className="page-button"
        onClick={() => {
          props.handler(props.pages);
        }}
      >
	    {'>>'}
      </button>
    </div>
  }
  </div>);
}

export default function History() {
  const [cookies] = useCookies([
    "access_token",
    "username",
  ]);
  const [mdata, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [ids, setIds] = useState(null);
  const elementsPerPage = 5;
  const maxPages = 5;
  var pages = 1;
  const navigate = useNavigate();

  if (cookies.access_token == null) {
    navigate("/login");
  }
  const updateState = (val) => {
	if (val < 1) {
		setPage(1);
	} else if (val > pages) {
		setPage(pages);
	}
    else {
		setPage(val);
	}
  };
  const deleteRes = async function (id) {
    var requestOptions = {
      mode: "cors",
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + cookies.access_token
      },
    };
    await fetch("/api/delete_result?id=" + id, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        var bid = [...ids];
        var index = bid.indexOf(id)
        if (index !== -1) {
          bid.splice(index, 1);
        }
        setIds(bid);
        pages = Math.ceil(ids.length / elementsPerPage);
        if (page > Math.ceil(bid.length / elementsPerPage))
          updateState(page - 1);
      });
  }

  const downloadFile = async function (id) {
    var name = "";
    var content = "";
    var requestOptions = {
      mode: "cors",
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + cookies.access_token,
        "Content-Type": "application/json",
      },
    };
    await fetch("/api/get_file?id=" + id, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        name = data.file.filename;
        content = data.file.content;
      });
    const link = document.createElement('a');
    link.setAttribute('download', name.slice(37));
    var extension = name.slice(-3);
    if(extension === "mp3"){
      link.setAttribute('href', 'data:audio/mpeg;charset=utf-8;base64,' + encodeURIComponent(content));
    } else if (extension === "ogg") {
      link.setAttribute('href', 'data:application/ogg;charset=utf-8;base64,' + encodeURIComponent(content));
    } else if (extension === "wav") {
      link.setAttribute('href', 'data:audio/x-wav;charset=utf-8;base64,' + encodeURIComponent(content));
    } else {
      link.setAttribute('href', 'data:audio/x-flac;charset=utf-8;base64,' + encodeURIComponent(content));
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    async function GI() {
      var requestOptions = {
        mode: "cors",
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + cookies.access_token,
          "Content-Type": "application/json",
        },
      };
      await fetch("/api/get_saves", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          var bId = data.ids.sort(function (a, b) {
            return b - a;
          });
          setIds(bId);
        });
    }

    async function GR() {
      var curIds = ids.slice(
        (page - 1) * elementsPerPage,
        page * elementsPerPage
      );
      var resData = { data: [] };

      var requestOptions = {
        mode: "cors",
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + cookies.access_token,
          "Content-Type": "application/json",
        },
      };

      const requests = curIds.map(async (id) => {
        var name;

        await fetch("/api/get_file_name?id=" + id, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            name = data.filename;
          });
        await fetch("/api/get_result?id=" + id, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            resData.data.push({
              id: id,
              name: name,
              bpm: data.bpm,
              tone: data.tone,
              happiness: data.happiness,
              energy: data.energy,
              dance: data.dance,
              version: data.version,
              date: data.date.slice(5, 16),
            });
          });
      });
      Promise.all(requests).then(() => {
        resData.data.sort(function (a, b) {
          return b.id - a.id;
        });
        setData(resData);
      });
    }
    if (cookies.access_token == null) {
      navigate("/login");
    } else if (ids === null) {
      GI();
    } else {
      GR();
    }
  }, [page, ids, cookies.access_token, navigate]);

  if (mdata === null) {
    return (
      <main className="page-content history-page center-page-align inside-padding">
        <h1 id="load">Loading...</h1>
      </main>
    );
  } else {
    pages = Math.ceil(ids.length / elementsPerPage);
    return (
      <main className="page-content history-page inside-padding">
        <h2>History!</h2>
        <Table 
		      data={mdata.data} 
          deleteRes={deleteRes}
          downloadFile={downloadFile}
		    />
        <Footer 
          handler={updateState}
          curPage={page}
          elems={elementsPerPage}
          pages={pages}
          maxPages={maxPages}
        />
      </main>
    );
  }
}