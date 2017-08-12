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
