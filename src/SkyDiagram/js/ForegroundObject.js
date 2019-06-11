/*
ForegroundObject.js
wgbh-skydiagram
astro.unl.edu
2019-06-10
*/


/*

TODO: consider how to have refObjectID resolved only as needed, instead of with every update

The ForegroundObject object creates and manages individual foreground objects added to the scene.

These objects may be defined in variety of coordinate of systems.


Horizon System
--------------

This is an *absolute* system.

The horizon system is defined such that:
	x = 0.0 corresponds to the left horizon point (the horizon and track intersection),
	x = 1.0 corresponds to the right horizon point,
	y = 0.0 corresponds to the horizon level, and
	y = 1.0 corresponds to the bottom edge of the diagram.

The horizon system is a left-handed system.

If the horizon parameter (of MainGeometry) is 0 all y-values are essentially ignored and the
	foreground objects will be placed at the bottom of the diagram.	

In this system width is defined by the x-scale. That is, it is specified by a fraction of
	the distance between the left and right horizon-track intersection points.


Object System
-------------

This is a *relative* system.

The object system uses another object (the reference) for the origin point and axis scaling.

The object system is defined such that:
	x = 0.0, y = 0.0 corresponds to the upper-left corner of the reference object's image, and
	x = 1.0, y = 1.0 corresponds to the bottom-right corner of the reference object's image.

The object system is a left-handed system. 

The width is defined by the x-scale. That is, the width is specified as a fraction of the
	reference object's width.

To be well-defined, refObjectID must match an object using an absolute system. If not
	well-defined the object will not be shown.


Parameters:
	imageSrc 						- the URL for the image (JPG, PNG, or SVG) for the object
	system							- one of "horizon" (the default) or "object"
	refObjectID					- the ID of the object to use for reference; meaningful only if system is "object";
												if this is an empty string the object will not be shown
	x, y								- these define the position of the object in the given system (see notes above)
	offsetX, offsetY		- these define the relative attachment offset of the image as fractions of its width
												and height; if undefined, the default is the upper-left corner at <0,0>;
												so <0.5,0.5> would use the object's center as its origin point for positioning
	width								- defines the size of the object (depends on system)
	aspectRatio					- defined as the image's naturalWidth/naturalHeight; defaults to 1; this must
												be provided since the current code can not obtain this information
	applyNightShading		- a boolean that indicates whether the image should be shaded at night (default is true)
	visibility					- an optional object to restrict the visibility of the object; if not defined then
												the object is always shown (assuming imageSrc is valid and the object is well-defined)
	visibility					- if the visiblity object has sunPosition array, and each entry in the array is an
		.sunPosition				interval object with valid begin and end properties, then those beginning and ending sun
		= [{begin, end}]		positions are used to determine when the object is shown

Flags:
	hasRelativeSystemChanged		- raised whenever the object's screen x, y, width, or height attributes have changed (not
																the params with the same name); indicates to any other object using this object as a
																reference that it will need to update its own screen attributes

Special Methods:
	getElement()
	getID()
	getUsesAbsoluteSystem()
	getScreenAttributesForRelativeParams(params)	- params must have x, y, offsetX, offsetY, width, and aspectRatio properties;
																									the returned object will have x, y, width, and height properties;
																									if the object is not well-defined or it does not use an absolute system
																									this method will return undefined

Dependencies:
	MainGeometry					- for objects using the horizon system
	Sun										- for sun based visibility restrictions (optional)
	ForegroundObjects			- for reference object lookup

If the system is "object" then the object also depends on the reference object, but this dependency
	is maintained by storing the refObjectID string and resolving the object (via ForegroundObjects)
	with each update. A weak link avoids difficulties if the reference object is removed.

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class ForegroundObject {

	
	constructor(ID) {
		
		this._ID = ID;
	
		// _visibilityDependsOnSun <=> _params.visibility.sunPosition exists.
		this._visibilityDependsOnSun = false;

		// _isWellDefined <=> _x, _y, _width, and _height (screen attributes) are valid and up-to-date.
		this._isWellDefined = false;

		// _lastRefObj is used to determine if the reference object has changed (e.g. becoming undefined after being removed).
		this._lastRefObj = undefined;

		// _isVisible tracks the _element visibility (display attribute) to avoid unnecessary attribute changes.
		this._isVisible = true;

		this._element = document.createElementNS(svgNS, 'g');
		this._image = undefined;

		let defaultParams = {
			imageSrc: '',
			system: 'horizon',
			x: 0,
			y: 0,
			offsetX: 0,
			offsetY: 0,
			width: 0.1,
			aspectRatio: 1,
			applyNightShading: true,
		};

		this._params = {};
		this.setParams(defaultParams);
	}


	/*
	**	Linking Dependencies
	*/

	link(otherObjects) {
		this._mainGeometry = otherObjects.mainGeometry;
		this._sun = otherObjects.sun;
		this._foregroundObjects = otherObjects.foregroundObjects;
	}
	
	
	/*
	**	Update Cycle Methods
	*/

	update() {
	
		// Check dependencies.

		if (this._visibilityDependsOnSun && this._sun.getHasPositionChanged()) {
			this._needs_updateVisibility = true;
		}

		this._refObj = undefined;

		if (this._params.system === 'object') {
			// Reference object system.

			// _refObj is resolved with every update (when system is 'object') in case it changes
			//	or is removed. It is possible that it is undefined.
			this._refObj = this._foregroundObjects.getObjectForID(this._params.refObjectID);

			// If the resolved value of _refObj has changed, or if it is defined and its relative
			//	system has changed, then we'll need an update.
			if ((this._refObj !== this._lastRefObj) || (this._refObj !== undefined && this._refObj.getHasRelativeSystemChanged())) {
				this._needs_updateScreenAttributes = true;
			}
		} else {
			// Horizon system.

			if (this._mainGeometry.getHasHorizonSystemChanged()) {
				this._needs_updateScreenAttributes = true;
			}
		}

		this._lastRefObj = this._refObj;

		// Call internal update sub-methods as required.

		if (this._needs_replaceImage) {
			this._replaceImage();
		}

		if (this._needs_updateScreenAttributes) {
			this._updateScreenAttributes();
		}

		if (this._needs_updateNightShading) {
			this._updateNightShading();
		}

		if (this._needs_updateVisibility) {
			this._updateVisibility();
		}
	}

	clearFlags() {
		this._hasRelativeSystemChanged = false;
	}

	getHasRelativeSystemChanged() {
		return this._hasRelativeSystemChanged;
	}


	/*
	**	Parameter Methods
	*/

	getParams() {
		return ForegroundObject.validateParams(this._params);
	}

	setParams(params) {
		
		let vp = ForegroundObject.validateParams(params);

		this._setParams(vp);
	}

	_setParams(vp) {
		// vp is assumed to be a validated params object that may be copied by reference.

		for (const key in vp) {
			this._params[key] = vp[key];
		}

		if (vp.hasOwnProperty('imageSrc')) {
			this._needs_replaceImage = true;
		}

		if (vp.hasOwnProperty('system')) {
			this._needs_updateScreenAttributes = true;
		}

		if (vp.hasOwnProperty('refObjectID')) {
			this._needs_updateScreenAttributes = true;
		}

		if (vp.hasOwnProperty('x')) {
			this._needs_updateScreenAttributes = true;
		}

		if (vp.hasOwnProperty('y')) {
			this._needs_updateScreenAttributes = true;
		}

		if (vp.hasOwnProperty('offsetX')) {
			this._needs_updateScreenAttributes = true;
		}

		if (vp.hasOwnProperty('offsetY')) {
			this._needs_updateScreenAttributes = true;
		}

		if (vp.hasOwnProperty('width')) {
			this._needs_updateScreenAttributes = true;
		}

		if (vp.hasOwnProperty('aspectRatio')) {
			this._needs_updateScreenAttributes = true;
		}

		if (vp.hasOwnProperty('applyNightShading')) {
			this._needs_updateNightShading = true;
		}

		if (vp.hasOwnProperty('visibility')) {
			this._needs_updateVisibility = true;
		}

		this._visibilityDependsOnSun = this._params.hasOwnProperty('visibility') && this._params.visibility.hasOwnProperty('sunPosition');
	}


	/*
	**	Special Methods
	*/

	getElement() {
		return this._element;
	}

	getID() {
		return this._ID;
	}

	getUsesAbsoluteSystem() {
		return this._params.system === 'horizon';
	}

	getScreenAttributesForRelativeParams(params) {
		// params must have x, y, offsetX, offsetY, width and aspectRatio properties, defined
		//	in the relative object system.
		// The returned object will have x, y, width, and height properties, in the screen system,
		//	unless this foreground object is not well-defined, in which case it returns undefined.
		// This method also returns undefined if the system is not an absolute system. Relaxing
		//	this restriction would require modifying the object update sequence in ForegroundObjects
		//	so that updates would occur in multiple rounds, going by the degree of descent from
		//	an absolute system. (Currently there are two rounds: absolute, then relative.)

		if (!this._isWellDefined) {
			return undefined;
		}

		if (this._params.system !== 'horizon') {
			return undefined;
		}
	
		let attr = {};
	
		attr.width = params.width * this._width;
		attr.height = attr.width / params.aspectRatio;
		
		let ox = params.offsetX * attr.width;
		let oy = params.offsetY * attr.height;

		attr.x = this._x - ox + params.x*this._width;
		attr.y = this._y - oy + params.y*this._height;

		return attr;
	}

	
	/*
	**	Internal Update Methods
	*/

	_updateScreenAttributes() {

		this._hasRelativeSystemChanged = true;

		let attr = undefined;
		if (this._params.system === 'object') {
			// _refObj was resolved in the update method (it may be undefined, though).
			if (this._refObj !== undefined) {
				attr = this._refObj.getScreenAttributesForRelativeParams(this._params);
			}
		} else {
			attr = this._mainGeometry.getScreenAttributesForHorizonParams(this._params);
		}

		let newIsWellDefined;

		if (attr === undefined) {
			newIsWellDefined = false;
		} else {
			newIsWellDefined = true;

			this._x = attr.x;
			this._y = attr.y;
			this._width = attr.width;
			this._height = attr.height;

			if (this._image !== undefined) {
				this._image.setAttribute('x', this._x);
				this._image.setAttribute('y', this._y);
				this._image.setAttribute('width', this._width);
				this._image.setAttribute('height', this._height);
			}
		}

		if (newIsWellDefined !== this._isWellDefined) {
			this._isWellDefined = newIsWellDefined;
			this._needs_updateVisibility = true;
		}

		this._needs_updateScreenAttributes = false;
	}

	_updateNightShading() {

		if (this._image !== undefined) {
			if (this._params.applyNightShading) {
				this._image.setAttribute('filter', 'url(#night-shading)')
			} else {
				this._image.setAttribute('filter', 'none')
			}
		}

		this._needs_updateNightShading = false;
	}

	_updateVisibility() {
		// Visibility is managed by toggling the display attribute of the group element.

		// Visibility defaults to true.
		let newIsVisible = true;

		if (this._isWellDefined) {
				
			if (this._visibilityDependsOnSun) {
				// _visibilityDependsOnSun <=> _params.visibility.sunPosition exists.
	
				let sunPosition = this._sun.getPosition();
	
				// Visibility now defaults to false unless the sun position is in a provided interval.
				newIsVisible = false;
	
				let intervals = this._params.visibility.sunPosition;
	
				for (let i = 0; i < intervals.length; ++i) {
	
					let interval = intervals[i];
	
					if (interval.begin < interval.end) {
						// No wraparound.
						if (sunPosition >= interval.begin && sunPosition <= interval.end) {
							newIsVisible = true;
							break;
						}
					} else {
						// Wraparound.
						if (sunPosition >= interval.begin || sunPosition <= interval.end) {
							newIsVisible = true;
							break;
						}
					}
				}
			}
		} else {
			// Object is not well-defined so it will not be shown.
			newIsVisible = false;
		}

		if (newIsVisible !== this._isVisible) {
			this._isVisible = newIsVisible;
			if (this._isVisible) {
				this._element.setAttribute('display', 'inline');
			} else {
				this._element.setAttribute('display', 'none');
			}
		}	

		this._needs_updateVisibility = false;
	}

	_replaceImage() {
	
		this._needs_updateScreenAttributes = true;
		this._needs_updateNightShading = true;
		this._needs_updateVisiblity = true;

		if (typeof this._params.imageSrc === 'string' && this._params.imageSrc !== '') {
			// Attach the image.

			let newImage = document.createElementNS(svgNS, 'image');
			newImage.setAttribute('preserveAspectRatio', 'xMinYMin');	
			newImage.setAttributeNS(xlinkNS, 'href', this._params.imageSrc);

			if (this._image !== undefined) {
				this._element.replaceChild(newImage, this._image);
			} else {
				this._element.appendChild(newImage);
			}
	
			this._image = newImage;
		} else {
			// No image specified.

			if (this._image !== undefined) {
				this._element.removeChild(this._image);
				this._image = undefined;
			}
		}

		this._needs_replaceImage = false;
	}


	/*
	**	[Static] Parameter Validation Methods
	*/

	static validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('imageSrc')) {
			vp.imageSrc = ForegroundObject._validateImageSrc(params.imageSrc);
		}
			
		if (params.hasOwnProperty('system')) {
			vp.system = ForegroundObject._validateSystem(params.system);
		}

		if (params.hasOwnProperty('refObjectID')) {
			vp.refObjectID = ForegroundObject._validateRefObjectID(params.refObjectID);
		}

		if (params.hasOwnProperty('x')) {
			vp.x = ForegroundObject._validateNumber(params.x, 'x');
		}

		if (params.hasOwnProperty('y')) {
			vp.y = ForegroundObject._validateNumber(params.y, 'y');
		}

		if (params.hasOwnProperty('offsetX')) {
			vp.offsetX = ForegroundObject._validateNumber(params.offsetX, 'offsetX');
		}

		if (params.hasOwnProperty('offsetY')) {
			vp.offsetY = ForegroundObject._validateNumber(params.offsetY, 'offsetY');
		}

		if (params.hasOwnProperty('width')) {
			vp.width = ForegroundObject._validateNumber(params.width, 'width');
		}

		if (params.hasOwnProperty('aspectRatio')) {
			vp.aspectRatio = ForegroundObject._validateNumber(params.aspectRatio, 'aspectRatio');
		}

		if (params.hasOwnProperty('applyNightShading')) {
			vp.applyNightShading = Boolean(params.applyNightShading);
		}

		if (params.hasOwnProperty('visibility')) {
			vp.visibility = ForegroundObject._validateVisibility(params.visibility);
		}

		return vp;
	}

	static _validateImageSrc(arg) {
		if (typeof arg !== 'string') {
			throw new Error('The ForegroundObject\'s imageSrc must be a string.');
		}
		return arg;
	}

	static _validateSystem(arg) {
		if (arg === 'horizon') {
			return 'horizon';
		} else if (arg === 'object') {
			return 'object';
		} else {
			throw new Error('The ForegroundObject\'s system parameter is unrecognized.');
		}	
	}

	static _validateRefObjectID(arg) {
		if (typeof arg !== 'string') {
			throw new Error('If defined, the ForegroundObject\'s refObjectID must be a string.');
		}
		// An empty string is allowed.
		let copy = arg.trim();
		return copy;
	}

	static _validateNumber(arg, paramName) {
		if (typeof arg !== 'number') {
			arg = Number(arg);
		}
		if (!Number.isFinite(arg)) {
			throw new Error(paramName + ' must be a valid number.');
		}
		return arg;
	}

	static _validateVisibility(arg) {

		let copy = {};

		if (arg.hasOwnProperty('sunPosition')) {

			if (!Array.isArray(arg.sunPosition)) {
				throw new Error('If defined, visibility.sunPosition must be an array.');
			}

			copy.sunPosition = [];

			for (let i = 0; i < arg.sunPosition.length; ++i) {

				let range = arg.sunPosition[i];

				if (typeof range !== 'object') {
					throw new Error('Each element in the visibility.sunPosition array must be an object.');
				}

				if (!range.hasOwnProperty('begin') || !range.hasOwnProperty('end')) {
					throw new Error('Each object in the visibility.sunPosition array must have begin and end properties.');
				}

				let rangeCopy = {};
				rangeCopy.begin = ForegroundObject._validateNumber(range.begin, 'Each begin property in the visibility.sunPosition array');
				rangeCopy.end = ForegroundObject._validateNumber(range.end, 'Each end property in the visibility.sunPosition array');
				copy.sunPosition[i] = rangeCopy;
			}
		}

		return copy;
	}
}


