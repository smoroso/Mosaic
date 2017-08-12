"use strict";

(() => {
	const fetchColors = async (imagePiecesAverageColor) => {
		let promises = imagePiecesAverageColor.map((pieceAvgColor) => {
			return memoizedFetchColor(pieceAvgColor);
		});
		return Promise.all(promises);
	}

		const _fetchColor = async (hex) => {
			let promise = new Promise((resolve, reject) => {
				let xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = () => {
					if (xhttp.readyState == 4 && xhttp.status == 200) {
						resolve(xhttp.responseText);
					}
				};
				xhttp.open("GET", "/color/" + hex, true);
				xhttp.send();
			});
			return promise;
		}

	// Memoize an expensive function by storing its results.
	const _memoize = (func) => {
		const cache = {};

		return async function(){
			let arg_str = JSON.stringify(arguments);
			if(!cache[arg_str]){
				cache[arg_str] = await func.apply(func, arguments);
			}
			return cache[arg_str];
		}
	}

	const memoizedFetchColor = _memoize(_fetchColor);

	module.exports = {
		fetchColors: fetchColors
	};
})();
