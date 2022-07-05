import "../scss/history/history.scss";
import React, { useState, useEffect, useCallback, useRef, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import * as Icon from "react-feather";
import { headerProps } from "./constants";
import { MetricBar } from "./ui/MetricBar";


function Result(props) {
  return (
    <>
      <tr>
        <td>{props.data.date}</td>
        <td>{props.data.name}</td>
        <td>{props.data.bpm}</td>
        <td>{props.data.tone}</td>
        <td><MetricBar value={props.data.happiness} /></td>
        <td><MetricBar value={props.data.energy} /></td>
        <td><MetricBar value={props.data.dance} /></td>
        <td>{props.data.version}</td>
        <td>
          <button
            id={"download" + props.data.id}
            className="result-button download-button"
            onClick={() => props.downloadFile(props.data.id)}
          >
            <Icon.Download size={20} />
          </button>
        </td>
        <td>
          <button
            id={"delete" + props.data.id}
            className="result-button delete-button"
            onClick={() => props.deleteRes(props.data.id)}
          >
            <Icon.Trash2 size={20} />
          </button>
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
        data={res}
        deleteRes={props.deleteRes}
	    	downloadFile={props.downloadFile}
      />
    );
  });
  if (results.length < 1)
    return (
      <div id="noSaves" className="center-page-align inside-padding">
        No results saved or matching your search query
      </div>);
  return (<>{results}</>);
}

function TableHeader(props) {
  let icon = null;
  if (props.order === "desc") icon = <Icon.ArrowDown size={20} />
  else if (props.order === "asc") icon = <Icon.ArrowUp size={20} />

  return (
    <th className={`title ${props.className}`}>
      <span onClick={() => {
        if (props.sortHandler) props.sortHandler(props.bdParamName)
      }}>
        {props.metric}
      </span>
      {props.subtitle &&
        <>
          <span className="question-sign cursor-point">(?)</span>
          <ul className="sub-title_list">
            <li className="sub-title">{props.subtitle}</li>
          </ul>
        </>
      }
      {props.active && icon}
    </th>
  );
}

function Table(props) {
  return (
    <div>
      <table id="resultTable" className="results-history">
        <thead>
          <tr className="titles">
            {headerProps.map((header, index) => 
              <TableHeader
                key={`${header.metric} ${index}`}
                metric={header.metric}
                className={header.className}
                subtitle={header.subtitle}
                bdParamName={header.bdParamName}
                active={props.activeSort === header.bdParamName}
                order={props.sortOrder}
                sortHandler={header.sortable ? props.sortHandler : undefined}
              />
            )}
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
  return (
    <button
      id={"page" + props.id}
      className={`page-button num-page ${props.active ? "active" : ""}`}
      onClick={() => props.handler(props.id)}
    >
      {props.id}
    </button>
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
      <PageButton id={i} handler={props.handler} active={i === props.curPage} />
    );
  });

  return (
    <div id="paginationFooter">
    {pageList.length > 0 &&
      <div className="page-buttons">
        <button
          className="page-button"
          onClick={() =>  props.handler(1)}
        >
          {'<<'}
        </button>
        <button
          className="page-button"
          onClick={() => props.handler(props.curPage - 1)}
        >
          {'<'}
        </button>
        {buttons}
        <button
          className="page-button"
          onClick={() => props.handler(props.curPage + 1)}
        >
          {'>'}
        </button>
        <button
          className="page-button"
          onClick={() => props.handler(props.pages)}
        >
          {'>>'}
        </button>
      </div>
    }
    </div>
  );
}

