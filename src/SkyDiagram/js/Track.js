/*
Track.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/


/*

The Track object is responsible for drawing the sun-moon track.

See also TrackGeometry.

Parameters:
	trackColor
	trackWidth
	trackCutoutSize

Flags:
	<none>	

Special Methods:
	getElement

Dependencies:
	TrackGeometry
	Sun
	Moon

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Track {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');

		this._mask = document.createElementNS(svgNS, 'mask');
		this._mask.setAttribute('id', 'track-mask');
		this._element.appendChild(this._mask);	
		
		this._maskRect = document.createElementNS(svgNS, 'rect');
		this._maskRect.setAttribute('fill', 'white');
		this._maskRect.setAttribute('x', 0);
		this._maskRect.setAttribute('y', 0);
		this._maskRect.setAttribute('width', '100%');
		this._maskRect.setAttribute('height', '100%');
		this._mask.appendChild(this._maskRect);

		this._moonCutout = document.createElementNS(svgNS, 'circle');
		this._moonCutout.setAttribute('fill', 'black');
		this._mask.appendChild(this._moonCutout);

		this._sunCutout = document.createElementNS(svgNS, 'circle');
		this._sunCutout.setAttribute('fill', 'black');
		this._mask.appendChild(this._sunCutout);

		this._trackPath = document.createElementNS(svgNS, 'path');
		this._trackPath.setAttribute('mask', 'url(#track-mask)');
		this._trackPath.setAttribute('fill', 'none');
		this._element.appendChild(this._trackPath);

		this._params = {
			trackColor: '#ffffff',
			trackWidth: 2,
			trackCutoutSize: 1.2,
		};

		this.setParams(this._params);
	}


	/*
	**	Linking Dependencies
	*/

	link(otherObjects) {
		this._trackGeometry = otherObjects.trackGeometry;
		this._sun = otherObjects.sun;
		this._moon = otherObjects.moon;
	}


	/*
	**	Update Cycle Methods
	*/
	
	update() {

		// Check dependencies.

		if (this._trackGeometry.getHasTrackChanged()) {
			this._needs_redrawTrack = true;
		}

		if (this._sun.getHasRadiusChanged() || this._moon.getHasRadiusChanged()) {
			this._needs_redrawCutouts = true;
		}

		if (this._sun.getHasPointChanged() || this._moon.getHasPointChanged()) {
			this._needs_moveCutouts = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_redrawTrack) {
			this._redrawTrack();
		}

		if (this._needs_redrawCutouts) {
			this._redrawCutouts();
		}

		if (this._needs_moveCutouts) {
			this._moveCutouts();
		}
	}

	clearFlags() {
		// No flags.
	}


	/*
	**	Parameter Methods
	*/

	addParams(params) {
		params.trackColor = this._params.trackColor;
		params.trackWidth = this._params.trackWidth;
		params.trackCutoutSize = this._params.trackCutoutSize;
	}

	setParams(params) {

		let vp = this.validateParams(params);

		for (let key in this._params) {
			if (vp[key] !== undefined) {
				this._params[key] = vp[key];
			}
		}

		if (vp.trackColor !== undefined || vp.trackWidth !== undefined) {
			this._needs_redrawTrack = true;
		}

		if (vp.trackCutoutSize !== undefined) {
			this._needs_redrawCutouts = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.trackColor !== undefined) {
			vp.trackColor = params.trackColor;
		}

		if (params.trackWidth !== undefined) {
			vp.trackWidth = this._validateTrackWidth(params.trackWidth);
		}

		if (params.trackCutoutSize !== undefined) {
			vp.trackCutoutSize = this._validateNumber(params.trackCutoutSize);
		}

		return vp;
	}


	/*
	**	Internal Helpers for Parameter Methods
	*/

	_validateTrackWidth(arg) {
		arg = this._validateNumber(arg, 'trackWidth');
		if (arg < 0.1) {
			arg = 0.1;
		} else if (arg > 5) {
			arg = 5;
		}
		return arg;
	}

	_validateNumber(arg, paramName) {
		if (typeof arg !== 'number') {
			arg = Number(arg);
		}
		if (!Number.isFinite(arg)) {
			throw new Error(paramName + ' must be a valid number.');
		}
		return arg;
	}


	/*
	**	Special Methods
	*/

	getElement() {
		return this._element;
	}


	/*
	**	Internal Update Methods
	*/

	_redrawTrack() {
		//console.log(' Track._redrawTrack');
		this._trackPath.setAttribute('stroke', this._params.trackColor);
		this._trackPath.setAttribute('stroke-width', this._params.trackWidth);
		this._trackPath.setAttribute('d', this._trackGeometry.getTrackPathData());
		this._needs_redrawTrack = false;
	}

	_redrawCutouts() {
		//console.log(' Track._redrawCutouts');

		let moonCutoutRadius = this._params.trackCutoutSize * this._moon.getRadius();
		this._moonCutout.setAttribute('r', moonCutoutRadius);
		
		let sunCutoutRadius = this._params.trackCutoutSize * this._sun.getRadius();
		this._sunCutout.setAttribute('r', sunCutoutRadius);

		this._needs_redrawCutouts = false;
	}

	_moveCutouts() {
		//console.log(' Track._moveCutouts');
		
		let moonPt = this._moon.getPoint();
		this._moonCutout.setAttribute('cx', moonPt.x);
		this._moonCutout.setAttribute('cy', moonPt.y);

		let sunPt = this._sun.getPoint();
		this._sunCutout.setAttribute('cx', sunPt.x);
		this._sunCutout.setAttribute('cy', sunPt.y);

		this._needs_moveCutouts = false;
	}

}


