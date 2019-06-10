/*
ForegroundObject.js
wgbh-skydiagram
astro.unl.edu
2019-06-09
*/


/*

The ForegroundObject object creates and manages foreground objects added to the scene.

These objects may be defined in variety of coordinate of systems.


Horizon System
--------------

This is a *fixed* system.

The "horizon" system is defined such that:
 x = 0.0 corresponds to the left horizon point (the horizon and track intersection),
 x = 1.0 corresponds to the right horizon point,
 y = 0.0 corresponds to the horizon level, and
 y = 1.0 corresponds to the bottom edge of the diagram.

So the "horizon" system is a left-handed system.

If the horizon parameter (of MainGeometry) is 0 all y-values are essentially ignored and the
	foreground objects will be placed at the bottom of the diagram.	

In this system width is defined by the x-scale. That is, it is specified by a fraction of
	the distance between the left and right horizon-track intersection points.


Object System
-------------

This is a *relative* system.

The "object" system uses another object (the reference) as the origin point.

In this system the x and y scales are defined by the reference object's width
	and height. For example, a value of <x,y> = <1,1> would place the object's origin
	at the bottom-right corner of the reference object.

In this system the width is defined as a fraction of the reference object's width.

To be well-defined, the refObjectID must match an object defined in a fixed system. If not
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
												the object is always shown
	visibility					- if the visiblity object has sunPosition array, and each entry in the array is an
		.sunPosition				object with valid begin and end properties, then those beginning and ending sun
		= [{begin, end}]		positions are used to determine when the object is shown
		

Flags:


Special Methods:
	getID()
	getUsesFixedSystem()
	getScreenPointForRelativePoint(pt)

Dependencies:
	

*/


export default class ForegroundObject {



		
		
	constructor(parent, ID) {

		// The parent is the ForegroundObjects instance.
		this._parent = parent;

		this._ID = ID;

		let defaultParams = {
			imageSrc: '',
			system: this.SYSTEM_HORIZON,
			x: 0,
			y: 0,
			offsetX: 0,
			offsetY: 0,
			width: 0.1,
			aspectRatio: 1,
			applyNightShading: true,
		};

		this._params = {
			

	}

	/*
	**	Parameter Methods
	*/

	getParams() {
		let params = {};
		params.id = this._id;

		// TODO
		params.foregroundObjects = this._copyForegroundObjects(this._params.foregroundObjects);
	}

	_setParams(vp) {
		// vp is assumed to be a validated params object that may be copied by reference.

		for (const key in vp) {
			this._params[key] = vp[key];
		}

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




	/*
	**	[Static] Validation Methods
	*/

	static validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('imageSrc')) {
			vp.imageSrc = ForegroundObject._validateImageSrc(params.imageSrc);
		}
			
		if (params.hasOwnProperty('system')) {
			vp.system = ForegroundObject._validateSystem(params.system);
		}

		if (params.hasOwnProperty('refObjectID') {
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

		if (params.hasOwnProperty('applyNightShading') {
			vp.applyNightShading = Boolean(params.applyNightShading);
		}

		if (params.hasOwnProperty('visibility') {
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