export default function History() {
  const [cookies] = useCookies([
    "access_token",
    "username",
  ]);
  const navigate = useNavigate();

  const [mdata, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [ids, setIds] = useState(null);
  const [searchParams, setSearchParams] = useState({
    sort: "date",
    order: "desc",
    from: null,
    until: null,
  });

  const [dateFrom, setDateFrom] = useState(null);
  const [dateUntil, setDateUntil] = useState(null);

  const elementsPerPage = 5;
  const maxPages = 5;
  var pages = 1;

  const updatePage = (val) => {
    if (val < 1) setPage(1);
    else if (val > pages) setPage(pages);
    else setPage(val);
  };

  const wrongDates = useMemo(() => {
    if (dateFrom !== null && dateUntil !== null) {
      const from = new Date(dateFrom);
      const until = new Date(dateUntil);
      return from > until;
    }
    return false;
  }, [dateFrom, dateUntil]);

  const updateSortOrder = useCallback((newSortMetric) => {
    setPage(1);
    if (newSortMetric === searchParams.sort) {
      const newOrder = searchParams.order === "desc" ? "asc" : "desc";
      setSearchParams({...searchParams, order: newOrder});
    } else {
      setSearchParams({...searchParams, sort: newSortMetric, order: "desc"});
    }
  }, [searchParams]);

  const updateDateFilter = useCallback(() => {
    if (dateFrom === searchParams.from
      && dateUntil === searchParams.until) 
      return;
    setPage(1);
    setSearchParams({
      ...searchParams,
      from: dateFrom,
      until: dateUntil,
    });
  }, [dateFrom, dateUntil, searchParams]);

  const resetDateFilter = useCallback(() => {
    if (searchParams.from !== null || searchParams.until !== null) {
      setPage(1);
      setSearchParams(prevSearchParams => {
        return { ...prevSearchParams, from: null, until: null }
      });
    }
    setDateFrom(null);
    setDateUntil(null);
  }, [searchParams]);
  
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
      .then((_) => {
        var bid = [...ids];
        var index = bid.indexOf(id)
        if (index !== -1) bid.splice(index, 1);
        const newPages = Math.ceil(bid.length / elementsPerPage);
        pages = newPages;
        if (page > newPages) updatePage(page - 1);
        setIds(bid);
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
    if (cookies.access_token == null) navigate("/login");
  }, [cookies.access_token, navigate]);

  useEffect(() => {
    async function getIdsFromBackend() {
      var requestOptions = {
        mode: "cors",
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + cookies.access_token,
          "Content-Type": "application/json",
        },
      };

      let reqSearchParams = new URLSearchParams(searchParams);
      let keysForDeletion = [];
      reqSearchParams.forEach((value, key) => {
        if (value === "null") {
          keysForDeletion.push(key);
        }
      });
      keysForDeletion.forEach(key => {
        reqSearchParams.delete(key);
      });

      await fetch("/api/get_saves?" + reqSearchParams, requestOptions)
        .then((response) => response.json())
        .then((data) => setIds(data.ids));
    }
    getIdsFromBackend();
  }, [
    cookies.access_token,
    searchParams,
  ]);

  useEffect(() => {
    async function getResultsFromBackend() {
      if (ids !== null) {
        if (ids.length === 0) {
          setData([]);
          return;
        }

        var curIds = ids.slice(
          (page - 1) * elementsPerPage,
          page * elementsPerPage
        );

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
          return fetch("/api/get_result?id=" + id, requestOptions)
            .then((response) => response.json())
            .then((data) => {
              return {
                id: id,
                name: data.filename,
                bpm: data.bpm,
                tone: data.tone,
                happiness: data.happiness,
                energy: data.energy,
                dance: data.dance,
                version: data.version,
                date: data.date.slice(5, 16),
              };
            });
        });
        Promise.all(requests).then((results) => {
          setData(results);
        });
      }
    }
    getResultsFromBackend();
  }, [cookies.access_token, ids, page]);

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
        <div className="history-headbar">
          <h2>History</h2>
          <div className="date-search">
            <div className="pickers">
              <label for="dateFrom">From:</label>
              <input
                type="date"
                id="dateFrom"
                value={dateFrom ? dateFrom : ""}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <label for="dateTo">To:</label>
              <input
                type="date"
                id="dateTo"
                value={dateUntil ? dateUntil : ""}
                onChange={(e) => setDateUntil(e.target.value)}
              />
              {wrongDates &&
                <span className="error">
                  Beginning of the date span from must be lesser or equal than its end!
                </span>
              }
            </div>
            <button
              disabled={ dateFrom === null && dateUntil === null }
              className="result-button search-button"
              onClick={resetDateFilter}
            >
              <Icon.X size={20} />
            </button>
            <button
              disabled={wrongDates}
              className="result-button search-button"
              onClick={updateDateFilter}
            >
              <Icon.Search size={20} />
            </button>
          </div>
        </div>
        <Table 
		      data={mdata} 
          deleteRes={deleteRes}
          downloadFile={downloadFile}
          activeSort={searchParams.sort}
          sortOrder={searchParams.order}
          sortHandler={updateSortOrder}
		    />
        <Footer 
          handler={updatePage}
          curPage={page}
          elems={elementsPerPage}
          pages={pages}
          maxPages={maxPages}
        />
      </main>
    );
  }
}