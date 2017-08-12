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
