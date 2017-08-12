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
