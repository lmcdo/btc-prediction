

import { tsvParse } from "d3-dsv"
import { timeParse } from "d3-time-format";



const parseDate = timeParse("%Y-%m-%d");
function parseData(parse) {
	return function(d) {
		
		d.date = parse(d.date);
		//console.log(d.date);
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;
		
		
		return d;
		};
	}

export function getData() {
	const promiseMSFT = fetch("http://127.0.0.1:5000/static/coinbase.tsv")
		.then(response => response.text())
		.then(data => tsvParse(data, parseData(parseDate)))
	return promiseMSFT;
	  }



