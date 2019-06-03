/*
Track.js
2019-06-02
*/


/*

Parameters:
	pathColor
	pathWidth
	pathCutoutSize

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
		this._mask.appendChild(this._mask);

		this._moonCutout = document.createElementNS(svgNS, 'ellipse');
		this._moonCutout.setAttribute('fill', 'black');
		this._mask.appendChild(this._moonCutout);

		this._sunCutout = document.createElementNS(svgNS, 'ellipse');
		this._sunCutout.setAttribute('fill', 'black');
		this._mask.appendChild(this._sunCutout);

		this._trackPath = document.createElementNS(svgNS, 'path');
		this._trackPath.setAttribute('mask', 'url(#path-mask)');
		this._trackPath.setAttribute('fill', 'none');
		this._element.appendChild(this._trackPath);

		this._params = {
			pathColor: '#ffffff',
			pathWidth: 2,
			pathCutoutSize: 1.2,
		};

		this.setParams(this._params);
	}


	/*
	**	Dependencies
	*/

	linkTrackGeometry(arg) {
		this._trackGeometry = arg;
	}
	
	linkSun(arg) {
		this._sun = arg;
	}

	linkMoon(arg) {
		this._moon = arg;
	}


	/*
	**	Update Cycle Methods
	*/
	
	update() {

		// Check dependencies.

		if (this._trackGeometry.getHasTrackChanged()) {
			this._needs_redrawTrack = true;
		}

		if (this._sun.getHasSizeChanged() || this._moon.getHasSizeChanged()) {
			this._needs_redrawCutouts = true;
		}

		if (this._sun.getHasMoved() || this._moon.getHasMoved()) {
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
		//
	}


	/*
	**	Parameter Methods
	*/

	assignParams(params) {
		params.pathColor = this._params.pathColor;
		params.pathWidth = this._params.pathWidth;
		params.pathCutoutSize = this._params.pathCutoutSize;
	}

	setParams(params) {

		let vp = this.validateParams(params);

		for (let key in this._params) {
			if (vp[key] !== undefined) {
				this._params[key] = vp[key];
			}
		}

		if (vp.pathColor !== undefined || vp.pathWidth !== undefined) {
			this._needs_redrawTrack = true;
		}

		if (vp.cutoutSize !== undefined) {
			this._needs_redrawCutouts = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.pathColor !== undefined) {
			// TODO: validate
			vp.pathColor = params.pathColor;
		}

		if (params.pathWidth !== undefined) {
			vp.pathWidth = this._validatePathWidth(params.pathWidth);
		}

		if (params.cutoutSize !== undefined) {
			vp.cutoutSize = this._validateNumber(params.cutoutSize);
		}

		return vp;
	}


	/*
	**	Internal Helpers for Parameter Methods
	*/

	_validatePathWidth(arg) {
		arg = this._validateNumber(arg, 'pathWidth');
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
		this._trackPath.setAttribute('stroke', this._params.pathColor);
		this._trackPath.setAttribute('stroke-width', this._params.pathWidth);
		this._trackPath.setAttribute('d', this._trackGeometry.getTrackPathData());
		this._needs_redrawTrack = false;
	}

	_redrawCutouts() {

		let moonCutoutRadius = this._params.cutoutSize * this._moon.getScreenRadius();
		this._moonCutout.setAttribute('rx', moonCutoutRadius);
		this._moonCutout.setAttribute('ry', moonCutoutRadius);
		
		let sunCutoutRadius = this._params.cutoutSize * this._sun.getScreenRadius();
		this._sunCutout.setAttribute('rx', sunCutoutRadius);
		this._sunCutout.setAttribute('ry', sunCutoutRadius);

		this._needs_redrawCutouts = false;
	}

	_moveCutouts() {
		
		let moonPt = this._moon.getScreenPoint();
		this._moonCutout.setAttribute('cx', this._moonPt.x);
		this._moonCutout.setAttribute('cy', this._moonPt.y);

		let sunPt = this._sun.getScreenPoint();
		this._sunCutout.setAttribute('cx', this._sunPt.x);
		this._sunCutout.setAttribute('cy', this._sunPt.y);

		this._needs_moveCutouts = false;
	}

}


