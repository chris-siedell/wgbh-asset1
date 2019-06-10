/*
ForegroundObjects.js
wgbh-skydiagram
astro.unl.edu
2019-06-09
*/


/*

The ForegroundObjects instance is responsible for creating and managing the individual ForegroundObject
	instances. It does this with the foregroundObjects array parameter.

Each element in the foregroundObjects array must be an object with an ID property (a unique, non-empty
	string).

All objects in the foregroundObjects array must be represented every time the parameter is set -- if an object
	is not represented it will be removed. Represented means that the object exists with its ID property set.

Example:
	There are three objects, with IDs "A", "B", and "C". Object C is having its x parameter set to 0. The
	following is the minimum required to successfully make this change:
		skyDiagram.setParams({ foregroundObjects: [{ID: "A"}, {ID: "B"}, {ID: "C", params: {x: 0}}] }); 
		skyDiagram.update();

The order of the objects in the array determines their stacking order in the layout. Items are stacked from
	back to front. The order may be changed by simply by resubmitting the foregroundObjects array with the
	represented objects in the new order.

Example:
	Three objects are in the order (from back to front) of A, B, and then C. The positions of B and C are to
	swapped. The following call will make that change:
		skyDiagram.setParams({ foregroundObjects: [{ID: "A"}, {ID: "C"}, {ID: "B"}] });
		skyDiagram.update();


Parameters:
	foregroundObjects		- this must be an array of objects with the following properties:
													ID 			- always required,
													params	- an optional object, which if defined will provide the
																		parameters for the assigned ForegroundObject instance
												see notes above for more details

Special Methods:
	getObjectForID(id)


*/

export default class ForegroundObjects {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');

		let defaultParams = {
			foregroundObjects: [],
		};

		this._objects = [];
		this._newObjects = [];

		this._params = {};
		this.setParams(defaultParams);
	}



	getObjectForID(id) {
		for (let i = 0; i < this._objects.length; ++i) {
			if (this._objects[i].getID() === id) {
				return this._objects[i];
			}
		}
		return undefined;
	}	

	setParams(params) {

		let vp = this.validateParams(params);


	}

	validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('foregroundObjects')) {
			vp.foregroundObjects = this._validateForegroundObjects(params.foregroundObjects);
		}

		return vp;
	}

	_validateForegroundObjects(arg) {
		// The foregroundObjects parameter is valid if:
		//	- it is an array,
		//	- each element in the array is an object, and
		//	- each object in the array has a valid ID parameter.
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

			if (typeof arg[i] !== 'object') {
				throw new Error('All elements in the foregroundObjects array must be objects.');
			}

			if (typeof arg[i].ID !== 'string') {
				throw new Error('All object IDs in the foregroundObjects array must be strings.');
			}

			let ID = arg[i].ID.trim();

			if (ID === '') {
				throw new Error('All object IDs in the foregroundObjects array must be non-empty.');
			}

			if (IDs.indexof(ID) !== -1) {
				throw new Error('All object IDs in the foregroundObjects array must be unique.');
			}

			IDs.push(ID);

			copy[i] = {ID: ID};
		}

		return copy;
	}


	_updateObjectsList() {

		// This method needs to be called whenever an object has been added, removed, or
		//	has changed order.

		let newObjects = [];

		for (let i = 0; i < this._params.foregroundObjects.length; ++i) {
			let params = this._params.foregroundObjects[i];

			let object = params.getObjectForID(params.ID);
			if (object === undefined) {
				object = new ForegroundObject(this, params.ID);
			}

			newObjects[i] = object;
		}


		// Remove all the objects and re-attach them in the new order.

		while (this._element.firstChild) {
			this._element.removeChild(this._element.firstChild);
		}
	
		for (let i = 0; i < this._objects.length; ++i) {
			this._element.appendChild(this._objects[i].getElement());
		}

		this._needs_updateObjectsList = false;
	}





