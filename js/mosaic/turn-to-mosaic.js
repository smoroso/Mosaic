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
