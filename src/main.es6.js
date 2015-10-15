/* jshint esnext: true */

import React             from 'react';
import ReactDOM          from 'react-dom';
import CypherQuerier     from './libs/cypher-querier/CypherQuerier.es6.js';
import CypherConsole     from './components/cypher-console/react-CypherConsole.es6.js';
import AsyncPipe         from './libs/async-pipe/AsyncPipe.es6.js';

let {Component} = React;

export default function main() {

	let cypherQuerier = new CypherQuerier();
	let consoleUrl = CypherQuerier.getConsoleUrl(
		'http://neo4j-console-22.herokuapp.com/', 
		'none', 
		'none', 
		'\n\nUse the play/edit buttons to run the queries!'
	);

	let rConsole = ReactDOM.render(
		(<wg-app>
			<CypherConsole onLoaded={onCypherReady} consoleUrl={consoleUrl} />
			<div style={{height: '400', overflow: 'scroll'}}>
				<pre><code><div id="console-ouput"/></code></pre>
			</div>
		</wg-app>), 
		document.getElementById('app')
	);

	function onCypherReady(consoleFrame) {
    	cypherQuerier.consoleFrame(consoleFrame);
	    consoleFrame.addEventListener('load', runQueries);
	}

	function runQueries() {
		new AsyncPipe(function(next, acc) {
			let output = document.getElementById('console-ouput');

			function write(text) {
				console.log(text);
				let p = document.createElement('p');
				p.innerHTML = text;
				output.appendChild(p);
			}
			return [
				function() {
					var query = `LOAD CSV WITH HEADERS FROM "https://data.govt.nz/search/csv/?q=&CategoryID=0"
						  AS line
						WITH line LIMIT 50
						CREATE (t:Title {name:line.Title})
						CREATE (e:Description {name:line.Description})
						MERGE (u:Url {name:line.Url})
						CREATE (t)-[r1:PUBLISHED_AT]->(u)
						MERGE (a:Agency {name:line.Agency})
						CREATE (t)-[r2:PUBLISHED_BY]->(a)
						MERGE (d:Type {name:line.DatasetType})
						CREATE (t)-[r3:TYPE]->(d)
						MERGE (l:Licence {name:line.Licence})
						CREATE (t)-[r4:DESCRIPTION]->(e)
						FOREACH (fmt IN split(line.Format, ",")| MERGE (f:Format { name: lower(fmt) })
						         CREATE (t)-[r5:FORMAT]->(f))
						CREATE (t)-[r6:LICENCE]->(l);
					`;

					write('-- QUERY --');
					query = query.replace(/^\s+/gm, '');
					write(`<span style="color: blue">${query}</span>`);

					cypherQuerier.post(query, false).then(function(err, d) {
						write('-- CREATED --')
						write(d.error || d.result);
						next();
					});
				},
				function() {
					var query = `MATCH (n)-[r]-(m) RETURN n,r,m`;
					write('-- QUERY --');
					write(`<span style="color: blue">${query}</span>`);
					cypherQuerier.post(query, false).then(function(err, d){ 
						write('-- MATCHED --');
						write(d.error || d ? JSON.stringify(d.json, null, 2) : d);
						next();
					});				
				},
				function() {
					// populating the console
					var query = `MATCH (l:Licence)<--(t:Title)-->(a:Agency)
						RETURN l.name AS Licence, collect(DISTINCT a.name)`;
					cypherQuerier.post(query, true).then(function(err, d){ 
						next();
					});				
				}
			]
		}).then(function(acc) {
			console.log('[PIPE.ENDS]', acc);
		});		
	}

}
