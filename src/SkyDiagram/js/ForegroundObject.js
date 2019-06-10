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

To be well-defined, an object must directly or indirectly (through a chain of references) reference
	another object in a fixed system. If not well-defined the object will not be shown.


Parameters:
	ID									- an identifying string that must be unique amongst all foreground objects (this
												requirement is enforced in ForegroundObjects); the value remains constant
												for the life of the object 
	imageSrc 						- the URL for the image (JPG, PNG, or SVG) for the object
	system							- one of "horizon" (the default) or "object"
	x, y								- these define the position of the object in the given system (see notes above)
	refObjectID					- the ID of the object to use for reference; meaningful only if system is "object"
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
	getIsFixedSystem()
	getScreenPointForRelativePoint(pt)

Dependencies:
	

*/


export default class ForegroundObject {


	static copyParams(orig) {
		// Copies (at depth) the properties specific to the ForegroundObject params object, assuming
		//	a valid original object.
		// This method does not validate the params beyond what is necessary to ensure safe copying.

		let copy = {};

		// These params can be copied by value. 'visibility' is handled separately.
		let paramNames = ['ID', 'imageSrc', 'system', 'x', 'y', 'refObjectID', 'offsetX', 'offsetY', 'width', 'aspectRatio', 'applyNightShading'];

		for (const key in paramNames) {
			if (orig.hasOwnProperty(key)) {
				copy[key] = orig[key];
			}
		}

		if (orig.hasOwnProperty('visibility' && typeof orig.sunPosition === 'object') {
			copy.visibility = ForegroundObject.copyVisibilityParam(orig.visibility);
		}
	
		return copy;
	}


	static copyVisibilityParam(orig) {
		let copy = {};
		if (orig.hasOwnProperty('sunPosition') && Array.isArray(orig.sunPosition)) {
			copy.sunPosition = [];
			for (let i = 0; i < orig.sunPosition.length; ++i) {
				let origRange = orig.sunPosition[i];
				copy.sunPosition[i] = {begin: origRange.begin, end: origRange.end};
			}
		}
		return copy;
	}
		
		
	constructor(parent, id) {

		this.SYSTEM_HORIZON = 'horizon';
		this.SYSTEM_OBJECT = 'object';

		// The parent is the ForegroundObjects instance.
		this._parent = parent;

		// The ForegroundObjects instance is responsible for ensuring that the ID is valid.
		this._id = id;

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

	setParams(params) {

		let vp = this.validateParams(params);

		// Set validated params.
		for (const key in vp) {
			this._params[key] = vp[key];
		}

		// Flag update sub-methods according to which parameters have been set.

		if (vp.hasOwnProperty('foregroundObjects')) {
			this._needs_replaceObjects = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('foregroundObjects')) {
			vp.foregroundObjects = this._validateForegroundObjects(params.foregroundObjects);
		}

		return vp;
	}	
	/*
	**	Special Methods
	*/

	getElement() {
		return this._element;
	}

	getID() {
		return this._params.id;
	}


}


