(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

(() => {
  const flipImageEl = document.getElementById("flip-image");
  const imageMosaicEl = document.getElementById("image-mosaic");
  const imageMosaicContainer = document.getElementById("image-mosaic-container");
  const imagePreviewContainer = document.getElementById("image-preview-container");
  const imagesContainer = document.getElementById("images-container");
  const loadingSpinnerContainer = document.getElementById("loading-spinner-container");
  const turnToMosaicButtonEl = document.getElementById("turn-mosaic-button");

  const clear = () => {
    flipImageEl.style["display"] = "none";
    imageMosaicEl.innerHTML = "";
    imageMosaicContainer.style["display"] = "none";
    imagePreviewContainer.style["display"] = "none";
    imagesContainer.style["display"] = "none";
    loadingSpinnerContainer.style["display"] = "none";
    turnToMosaicButtonEl.disabled = true;
  };

  module.exports = clear;
})();

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";

((window) => {
  const clear = require("./clear.js");
  const imageLib = require("./image-lib.js");

  const imageMosaicContainer = document.getElementById("image-mosaic-container");
  const imagePreviewEl = document.getElementById("image-preview");
  const imagePreviewContainer = document.getElementById("image-preview-container");
  const imagesContainer = document.getElementById("images-container");
  const turnToMosaicButtonEl = document.getElementById("turn-mosaic-button");

  const maxFileSize = 256000; //Arbitrary setting to 250kB
  const maxWidth = Math.round(window.screen.availWidth * (1 - 0.08));

  const displayImage = async (evt) => {
    try {
      clear();

      const file = evt.target.files[0];
      const fsize = file.size;
      if(fsize > maxFileSize){
        alert("The image size is too big!");
        return null;
      }

      const srcValue = await _getSrc(file);
      const imageData = await imageLib.getImageInformation(srcValue);
      const [image, width, height] = imageData;
      const [imageIdealWidth, imageIdealHeight] = imageLib.getIdealImageSize(width, height);

      // We don't want the image to be wider than the window width
      if(imageIdealWidth > maxWidth){
        const msg = `The image is too wide for your screen`;
        alert(msg);
        throw new Error(msg);
      }

      imagePreviewEl.src = srcValue;
      imagePreviewEl.style["width"] = `${imageIdealWidth}px`;
      imagePreviewEl.style["height"] = `${imageIdealHeight}px`;

      _setContainerHeight(imageIdealHeight);

      imagesContainer.style.removeProperty("display");
      imagePreviewContainer.style.removeProperty("display");

      turnToMosaicButtonEl.disabled = false;
      turnToMosaicButtonEl.style.removeProperty("display");
    } catch (e) {
      console.error(e);
      clear();
    }
  };

  const _getSrc = async (file) => {
    const promise = new Promise((resolve, reject) => {
      if(!file) return reject("No File");

      const reader = new FileReader();
      reader.onload = (e) => {
        const srcValue = e.target.result;
        return resolve(srcValue);
      };
      reader.readAsDataURL(file);
    });
    return promise;
  };

  const _setContainerHeight = (imageIdealHeight) => {
    const containerHeight = imageIdealHeight + 100;
    imageMosaicContainer.style["height"] = `${containerHeight}px`;
    imagePreviewContainer.style["height"] = `${containerHeight}px`;
  };

  module.exports = displayImage;
})(window);

},{"./clear.js":1,"./image-lib.js":6}],4:[function(require,module,exports){
"use strict";

(() => {
  const flipImageEl = document.getElementById("flip-image");
  const imageMosaicEl = document.getElementById("image-mosaic");
  const imageMosaicContainer = document.getElementById("image-mosaic-container");
  const loadingSpinnerContainer = document.getElementById("loading-spinner-container");
  const turnToMosaicButtonEl = document.getElementById("turn-mosaic-button");

  const displayMosaic = (tiles, numRows, numCols, imageWidth) => {
    loadingSpinnerContainer.style["display"] = "none";
    imageMosaicContainer.style.removeProperty("display");

    //One of the projects constraints is to render the mosaic one row at a time, from top to bottom
    for(let rowNumber = 0; rowNumber < numRows; rowNumber++){
      const rowArray = tiles.slice(rowNumber*numCols, rowNumber*numCols+numCols);

      const line = document.createElement("div");
      line.innerHTML = rowArray.join("");
      line.setAttribute("style","height:" + TILE_HEIGHT + "px; min-width:" + imageWidth + "px;");

      imageMosaicEl.appendChild(line);
    }

    turnToMosaicButtonEl.style["display"] = "none";
    flipImageEl.style.removeProperty("display");
  };

  module.exports = displayMosaic;
})();

},{}],5:[function(require,module,exports){
"use strict";

(() => {
  const imageMosaicContainer = document.getElementById("image-mosaic-container");
  const imagePreviewContainer = document.getElementById("image-preview-container");

  const flipImage = () => {
    if(!imageMosaicContainer.style.display){
      imageMosaicContainer.style["display"] = "none";
      imagePreviewContainer.style.removeProperty("display");
    } else {
      imagePreviewContainer.style["display"] = "none";
      imageMosaicContainer.style.removeProperty("display");
    }
  };

  module.exports = flipImage;
})();

},{}],6:[function(require,module,exports){
"use strict";

((window) => {
  const getIdealImageSize = (width, height) => {
    let imageIdealWidth = TILE_WIDTH * Math.round(width / TILE_WIDTH);
    let imageIdealHeight = TILE_HEIGHT * Math.round(height / TILE_HEIGHT);
    return [imageIdealWidth, imageIdealHeight];
  };

  const getImageInformation = async (srcValue) => {
    const promise = new Promise(function(resolve, reject){
      if(!srcValue) return reject("No Source Value");

      let image = new Image();
      image.onload = function() {
        return resolve([image, this.width, this.height]);
      };
      image.src = srcValue;
    });
    return promise;
  };

  const getImagePieces = (image, numCols, numRows) => {
    const imagePiecesByRow = [];
    for(let y = 0; y < numRows; y++) {
      for(let x = 0; x < numCols; x++) {
        let canvas = document.createElement('canvas');
        canvas.width = TILE_WIDTH;
        canvas.height = TILE_HEIGHT;
        let context = canvas.getContext('2d');
        context.width = canvas.width;
        context.height = canvas.width;
        context.drawImage(image, x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 0, 0, canvas.width, canvas.height);
        imagePiecesByRow.push(context);
      }
    }
    return imagePiecesByRow;
  };

  const getImagePiecesAvgColor = (imagePieces) => {
    return imagePieces.map((piece) => {
      const colors = _getColors(piece);
      return _rgbToHex(colors.r, colors.g, colors.b);
    });
  };

  const _getColors = (c) => {
    let pixels, r, g, b, a, count;
    r = g = b = a = count = 0;
    pixels = c.getImageData(0, 0, c.width, c.height);

    for(let i = 0, data = pixels.data; i < data.length; i += 4) {
      a = data[i + 3]; // alpha
      // skip pixels >50% transparent
      if (a < (255 / 2)) continue;

      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    return {
      r: Math.round(r/count),
      g: Math.round(g/count),
      b: Math.round(b/count)
    };
  };

  const _rgbToHex = (r, g, b) => {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  module.exports = {
    getIdealImageSize: getIdealImageSize,
    getImageInformation: getImageInformation,
    getImagePieces: getImagePieces,
    getImagePiecesAvgColor: getImagePiecesAvgColor
  }
})(window);

},{}],7:[function(require,module,exports){
"use strict";

//IIFE to avoid polluting the global space
((window, document) => {
  //Checking whether browser fully supports all File API
	if (window.File && window.FileReader && window.FileList) {
    const clear = require("./clear.js");
    const displayImage = require("./display-image.js");
		const turnToMosaic = require("./turn-to-mosaic.js");
		const flipImage = require("./flip-image.js");

    clear();

    //note: 3 functionalities:
    //1-Display the image preview when picked.
    const imageInputEl = document.getElementById("image-input");
    imageInputEl.addEventListener("change", displayImage, false);

    //2-Turn the image into a mosaic and render it from top to bottom when clicked.
		const turnToMosaicButtonEl = document.getElementById("turn-mosaic-button");
    turnToMosaicButtonEl.addEventListener("click", turnToMosaic, false);

    //3-When we have both the preview and mosaic, we offer the user the ability to flip between both to see the differences.
		const flipImageEl = document.getElementById("flip-image");
		flipImageEl.addEventListener("click", flipImage, false);
  } else {
    let containerEl = document.getElementById("container");
    containerEl.style["display"] = "none";

		let titleEl = document.createElement("h1");
		titleEl.innerHTML = "Please upgrade your browser! Some features are needed...";
		titleEl.classList.add("dynamic-font", "text-center", "white-color");
		document.body.appendChild(titleEl);
	}
})(window, document);

},{"./clear.js":1,"./display-image.js":3,"./flip-image.js":5,"./turn-to-mosaic.js":8}],8:[function(require,module,exports){
"use strict";

((window) => {
  const clear = require("./clear.js");
  const imageLib = require("./image-lib.js");
  const dataService = require("./data-service.js");
	const displayMosaic = require("./display-mosaic.js");

  const flipImageEl = document.getElementById("flip-image");
  const imageMosaicEl = document.getElementById("image-mosaic");
  const imageMosaicContainer = document.getElementById("image-mosaic-container");
  const imagePreviewEl = document.getElementById("image-preview");
  const imagePreviewContainer = document.getElementById("image-preview-container");
  const loadingSpinnerContainer = document.getElementById("loading-spinner-container");
  const turnToMosaicButtonEl = document.getElementById("turn-mosaic-button");

  const turnToMosaic = async () => {
    try {
      turnToMosaicButtonEl.disabled = true;
      turnToMosaicButtonEl.style["display"] = "none";

      const imageWidth = parseInt(imagePreviewEl.style["width"]);
      const imageHeight = parseInt(imagePreviewEl.style["height"]);
      imagePreviewContainer.style["display"] = "none";

      loadingSpinnerContainer.style.removeProperty("display");
      imageMosaicEl.innerHTML = "";

      const numCols = Math.round(imageWidth / TILE_WIDTH);
      const numRows = Math.round(imageHeight / TILE_HEIGHT);
      const imagePiecesByRow = imageLib.getImagePieces(imagePreviewEl, numCols, numRows);
      const imagePiecesAverageColor = imageLib.getImagePiecesAvgColor(imagePiecesByRow);
      const tiles = await dataService.fetchColors(imagePiecesAverageColor);
      displayMosaic(tiles, numRows, numCols, imageWidth);
    } catch (e) {
      console.error(e);
      clear();
    }
  };

  module.exports = turnToMosaic;
})(window);

},{"./clear.js":1,"./data-service.js":2,"./display-mosaic.js":4,"./image-lib.js":6}]},{},[7]);
