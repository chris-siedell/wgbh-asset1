/*
ForegroundObjects.js
wgbh-skydiagram
astro.unl.edu
2019-06-10
*/


import ForegroundObject from './ForegroundObject.js';


/*

The ForegroundObjects object is responsible for creating and managing the individual ForegroundObject
	instances. It does this with the foregroundObjects array parameter.

Each element in the foregroundObjects array must be an object with an ID property (a unique, non-empty
	string).

All objects in the foregroundObjects array must be represented every time the parameter is set -- if an object
	is not represented it will be removed. Represented means that an object exists in the foregroundObjects array
	with its ID property set.

Example:
	There are three objects, with IDs "A", "B", and "C". Object C is having its x parameter set to 0. The
	following is the minimum required to successfully make this change:
		skyDiagram.setParams({ foregroundObjects: [{ID: "A"}, {ID: "B"}, {ID: "C", params: {x: 0}}] }); 
		skyDiagram.update();

Counter-example:
	Given the set-up described above, the following would update object C's x parameter *and* remove objects
	A and B:
		skyDiagram.setParams({ foregroundObjects: [{ID: "C", params: {x: 0}}] }); 
		skyDiagram.update();

The order of the objects in the array determines their stacking order in the layout. Items are stacked from
	back to front. The order may be changed by simply by resubmitting the foregroundObjects array with the
	represented objects in the new order.

Example:
	Three objects are in the order (from back to front) of A, B, and then C. The positions of B and C are to
	be swapped. The following call will make that change:
		skyDiagram.setParams({ foregroundObjects: [{ID: "A"}, {ID: "C"}, {ID: "B"}] });
		skyDiagram.update();


Parameters:
	foregroundObjects		- this must be an array of objects with the following properties:
													ID 			- always required,
													params	- an optional object; if defined it will provide the
																		parameters for the specific ForegroundObject instance

Flags:
	<none>

Special Methods:
	getElement()				- returns the SVG group element containing all the foreground objects
	getObjectForID(ID)	- will return a ForegroundObject instance or undefined

Dependencies:
	<none>

*/


const svgNS = 'http://www.w3.org/2000/svg';


export default class ForegroundObjects {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');

		// The ForegroundObjects class does not use the _params convention
		//	since it has just one parameter (foregroundObjects). This parameter
		//	has a complicated management mechanism since it involves distinct
		//	ForegroundObject instances.

		// _objects effectively backs the foregroundObjects parameter. It contains
		//	ForegroundObject instances.
		this._objects = [];
		this._needs_updateElements = false;
	}


	/*
	**	Linking Dependencies
	*/

	link(otherObjects) {
		// This object has no dependencies, but the ForegroundObject instances
		//	it creates do.
		this._otherObjects = otherObjects;
	}


	/*
	**	Update Cycle Methods
	*/

	update() {

		// Update the fixed system objects first.
		let relObjs = [];
		for (const obj of this._objects) {
			if (obj.getUsesAbsoluteSystem()) {
				obj.update();
			} else {
				relObjs.push(obj);
			}
		}

		// Update the relative system objects.
		for (const obj of relObjs) {
			obj.update();
		}

		if (this._needs_updateElements) {
			this._updateElements();
		}
	}

	clearFlags() {
		for (const obj of this._objects) {
			obj.clearFlags();
		}
	}


	/*
	**	Parameter Methods
	*/

	addParams(params) {
		let fobjs = [];
		for (let i = 0; i < this._objects.length; ++i) {
			fobjs[i] = {
				ID: this._objects[i].getID(),
				params: this._objects[i].getParams(),
			};
		}
		params.foregroundObjects = fobjs;
	}

	setParams(params) {

		let vp = ForegroundObjects.validateParams(params);

		this._setParams(vp);
	}

	_setParams(vp) {

		if (vp.hasOwnProperty('foregroundObjects')) {

			// Create a new objects list, re-using existing ForegroundObject
			//	instances if possible.
			let newObjects = [];
			for (let i = 0; i < vp.foregroundObjects.length; ++i) {
				
				// Reminder: fobj will have an ID property, but may or may not
				//	have a params property.

				let fobj = vp.foregroundObjects[i];

				let obj = this.getObjectForID(fobj.ID);
				if (obj === undefined) {
					obj = new ForegroundObject(fobj.ID);
					obj.link(this._otherObjects);
				}
				newObjects[i] = obj;

				// If params exists it has already been validated.
				if (fobj.hasOwnProperty('params')) {
					obj._setParams(fobj.params);
				}
			}

			// Has the list changed? That is, have objects have been added, removed,
			//	or their relative positions changed? If so, the elements will need
			//	to be updated.
			if (newObjects.length !== this._objects.length) {
				this._needs_updateElements = true;
			} else {
				for (let i = 0; i < newObjects.length; ++i) {
					if (newObjects[i].ID !== this._objects[i].getID()) {
						this._needs_updateElements = true;
						break;
					}
				}
			}

			this._objects = newObjects;
		}
	}


	/*
	**	Special Methods
	*/

	getElement() {
		return this._element;
	}

	getObjectForID(ID) {
		for (const obj of this._objects) {
			if (obj.getID() === ID) {
				return obj;
			}
		}
		return undefined;
	}	

	
	/*
	**	Internal Update Methods
	*/

	_updateElements() {
		// This method updates the object's SVG elements. This means removing the
		//	elements that are no longer in the list, adding new elements, and
		//	re-ordering elements as necessary.
		// This is done simply by removing all the elements from the group and then
		//	re-attaching them.

		while (this._element.firstChild) {
			this._element.removeChild(this._element.firstChild);
		}

		for (let i = 0; i < this._objects.length; ++i) {
			this._element.appendChild(this._objects[i].getElement());
		}

		this._needs_updateElements = false;
	}


	/*
	**	[Static] Parameter Validation Methods
	*/

	static validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('foregroundObjects')) {
			vp.foregroundObjects = ForegroundObjects._validateForegroundObjects(params.foregroundObjects);
		}

		return vp;
	}

	static _validateForegroundObjects(arg) {
		// The foregroundObjects parameter is valid if:
		//	- it is an array,
		//	- each element in the array is an object, and
		//	- each object in the array has a valid ID property,
		//	- if an object in the array has a params property, it passes validation using
		//		ForegroundObject.validateParams.
		// A valid ID parameter:
		//	- is a string,
		//	- is non-empty if trimmed, and
		//	- is unique if trimmed.

		let copy = [];

		if (!Array.isArray(arg)) {
			throw new Error('The foregroundObjects parameter must be an array.');
		}

		let IDs = [];

		for (let i = 0; i < arg.length; ++i) {

			let obj = arg[i];

			if (typeof obj !== 'object') {
				throw new Error('All elements in the foregroundObjects array must be objects.');
			}

			if (typeof obj.ID !== 'string') {
				throw new Error('All object IDs in the foregroundObjects array must be strings.');
			}

			let ID = obj.ID.trim();

			if (ID === '') {
				throw new Error('All object IDs in the foregroundObjects array must be non-empty.');
			}

			if (IDs.indexOf(ID) !== -1) {
				throw new Error('All object IDs in the foregroundObjects array must be unique.');
			}

			IDs.push(ID);

			copy[i] = {ID: ID};

			if (obj.hasOwnProperty('params')) {
				copy[i].params = ForegroundObject.validateParams(obj.params);
			}
		}

		return copy;
	}

}


