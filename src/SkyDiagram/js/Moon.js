/*
Moon.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/


/*

The Moon object is responsible for the moon graphic in the diagram. This includes maintaining the
	moon's position and other settings.

The phase of the moon is indicated by masking the graphic. The phase is determined by the relative
	positions of the sun and moon.

The moon is constrained to the sun-moon track. It's position is defined as a number, the fractional
	part of which determines the location on the track. Some values:
		x.0  = left track and horizon intersection, 
		x.25 = zenith,
		x.5  = right track and horizon intersection,
		x.75 = nadir.

So position values in the range [x.0, x.5] will have the moon above the horizon.

The moon image should be an 80x80px image with an 80px diameter moon disc
	centered in the image. SVG is preferred. The image will be masked to
	indicate the phase. If no image is specified a simple filled circle will
	be drawn in its place.

There is some redundancy between Sun.js and Moon.js, so if any change is made to one file the
	other should be reviewed to see if a similar change should be made there.

Parameters:
	moonPosition			- the position along the track, the integer part is ignored
	moonSize					- as a fraction of the diagonal
	moonImageSrc			- if empty, a simple filled circle will be drawn
	moonNoImageColor	- the color of the disc when no image is provided

Flags:
	hasPositionChanged
	hasPointChanged
	hasRadiusChanged

Special Methods:
	getElement
	getPosition		- always in range [0, 1)
	getPoint			- an object with x andd y properties, in pixels, for the center of the moon disc,
									as well as an angle property, which is the track's tangent angle, in radians
	getRadius			- in pixels

Dependencies:
	MainGeometry
	TrackGeometry
	Sun

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Moon {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');

		this._moonMask = document.createElementNS(svgNS, 'mask');
		this._moonMask.setAttribute('id', 'moon-mask');
		this._element.appendChild(this._moonMask);

		this._moonMaskPath = document.createElementNS(svgNS, 'path');
		this._moonMaskPath.setAttribute('fill', 'white');
		this._moonMask.appendChild(this._moonMaskPath);

		this._params = {
			moonPosition: 0.2,
			moonSize: 0.05,
			moonImageSrc: '',
			moonNoImageColor: '#e0e0e0',
		};

		this.setParams(this._params);
	}


	/*
	**	Linking Dependencies
	*/

	link(otherObjects) {
		this._mainGeometry = otherObjects.mainGeometry;
		this._trackGeometry = otherObjects.trackGeometry;
		this._sun = otherObjects.sun;
	}


	/*
	**	Update Cycle Methods
	*/
	
	update() {

		// Check dependencies.

		if (this._mainGeometry.getHaveLayoutPropsChanged()) {
			this._needs_transformMoon = true;
		}

		if (this._trackGeometry.getHasTrackChanged) {
			this._needs_transformMoon = true;
		}

		if (this._sun.getHasPositionChanged()) {
			this._needs_redrawPhaseMask = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_replaceMoonImage) {
			this._replaceMoonImage();
		}

		if (this._needs_redrawMoonDisc) {
			this._redrawMoonDisc();
		}

		if (this._needs_redrawPhaseMask) {
			this._redrawPhaseMask();
		}

		if (this._needs_transformMoon) {
			this._transformMoon();
		}
	}

	clearFlags() {
		this._hasPositionChanged = false;
		this._hasPointChanged = false;
		this._hasRadiusChanged = false;
	}

	getHasPositionChanged() {
		return this._hasPositionChanged;
	}

	getHasPointChanged() {
		return this._hasPointChanged;
	}

	getHasRadiusChanged() {
		return this._hasRadiusChanged;
	}


	/*
	**	Parameter Methods
	*/

	addParams(params) {
		for (const key in this._params) {
			params[key] = this._params[key];
		}
	}

	setParams(params) {

		let vp = this.validateParams(params);

		for (const key in this._params) {
			if (vp[key] !== undefined) {
				this._params[key] = vp[key];
			}
		}

		if (vp.hasOwnProperty('moonPosition')) {
			this._needs_redrawPhaseMask = true;
			this._needs_transformMoon = true;
		}

		if (vp.hasOwnProperty('moonSize')) {
			this._needs_transformMoon = true;
		}

		if (vp.hasOwnProperty('moonImageSrc')) {
			this._needs_replaceMoonImage = true;	
		}

		if (vp.hasOwnProperty('moonNoImageColor')) {
			this._needs_redrawMoonDisc = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('moonPosition')) {
			vp.moonPosition = this._validatePosition(params.moonPosition);
		}

		if (params.hasOwnProperty('moonSize')) {
			vp.moonSize = this._validateNumber(params.moonSize, 'moonSize');
		}

		if (params.hasOwnProperty('moonImageSrc')) {
			vp.moonImageSrc =	this._validateImageSrc(params.moonImageSrc);
		}

		if (params.hasOwnProperty('moonNoImageColor')) {
			vp.moonNoImageColor = params.moonNoImageColor;
		}

		return vp;
	}


	/*
	**	Internal Helpers for Parameter Methods
	*/

	_validatePosition(arg) {
		if (typeof arg !== 'number') {
			arg = Number(arg);
		}
		if (!Number.isFinite(arg)) {
			throw new Error('The position must be a finite number.');
		}
		return (arg%1 + 1)%1;
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

	_validateImageSrc(arg) {
		if (typeof arg !== 'string') {
			throw new Error('The image src must be a string.');
		}
		return arg;
	}


	/*
	**	Special Methods
	*/

	getElement() {
		return this._element;
	}
	
	getPosition() {
		return this._params.moonPosition;
	}
	
	getPoint() {
		return {
			x: this._point.x,
			y: this._point.y,
			angle: this._point.angle
		};
	}

	getRadius() {
		return this._radius;
	}


	/*
	**	Internal Update Methods
	*/

	_redrawPhaseMask() {
		//console.log(' Moon._redrawPhaseMask');

		// This method needs to be called if either the moon's or the sun's positions
		//	have changed.

		let delta = ((this._params.moonPosition - this._sun.getPosition())%1 + 1)%1;
		let alpha = 2*Math.PI * delta;
		let rx = Math.abs(40*Math.cos(alpha));

		if (delta === 0) {
			this._element.setAttribute('display', 'none');
		} else {
			this._element.setAttribute('display', 'inline');
		}

		let d = '';

		if (delta === 0) {
			// New moon -- nothing to do.
		} else if (delta < 0.25) {
			// Waning crescent.
			d = 'M 40 0 A ' + rx + ' 40 0 1 0 40 80 A 40 40 0 1 1 40 0 Z'; 	
		} else if (delta === 0.25) {
			// Third quarter.
			d = 'M 40 0 L 40 80 A 40 40 0 1 1 40 0 Z';
		} else if (delta < 0.5) {
			// Waning gibbous.
			d = 'M 40 0 A ' + rx + ' 40 0 1 1 40 80 A 40 40 0 1 1 40 0 Z';
		} else if (delta === 0.5) {
			// Full moon.
			d = 'M 40 0 A 40 40 0 1 1 40 80 A 40 40 0 1 1 40 0 Z';
		} else if (delta < 0.75) {
			// Waxing gibbous.
			d = 'M 40 0 A 40 40 0 1 1 40 80 A ' + rx + ' 40 0 1 1 40 0 Z';
		} else if (delta === 0.75) {
			// First quarter.
			d = 'M 40 0 A 40 40 0 1 1 40 80 L 40 0 Z';
		} else {
			// Waxing crescent.
			d = 'M 40 0 A 40 40 0 1 1 40 80 A ' + rx + ' 40 0 1 0 40 0 Z';
		}

		this._moonMaskPath.setAttribute('d', d);

		this._needs_redrawPhaseMask = false;
	}

	_transformMoon() {
		//console.log(' Moon._transformMoon');

		// This method applies a transform to the group element containing the moon that
		//	simultaneously sizes, positions, and rotates the graphic. The graphic is rotated
		//	to maintain its angle with respect to the sun-moon track.
		// This method is also responsible for calculating the screen point and radius.
		// This method needs to be called if:
		//	- the size of the diagram has changed (_mainGeometry's layoutProps; affects radius),
		//	- the size of the graphic has changed (_params.moonSize),
		//	- the position has changed (_params.moonPosition), or
		//	- the sun-moon track has changed (due to _trackGeometry's getScreenPointForPosition).
	
		this._hasPositionChanged = true;
		this._hasPointChanged = true;
		this._hasRadiusChanged = true;

		// From TrackGeometry, the point will have these properties:
		// 	x, y: the screen coordinates (LHS with the origin in the upper left of diagram), and
		//  angle: the angle, in radians, of the tangent at that position.
		this._point = this._trackGeometry.getScreenPointForPosition(this._params.moonPosition);

		let layoutProps = this._mainGeometry.getLayoutProps();

		let diagonal = Math.sqrt(	layoutProps.contentWidth	* layoutProps.contentWidth
														+ layoutProps.contentHeight	* layoutProps.contentHeight);

		this._radius = 0.5 * this._params.moonSize * diagonal;
		
		// This is the scale needed to be applied to the graphic to achieve the desired radius.
		let scale = (this._params.moonSize * diagonal) / 80;

		let transform = '';
		transform += 'rotate(' + (this._point.angle * 180 / Math.PI) + ', ' + this._point.x + ', ' + this._point.y + ')';
		transform += ' translate(' + this._point.x + ', ' + this._point.y + ')';
		transform += ' scale(' + scale + ')';

		this._element.setAttribute('transform', transform);
		
		this._needs_transformMoon = false;
	}


	_redrawMoonDisc() {
		//console.log(' Moon._redrawMoonDisc');
		// This method is for redrawing the moon when it is a filled circle (no image).
		// TODO: test for condition
		let nodeName = this._moon.nodeName;
		let tagName = this._moon.tagName;
		console.log('  _moon nodeName: '+nodeName);
		console.log('  _moon tagName: '+tagName);
		this._moon.setAttribute('fill', this._params.moonNoImageColor);
		this._needs_redrawMoonDisc = false;
	}


	_replaceMoonImage() {
		//console.log(' Moon._replaceMoonImage');

		let newMoon;

		if (typeof this._params.moonImageSrc === 'string' && this._params.moonImageSrc !== '') {
			// Attach an image.
			newMoon = document.createElementNS(svgNS, 'image');
			newMoon.setAttributeNS(xlinkNS, 'href', this._params.moonImageSrc);
			newMoon.setAttribute('width', '80');
			newMoon.setAttribute('height', '80');
			this._needs_redrawMoonDisc = false;
		} else {
			// No moon image provided, so draw a filled circle.
			// The offset is required due to the way the moon is masked.
			newMoon = document.createElementNS(svgNS, 'circle');
			newMoon.setAttribute('r', '40');
			newMoon.setAttribute('cx', '40');
			newMoon.setAttribute('cy', '40');
			this._needs_redrawMoonDisc = true;
		}

		newMoon.setAttribute('transform', 'translate(-40, -40)');
		newMoon.setAttribute('mask', 'url(#moon-mask)');

		if (this._moon !== undefined) {
			this._element.replaceChild(newMoon, this._moon);
		} else {
			this._element.appendChild(newMoon);
		}

		this._moon = newMoon;

		this._needs_replaceMoonImage = false;
	}

}


