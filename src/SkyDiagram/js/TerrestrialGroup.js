/*
TerrestrialGroup.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/	


/*

The TerrestrialGroup object is responsible for applying shading to the terrestrial layers
	(the ground and foreground objects) at nighttime.

Parameters:
	nightShading		- the numerical factor that controls the max intensity of the nighttime shading;
										values should be between 0 (completely black) to 1 (no change)

Flags:
	<none>

Special Methods:
	getElement			- returns the svg group element into which terrestrial layers should be added
	getFilter				- returns the svg filter element that is applied to the terrestrial group element

Dependencies:
	Sun

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class TerrestrialGroup {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');
		
		this._filter = document.createElementNS(svgNS, 'filter');
		this._filter.setAttribute('id', 'terrestrial-filter');
		
		this._filterMatrix = document.createElementNS(svgNS, 'feColorMatrix');
		this._filterMatrix.setAttribute('in', 'SourceGraphic');
		this._filterMatrix.setAttribute('type', 'matrix');
		this._filterMatrix.setAttribute('values', '0.5 0 0 0 0  0 0.5 0 0 0  0 0 0.5 0 0  0 0 0 1 0');
		this._filter.appendChild(this._filterMatrix);

		// Start in known state (shading level = 1; no filter applied).
		this._element.setAttribute('filter', 'none');
		this._shadingLevel = 1;

		let defaultParams = {
			nightShading: 0.5,
		};

		this._params = {};
		this.setParams(defaultParams);
	}


	/*
	**	Linking Dependencies
	*/

	link(otherObjects) {
		this._sun = otherObjects.sun;
	}


	/*
	**	Update Cycle Methods
	*/
	
	update() {

		// Check dependencies.

		if (this._sun.getHasPositionChanged()) {
			this._needs_updateFilter = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_updateFilter) {
			this._updateFilter();
		}
	}

	clearFlags() {
		// No flags.
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

		if (vp.hasOwnProperty('nightShading')) {
			this._needs_updateFilter = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('nightShading')) {
			vp.nightShading = this._validateNightShading(params.nightShading);
		}

		return vp;
	}


	/*
	**	Internal Helpers for Parameter Methods
	*/

	_validateNightShading(arg) {
		arg = this._validateNumber(arg, 'nightShading');
		if (arg < 0) {
			arg = 0;
		} else if (arg > 1) {
			arg = 1;
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

	getFilter() {
		return this._filter;
	}


	/*
	**	Internal Update Methods
	*/

	_updateFilter() {
		//console.log(' TerrestrialGroup._updateFilter');

		// TODO: dusk, dawn

		let sunPosition = this._sun.getPosition();

		let newShadingLevel;

		if (sunPosition <= 0.5) {
			newShadingLevel = 1;
		} else {
			newShadingLevel = this._params.nightShading;
		}

		// Just in case.
		if (newShadingLevel < 0) {
			newShadingLevel = 0;
		} else if (newShadingLevel > 1) {
			newShadingLevel = 1;
		}

		if (newShadingLevel !== this._shadingLevel) {
			// Shading level has changed.

			if (newShadingLevel === 1) {
				// Going from some shading to no shading -- un-assign the filter.
				this._element.setAttribute('filter', 'none');
				//console.log('  ...removing filter');
			} else if (this._shadingLevel === 1) {
				// Going from no shading to some shading -- re-assign the filter.
				this._element.setAttribute('filter', 'url(#terrestrial-filter)');
				//console.log('  ...adding filter');
			}

			this._shadingLevel = newShadingLevel;

			// Adjust the filter.
			// (Doing it when shadingLevel is 1 is should not be necessary since the filter is not applied.)
			let n = String(this._shadingLevel);
			this._filterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');

		} else {
			//console.log('  ...no change');
			// No change to shading level -- nothing needs to be done.
		}

		this._needs_updateFilter = false;
	}

}


