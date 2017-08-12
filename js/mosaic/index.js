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
