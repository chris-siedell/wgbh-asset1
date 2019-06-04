/*
Sun.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/


/*

The Sun object is responsible for the sun graphic in the diagram. This includes maintaining the
	sun's position and other settings.

The sun is constrained to the sun-moon track. It's position is defined as a number, the fractional
	part of which determines the location on the track. Some values:
		x.0  = left track and horizon intersection, 
		x.25 = zenith,
		x.5  = right track and horizon intersection,
		x.75 = nadir (midnight).

So position values in the range [x.0, x.5] correspond to daytime.

The sun image should be a 120x120px image with an 80px diameter sun disc
	centered in the image. SVG is preferred. If no image is specified a
	simple filled circle will be drawn in its place.

There is some redundancy between Sun.js and Moon.js, so if any change is made to one file the
	other should be reviewed to see if a similar change should be made there.

Parameters:
	sunPosition			- the position along the track, the integer part is ignored
	sunSize					- as a fraction of the diagonal
	sunImageSrc			- if empty, a simple filled circle will be drawn
	sunNoImageColor	- the color of the disc when no image is provided

Flags:
	hasPositionChanged
	hasPointChanged
	hasRadiusChanged

Special Methods:
	getPosition		- always in range [0, 1)
	getPoint			- an object with x and y properties, in pixels, for the center of the sun disc
	getRadius			- in pixels

Dependencies:
	MainGeometry
	TrackGeometry

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Sun {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');

		this._params = {
			sunPosition: 0.4,
			sunSize: 0.05,
			sunImageSrc: '',
			sunNoImageColor: '#fbd449',
		};

		this.setParams(this._params);
	}


	_validateImageSrc(arg, warnings) {
		if (typeof arg !== 'string') {
			throw new Error('The image src must be a string.');
		}
		return arg;
	}


	_resizeSun() {
		console.log(' Sun._resizeSun');

		this._hasRadiusChanged = true;


		this._needs_resizeSun = false;
	}

	_transformSun() {
		console.log(' Sun._moveSun');

		this._hasPositionChanged = true;
		this._hasPointChanged = true;


		this._needs_transformSun = false;
	}

	_redrawSunDisc() {
		console.log(' Sun._redrawSunDisc');
		// This method must be called only when _sun is a circle element.
		// TODO: test
		this._sun.setAttribute('fill', this._params.sunNoImageColor);
		this._needs_redrawSunDisc = false;
	}

	_replaceSunImage() {
		console.log(' Sun._replaceSunImage');

		this._needs_transformSun = true;

		let newSun;

		if (typeof this._params.sunImageSrc === 'string' && this._params.sunImageSrc !== '') {
			// Attach an image.
			newSun = document.createElementNS(svgNS, 'image');
			newSun.setAttributeNS(xlinkNS, 'href', this._params.sunImageSrc);
			newSun.setAttribute('width', '120');
			newSun.setAttribute('height', '120');
			newSun.setAttribute('transform', 'translate(-60, -60)');
			this._needs_redrawSunDisc = false;
		} else {
			// No sun image provided, so draw a filled circle.
			newSun = document.createElementNS(svgNS, 'circle');
			newSun.setAttribute('r', '40');
			this._needs_redrawSunDisc = true;
		}

		if (this._sun !== undefined) {
			this._element.replaceChild(newSun, this._sun);
		}	else {
			this._element.appendChild(newSun);
		}

		this._sun = newSun;

		this._needs_replaceSunImage = false;
	}



}


