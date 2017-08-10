"use strict";

(function(window, document){//To avoid polluting the global space
	const maxFileSize = 256000; //Arbitrary setting to 250kB

	let _flipImageElement,
	_imageInputElement,
	_imageMosaicElement,
	_imageMosaicElementContainer,
	_imagePreviewElement,
	_imagePreviewElementContainer,
	_imagesContainerElement,
	_loadingSpinnerElement,
	_loadingSpinnerElementContainer,
	_turnToMosaicButtonElement;

	let solutionWorker;

	let _image;
	let _imageWidth, _imageHeight;
	let numCols, numRows;

	//Checking whether browser fully supports all File API
	if (window.File && window.FileReader && window.FileList) {
		initialisation();

		function initialisation(){
			//Getting all the DOM useful elements:
			_flipImageElement = document.getElementById("flip-image");
			_imageInputElement = document.getElementById("image-input");
			_imageMosaicElement = document.getElementById("image-mosaic");
			_imageMosaicElementContainer = document.getElementById("image-mosaic-container");
			_imagePreviewElement = document.getElementById("image-preview");
			_imagePreviewElementContainer = document.getElementById("image-preview-container");
			_imagesContainerElement = document.getElementById("images-container");
			_loadingSpinnerElement = document.getElementById("loading-spinner");
			_loadingSpinnerElementContainer = document.getElementById("loading-spinner-container");
			_turnToMosaicButtonElement = document.getElementById("turn-mosaic-button");

			numCols = numRows = 0;

			if(window.Worker){
				//If the browser supports it, we use a worker to fetchColors in parallel.
				//That way we try to prevent the screen from freezing.
				solutionWorker = new Worker("js/worker.js");
				solutionWorker.addEventListener("message", displayMosaic, false);
			}else{
				//Otherwise we dynamically injects the script containins the fetchColors code to be used later on.
				let script = document.createElement("script");
				script.type="text/javascript";
				script.src="js/dataService.js";
				document.body.appendChild(script);
			}

			//note: 3 functionalities:
			//1-Display the image preview when picked.
			_imageInputElement.addEventListener("change", displayImage, false);
			//2-Turn the image into a mosaic and render it from top to bottom when clicked.
			_turnToMosaicButtonElement.addEventListener("click", turnToMosaic, false);
			//3-When we have both the preview and mosaic, we offer the user the ability to flip between both to see the differences.
			_flipImageElement.addEventListener("click", flipImage, false);

			clear();
		}

		////////////////////

		function clear(){
			_flipImageElement.setAttribute("style", "display:none;");
			_imageMosaicElement.innerHTML = "";
			_imageMosaicElementContainer.setAttribute("style", "display:none;");
			_imagePreviewElementContainer.setAttribute("style", "display:none;");
			_imagesContainerElement.setAttribute("style", "display:none;");
			_loadingSpinnerElementContainer.setAttribute("style", "display:none;");
			_turnToMosaicButtonElement.disabled = true;
		}

		function displayImage(evt) {
			clear();

			let file = evt.target.files[0];
			let fsize = file.size;
			if(fsize > maxFileSize){
				alert("The image size is too big!");
				return null;
			}

			return displayImagePreview(file).then(function(srcValue){
				return getImageInformation(srcValue);
			}).then(function(imageData){
				_image = imageData.shift();
				let idealImageSize = getIdealImageSize(imageData);
				_imageWidth = idealImageSize[0];
				_imageHeight = idealImageSize[1];
				_imagePreviewElement.width = _image.width = _imageWidth;
				_imagePreviewElement.height = _image.height = _imageHeight;

				_imagesContainerElement.style.removeProperty("display");
				_imagePreviewElementContainer.style.removeProperty("display");
				_turnToMosaicButtonElement.disabled = false;
				_turnToMosaicButtonElement.style.removeProperty("display");
			}).catch(function(error){
				console.log(error);
				clear();
			});
		}

		function displayImagePreview(file){
			let promise = new Promise(function(resolve, reject){
				if(!file) return reject("No File");

				let reader = new FileReader();
				reader.onload = function (e) {
					let srcValue = e.target.result;
					_imagePreviewElement.src = srcValue;
					return resolve(srcValue);
				};
				reader.readAsDataURL(file);
			});
			return promise;
		}

		function displayMosaic(result){
			_loadingSpinnerElementContainer.setAttribute("style", "display:none;");
			_imageMosaicElementContainer.style.removeProperty("display");

			let finalArray = result.data || result;
			//One of the projects constraints is to render the mosaic one row at a time, from top to bottom
			for(let rowNumber = 0; rowNumber < numRows; rowNumber++){
				let rowArray = finalArray.slice(rowNumber*numCols, rowNumber*numCols+numCols);

				let line = document.createElement("div");
				line.innerHTML = rowArray.join("");
				line.setAttribute("style","height:" + TILE_HEIGHT + "px; min-width:" + _imageWidth + "px;");

				_imageMosaicElement.appendChild(line);
			}

			_turnToMosaicButtonElement.setAttribute("style", "display:none;");
			_flipImageElement.style.removeProperty("display");
		}

		function flipImage(){
			if(!_imageMosaicElementContainer.style.display){
				_imageMosaicElementContainer.setAttribute("style", "display:none;");
				_imagePreviewElementContainer.style.removeProperty("display");
			} else {
				_imagePreviewElementContainer.setAttribute("style", "display:none;");
				_imageMosaicElementContainer.style.removeProperty("display");
			}
		}

		function turnToMosaic(){
			_turnToMosaicButtonElement.disabled = true;
			_turnToMosaicButtonElement.setAttribute("style", "display:none;");

			_imagePreviewElementContainer.setAttribute("style", "display:none;");

			_loadingSpinnerElementContainer.style.removeProperty("display");

			_imageMosaicElement.innerHTML = "";

			numCols = Math.round(_imageWidth / TILE_WIDTH);
			numRows = Math.round(_imageHeight / TILE_HEIGHT);

			let imagePiecesByRow = getImagePieces(_image, numCols, numRows);
			let imagePiecesAverageColor = getImagePiecesAvgColor(imagePiecesByRow, numCols);

			//If the browser supports web workers, we use our. Otherwise just the default execution.
			if(window.Worker){
				return solutionWorker.postMessage(imagePiecesAverageColor);
			} else {
				return fetchColors(imagePiecesAverageColor)
				.then(function(result){
					displayMosaic(result);
				}).catch(function(error){
					console.log(error);
					clear();
				});
			}
		}
	} else {
		let _containerElement = document.getElementById("container");
		_containerElement.setAttribute("style", "display:none;");

		let h1Html = document.createElement("h1");
		h1Html.innerHTML = "Please upgrade your browser! We need some features...";
		h1Html.classList.add("dynamic-font", "text-center", "white-color");
		document.body.appendChild(h1Html);
	}
})(window, document);
