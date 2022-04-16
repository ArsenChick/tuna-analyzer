import '../scss/history.scss';
import React, { useState, useEffect, useCallback } from 'react';

function Result(props){
    return (
	<>
        <tr>    
			<td>{props.date}</td>
			
			<td>{props.name}</td>
		
            <td>{props.bpm}</td>
		
            <td>{props.tone}</td>
		
            <td>{props.dance}</td>
		
            <td>{props.energy}</td>
		
			<td>{props.happiness}</td>
		
			<td>{props.version}</td>
			
			<td>{<button style={{backgroundColor: 'lightblue', display: 'block', margin: 'auto'}}>▶</button>}</td>
			<td>{<button style={{backgroundColor: 'lightgreen', display: 'block', margin: 'auto'}}>Ы</button>}</td>
			<td>{<button style={{backgroundColor: 'red', display: 'block', margin: 'auto'}}>X</button>}</td>
        </tr>
	</>
    )
}

function DataList(props) {
	let results = props.data.map((res, i)=> {
        return <Result key={i} bpm={res.bpm} name={res.name} tone={res.tone} dance={res.dance} energy={res.energy} happiness={res.happiness} version={res.version} date={res.date}/>
    });
    if(results.length < 1){
        return <div>No results were yet saved</div>
    }

    return(
		<>
			{results}
		</>
	);
}

function Table(props) {
	return (
      <div>
        <table>
            <tr>
				<th>Date</th>
				<th>Name</th>
                <th>BPM</th>
                <th>Tone</th>
                <th>Danceability</th>
                <th>Energy</th>
				<th>Happiness</th>
				<th>Version</th>
				
				<th style={{textAlign: 'center'}}>Play</th>
				<th style={{textAlign: 'center'}}>Upload</th>
				<th style={{textAlign: 'center'}}>Delete</th>
            </tr>
			<DataList data={props.data} />
        </table>
	  </div>);
}

function PageButton(props){
	if(props.curPage === props.id){
		return (
		<>
			<button style={{backgroundColor: 'lightgrey', display: 'inline-block'}} onClick={()=>{props.handler(props.id);}}>{props.id}</button>
		</>
		)
	}
    return (
	<>
        <button style={{display: 'inline-block'}} onClick={()=>{props.handler(props.id);}}>{props.id}</button>
	</>
    )
}
function Footer(props) {
	var pageList = [];
	for(var i = 0; i < props.pages; i++){
		pageList.push(i + 1);
	}
	let buttons = pageList.map((i)=> {
        return <PageButton id={i} handler={props.handler} curPage={props.curPage}/>
    });
	return (
      <div style={{ width:'100%', textAlign: 'center'}}>
	   {buttons}
	  </div>);
}



export default function History() {
  const [mdata, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [ids, setIds] = useState(null);
  const [bear, setBear] = useState(null);
  const elementsPerPage = 5;
  var pages = 1;
  
  const updateState = (val) => {
    setPage(val);
  };
  
  useEffect(() => {
	  async function GL(user, pass) {
		
		var m = JSON.stringify({
			"username": user, 
			"password": pass, 
		});
		var requestOptions = {
			mode: 'cors',
			method: 'POST',
			headers : {
				'Accept': 'application/json',
				'Content-Type' : 'application/json'
			},
			body: m
		};
		await fetch("/api/login", requestOptions)
		.then(response => response.json())
		.then(data => {
			setBear(data.access_token);
		});
    }
    async function GI() {
		var requestOptions = {
			mode: 'cors',
			method: 'GET',
			headers : {
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + bear,
				'Content-Type' : 'application/json'
			}
		};
		await fetch("/api/get_saves", requestOptions)
		.then(response => response.json())
		.then(data => {
			setIds(data.ids);
		});
    }
	
	async function GR() {
		var curIds = ids.slice((page - 1) * elementsPerPage, page * elementsPerPage);
		var resData = {"data": []};

		var requestOptions = {
			mode: 'cors',
			method: 'GET',
			headers : {
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + bear,
				'Content-Type' : 'application/json'
			}
		};
		
		const requests = curIds.map(async (id) => {
			var name;
			
			await fetch('/api/get_file?id=' + id , requestOptions)
			.then(response => response.json())
			.then(data => {
			name = data.file.filename;
			});
			name = name.slice(37);
			await fetch('/api/get_result?id=' + id , requestOptions)
			.then(response => response.json())
			.then(data => {
				resData.data.push({
					"id": id,
					"name": name,
					"bpm": data.bpm,
					"tone": data.tone,
					"dance": data.dance,
					"energy": data.energy,
					"happiness": data.happiness,
					"version": data.version,
					"date": data.date.slice(5,16)
					});
			});
		});
		Promise.all(requests).then(() => {
			resData.data.sort(function (a, b) {
			  return a.id - b.id;
			});
			setData(resData);
		});
		
    }
	if(bear === null) {
		GL("a", "a");
	}
	else if(ids === null){
		GI();
	} else {
		GR();
	}
	
  }, [page, ids, bear])

  if(mdata === null) {
	  return (
	  <main className="page-content history-page">
	  <h1>Loading...</h1>
	  </main>);
  }
  else {
	  pages = Math.ceil(ids.length / elementsPerPage);
  return (
    <main className="page-content history-page">
		<h2>History!</h2>
		<Table data={mdata.data} />
		<Footer handler={updateState} curPage={page} elems={elementsPerPage} pages={pages}/>
    </main>
  );
  }
}
