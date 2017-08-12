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
