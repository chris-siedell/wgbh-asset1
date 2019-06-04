/*
ForegroundObjects.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/

/*

// TODO

		// fobj must be an object with the following parameters:
		//	- url: the object's image URL,
		//	- x, y: the relative position of the object's origin,
		//	- width: the relative width of the object,
		//	- aspectRatio: defined as relativeWidth/relativeHeight, and
		//	- cx, cy (optional): the offset of the object's center, as fractions of its width
		//		and height; if undefined, the default is the upper-left corner at <0,0>.

		// The position is defined such that:
		//  x = 0.0 corresponds to the left horizon point (the horizon and path intersection),
		//	x = 1.0 corresponds to the right horizon point,
		//	y = 0.0 corresponds to the horizon level, and
		//	y = 1.0 corresponds to the bottom edge of the diagram.
		// So the position is defined in a left-hand system.
		// If the horizon parameter is 0 all y-values are essentially ignored and the foreground
		//	objects will be placed at the bottom of the diagram.	

		// The width is defined as a fraction of the distance between the left horizon point
		//  and the right horizon point. E.g. if there are 400px between the two points and
		//	width is set to the 0.1, the foreground object will be 40px wide.
		// The height of the object is scaled automatically to preserve the aspect ratio.




Parameters:
	foregroundObjects

Flags:
	<none>

Special Methods:
	getElement

Dependencies:
	MainGeometry

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class ForegroundObjects {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');

		let defaultParams = {
			foregroundObjects: [],
		};

		this._params = {};
		this.setParams(defaultParams);
	}


	/*
	**	Linking Dependencies
	*/

	link(otherObjects) {
		this._mainGeometry = otherObjects.mainGeometry;
	}


	/*
	**	Update Cycle Methods
	*/
	
	update() {

		// Check dependencies.

		if (this._mainGeometry.getHaveLayoutPropsChanged()) {
			this._needs_transformObjects = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_replaceObjects) {
			this._replaceObjects();
		}

		if (this._needs_transformObjects) {
			this._transformObjects();
		}
	}

	clearFlags() {
		// No external flags.
	}


	/*
	**	Parameter Methods
	*/

	addParams(params) {
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
	**	Internal Helpers for Parameter Methods
	*/

	_validateForegroundObjects(arg) {

		let vp = {};

		if (!Array.isArray(arg)) {
			console.log(arg);
			console.log(Array.isArray(arg));
			console.log(typeof arg);
			throw new Error('The foregroundObjects parameter must be an array.');
		}

		let copy = this._copyForegroundObjects(arg);

		// TODO: verify copy

		return copy;
	}

	_copyForegroundObjects(arg) {
		let copy = [];
		// TODO: do manual/limited copy, since arg may be user supplied
		for (let i = 0; i < arg.length; ++i) {
			copy[i] = Object.assign({}, arg[i]);
		}
		return copy;
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

	_transformObjects() {
		console.log(' ForegroundObjects._transformObjects');

		let layoutProps = this._mainGeometry.getLayoutProps();

		let xOrigin = layoutProps.contentWidth * layoutProps.margin;
		let unitWidth = layoutProps.contentWidth*(1 - 2*layoutProps.margin);
		let yOrigin = layoutProps.horizonY;
		let unitHeight = layoutProps.contentHeight * layoutProps.horizon;

		for (let i = 0; i < this._params.foregroundObjects.length; ++i) {

			let obj = this._params.foregroundObjects[i];
			
			let width = obj.width * unitWidth;
			obj.image.setAttribute('width', width);
			
			let height = width / obj.aspectRatio;
			obj.image.setAttribute('height', height);

			let cx = 0;	
			if (obj.cx !== undefined) {
				cx = obj.cx * width;
			}

			let cy = 0;
			if (obj.cy !== undefined) {
				cy = obj.cy * height;
			}

			let x = xOrigin - cx + obj.x*unitWidth;
			let y = yOrigin - cy + obj.y*unitHeight;

			obj.image.setAttribute('x', x);
			obj.image.setAttribute('y', y);
		}	

		this._needs_transformObjects = false;
	}

	_replaceObjects() {
		console.log(' ForegroundObjects._replaceObjects');

		// The ForegroundObjects object removes and reattaches the objects every time
		//	the parameter is set.
		// TODO: change this

		this._needs_transformObjects = true;

		this._removeAllChildren(this._element);

		for (let i = 0; i < this._params.foregroundObjects.length; ++i) {

			let obj = this._params.foregroundObjects[i];

			let image = document.createElementNS(svgNS, 'image');
			image.setAttributeNS(xlinkNS, 'href', obj.imageSrc);
			image.setAttribute('preserveAspectRatio', 'xMinYMin');
			this._element.appendChild(image);

			obj.image = image;
		}

		this._needs_replaceObjects = false;
	}


	/*
	** Misc Internal Methods
	*/

	_removeAllChildren(element) {
	  while (element.firstChild) {
	    element.removeChild(element.firstChild);
	  }
	}

}


