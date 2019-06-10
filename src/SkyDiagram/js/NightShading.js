/*
NightShading.js
wgbh-skydiagram
astro.unl.edu
2019-06-09
*/	


/*

The NightShading object is responsible for creating and updating the filter that applies
	shading at nighttime.

Parameters:
	darkestShadingLevel		- the number that determines the shading level at the darkest time of night;
													values should be between 0 (completely black) to 1 (no change)

Flags:
	hasShadingLevelChanged

Special Methods:
	getElement				- returns the svg filter element that other elements can reference; e.g.
												otherSvgElement.setAttribute('filter', 'url(#night-shading)');
	getShadingLevel		- returns the current shading level, which is a function of the sun position; this
											number will be in the range [darkestShadingLevel, 1], where 1 means no shading is
											being applied, in which case the filter could be removed without change of appearance

Dependencies:
	Sun

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class NightShading {


	constructor() {

		this._shadingLevel = 1;
		
		this._filter = document.createElementNS(svgNS, 'filter');
		this._filter.setAttribute('id', 'night-shading');
		
		this._filterMatrix = document.createElementNS(svgNS, 'feColorMatrix');
		this._filterMatrix.setAttribute('in', 'SourceGraphic');
		this._filterMatrix.setAttribute('type', 'matrix');
		let n = this._shadingLevel.toString();
		this._filterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');
		this._filter.appendChild(this._filterMatrix);

		let defaultParams = {
			darkestShadingLevel: 0.5,
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
		this._hasShadingLevelChanged = false;
	}

	getHasShadingLevelChanged() {
		return this._hasShadingLevelChanged;
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

		if (vp.hasOwnProperty('darkestShadingLevel')) {
			this._needs_updateFilter = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('darkestShadingLevel')) {
			vp.darkestShadingLevel = this._validateDarkestShadingLevel(params.darkestShadingLevel);
		}

		return vp;
	}


	/*
	**	Internal Helpers for Parameter Methods
	*/

	_validateDarkestShadingLevel(arg) {
		arg = this._validateNumber(arg, 'darkestShadingLevel');
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
		return this._filter;
	}

	getShadingLevel() {
		return this._shadingLevel;
	}


	/*
	**	Internal Update Methods
	*/

	_updateFilter() {
		//console.log(' NightShading._updateFilter');

		// TODO: dusk, dawn

		let sunPosition = this._sun.getPosition();

		let newShadingLevel;

		if (sunPosition <= 0.5) {
			newShadingLevel = 1;
		} else {
			newShadingLevel = this._params.darkestShadingLevel;
		}

		// Just in case.
		if (newShadingLevel < 0) {
			newShadingLevel = 0;
		} else if (newShadingLevel > 1) {
			newShadingLevel = 1;
		}

		if (newShadingLevel !== this._shadingLevel) {

			// Shading level has changed.
			this._hasShadingLevelChanged = true;
			this._shadingLevel = newShadingLevel;

			// Update the filter.
			let n = this._shadingLevel.toString();
			this._filterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');
		}

		this._needs_updateFilter = false;
	}

}


