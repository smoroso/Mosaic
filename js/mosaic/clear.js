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
