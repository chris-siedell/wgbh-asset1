


export default class Sun {


	constructor() {

		this._params = {
			sunPosition: 0.4,


		};
	}
}


		// Layer 3: The Sun

		this._sunGroup = document.createElementNS(svgNS, 'g');
		main.appendChild(this._sunGroup);

		// The element _sun will be created and appended to _sunGroup in _replaceSunImage.


	getSunImageSrc() {
		return this._sunImageSrc;
	}
	
	// The sun image should be a 120x120px image with an 80px diameter sun disc
	//	centered in the image. SVG is preferred.
	// If sunImageSrc is the empty string a placeholder disc will be drawn.
	
	setSunImageSrc(arg, warnings) {
		this._sunImageSrc = this.validateSunImageSrc(arg, warnings);
		this._needs_replaceSunImage = true;
	}

	validateSunImageSrc(arg, warnings) {
		return this.validateImageSrc(arg, warnings);
	}

	validateImageSrc(arg, warnings) {
		if (typeof arg !== 'string') {
			throw new Error('The image src must be a string.');
		}
		return arg;
	}

	_replaceSunImage() {

		if (this._sun !== undefined) {
			this._sunGroup.removeChild(this._sun);
		}

		if (typeof this._sunImageSrc === 'string' && this._sunImageSrc !== '') {
			// Attach an image.
			this._sun = document.createElementNS(svgNS, 'image');
			this._sun.setAttributeNS(xlinkNS, 'href', this._sunImageSrc);
			this._sun.setAttribute('width', '120');
			this._sun.setAttribute('height', '120');
			this._sun.setAttribute('transform', 'translate(-60, -60)');

		} else {
			// Draw a filled circle -- this is just intended as a placeholder.
			this._sun = document.createElementNS(svgNS, 'circle');
			this._sun.setAttribute('fill', '#fbd449');
			this._sun.setAttribute('r', '40');
		}

		this._sunGroup.appendChild(this._sun);

		this._needs_replaceSunImage = false;
	}


