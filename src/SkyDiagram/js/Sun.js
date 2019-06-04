/*
Sun.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/


// TODO: make canonical


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
	centered in the image. SVG is preferred. The larger image size allows sun
	rays or other artistic embellishments to be added to the image. If no image
	is specified a simple filled circle will be drawn in its place.

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
	getElement
	getPosition		- always in range [0, 1)
	getPoint			- an object with x andd y properties, in pixels, for the center of the sun disc,
									as well as an angle property, which is the track's tangent angle, in radians
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

		let defaultParams = {
			sunPosition: 0.4,
			sunSize: 0.05,
			sunImageSrc: '',
			sunNoImageColor: '#fbd449',
		};

		this._params = {};
		this.setParams(defaultParams);
	}


	/*
	**	Linking Dependencies
	*/

	link(otherObjects) {
		this._mainGeometry = otherObjects.mainGeometry;
		this._trackGeometry = otherObjects.trackGeometry;
	}


	/*
	**	Update Cycle Methods
	*/
	
	update() {

		// Check dependencies.

		if (this._mainGeometry.getHaveLayoutPropsChanged()) {
			this._needs_transformSun = true;
		}

		if (this._trackGeometry.getHasTrackChanged) {
			this._needs_transformSun = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_replaceSunImage) {
			this._replaceSunImage();
		}

		if (this._needs_redrawSunDisc) {
			this._redrawSunDisc();
		}

		if (this._needs_transformSun) {
			this._transformSun();
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

		// Set validated params.
		for (const key in vp) {
			this._params[key] = vp[key];
		}

		// Flag update sub-methods according to which parameters have been set.

		if (vp.hasOwnProperty('sunPosition')) {
			this._needs_transformSun = true;
		}

		if (vp.hasOwnProperty('sunSize')) {
			this._needs_transformSun = true;
		}

		if (vp.hasOwnProperty('sunImageSrc')) {
			this._needs_replaceSunImage = true;	
		}

		if (vp.hasOwnProperty('sunNoImageColor')) {
			this._needs_redrawSunDisc = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('sunPosition')) {
			vp.sunPosition = this._validatePosition(params.sunPosition);
		}

		if (params.hasOwnProperty('sunSize')) {
			vp.sunSize = this._validateNumber(params.sunSize, 'sunSize');
		}

		if (params.hasOwnProperty('sunImageSrc')) {
			vp.sunImageSrc =	this._validateImageSrc(params.sunImageSrc);
		}

		if (params.hasOwnProperty('sunNoImageColor')) {
			vp.sunNoImageColor = params.sunNoImageColor;
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
		return this._params.sunPosition;
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

	_transformSun() {
		//console.log(' Sun._transformSun');

		// This method applies a transform to the group element containing the sun that
		//	simultaneously sizes, positions, and rotates the graphic. The graphic is rotated
		//	to maintain its angle with respect to the sun-moon track.
		// This method is also responsible for calculating the screen point and radius.
		// This method needs to be called if:
		//	- the size of the diagram has changed (_mainGeometry's layoutProps; affects radius),
		//	- the size of the graphic has changed (_params.sunSize),
		//	- the position has changed (_params.sunSize), or
		//	- the sun-moon track has changed (due to _trackGeometry's getScreenPointForPosition).
	
		this._hasPositionChanged = true;
		this._hasPointChanged = true;
		this._hasRadiusChanged = true;

		// From TrackGeometry, the point will have these properties:
		// 	x, y: the screen coordinates (LHS with the origin in the upper left of diagram), and
		//  angle: the angle, in radians, of the tangent at that position.
		this._point = this._trackGeometry.getScreenPointForPosition(this._params.sunPosition);

		let layoutProps = this._mainGeometry.getLayoutProps();

		let diagonal = Math.sqrt(	layoutProps.contentWidth	* layoutProps.contentWidth
														+ layoutProps.contentHeight	* layoutProps.contentHeight);

		this._radius = 0.5 * this._params.sunSize * diagonal;
		
		// This is the scale needed to be applied to the graphic to achieve the desired radius.
		let scale = (this._params.sunSize * diagonal) / 80;

		let transform = '';
		transform += 'rotate(' + (this._point.angle * 180 / Math.PI) + ', ' + this._point.x + ', ' + this._point.y + ')';
		transform += ' translate(' + this._point.x + ', ' + this._point.y + ')';
		transform += ' scale(' + scale + ')';

		this._element.setAttribute('transform', transform);
		
		this._needs_transformSun = false;
	}


	_redrawSunDisc() {
		//console.log(' Sun._redrawSunDisc');
		// This method is for redrawing the sun when it is a filled circle (no image).
		// TODO: test for condition
		let nodeName = this._sun.nodeName;
		let tagName = this._sun.tagName;
		console.log('  _sun nodeName: '+nodeName);
		console.log('  _sun tagName: '+tagName);
		this._sun.setAttribute('fill', this._params.sunNoImageColor);

		this._needs_redrawSunDisc = false;
	}


	_replaceSunImage() {
		//console.log(' Sun._replaceSunImage');

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


