/*
Sky.js
wgbh-skydiagram
astro.unl.edu
2019-06-17
*/


/*

The Sky object is responsible for drawing the sky gradient. It is also responsible for creating
	and updating the filter that applies shading at nighttime.

Parameters:
	dayBottomColor
	dayTopColor
	nightBottomColor
	nightTopColor
	skyTransitionBelowThreshold	- the sun altitude lower transition threshold as a positive sunPosition delta below the horizon
	skyTransitionAboveThreshold	- the sun altitude upper transition threshold as a positive sunPosition delta above the horizon
	skyLevelTransitionPower			- this parameter determines the linearity of the response of the sky brightness
																during the transitions
	darkestShadingLevel					- the number that determines the shading level at the darkest time of night;
																values should be between 0 (completely black) to 1 (no change)
	shadingLevelTransitionPower - this number is used to determine the shading curve during the twilight phase
																of the transition; a value of 1 gives a linear response; a value of 6, for
																example, would give a slow then fast shading response as the sun is about to rise

The sky varies in brightness from when the sun is below the horizon to when it is above, according to the
	transition threshold parameters. The ground and foreground vary in brightness only when the sun is below the horizon.
	When the sun is above the horizon the ground and foreground are always at full brightness.

Example: Assume skyTransitionBelowThreshold is 0.1 and skyTransitionAboveThreshold is 0.05. Assuming the sun position is
	increasing, the sky will start getting brighter when the sun position is 0.9 and continue until full brightness when
	the position is 0.05. The ground and foreground will also start getting brighter when the sun is at 0.9, and it will
	reach full brightness when the sun is at 0.0.

Flags:
	hasShadingLevelChanged

Special Methods:
	getSkyElement				- the SVG group element containing the sky fill
	getFilterElement		- the SVG filter element with an id of "night-shading"
	getShadingLevel			- returns the current shading level, which is a function of the sun position; this
												number will be in the range [darkestShadingLevel, 1], where 1 means no shading is
												being applied, in which case the filter could be removed without change of appearance

Dependencies:
	MainGeometry
	Sun

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Sky {


	constructor() {

		this._skyLevel = -1;
		this._shadingLevel = 1;

		this._filter = document.createElementNS(svgNS, 'filter');
		this._filter.setAttribute('id', 'night-shading');
		
		this._filterMatrix = document.createElementNS(svgNS, 'feColorMatrix');
		this._filterMatrix.setAttribute('in', 'SourceGraphic');
		this._filterMatrix.setAttribute('type', 'matrix');
		let n = this._shadingLevel.toString();
		this._filterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');
		this._filter.appendChild(this._filterMatrix);

		this._element = document.createElementNS(svgNS, 'g');

		let defs = document.createElementNS(svgNS, 'defs');
		this._element.appendChild(defs);
		
		let nightGradient = document.createElementNS(svgNS, 'linearGradient');
		nightGradient.setAttribute('id', 'night-gradient');
		nightGradient.setAttribute('gradientTransform', 'rotate(-90, 1, 0)');
		defs.appendChild(nightGradient);
		
		let dayGradient = document.createElementNS(svgNS, 'linearGradient');
		dayGradient.setAttribute('id', 'day-gradient');
		dayGradient.setAttribute('gradientTransform', 'rotate(-90, 1, 0)');
		defs.appendChild(dayGradient);

		this._nightBottomStop = document.createElementNS(svgNS, 'stop');
		this._nightBottomStop.setAttribute('offset', '0');
		nightGradient.appendChild(this._nightBottomStop);

		this._nightTopStop = document.createElementNS(svgNS, 'stop');
		this._nightTopStop.setAttribute('offset', '1');
		nightGradient.appendChild(this._nightTopStop);

		this._dayBottomStop = document.createElementNS(svgNS, 'stop');
		this._dayBottomStop.setAttribute('offset', '0');
		dayGradient.appendChild(this._dayBottomStop);

		this._dayTopStop = document.createElementNS(svgNS, 'stop');
		this._dayTopStop.setAttribute('offset', '1');
		dayGradient.appendChild(this._dayTopStop);

		let nightSky = document.createElementNS(svgNS, 'rect');
		nightSky.setAttribute('x', '0');
		nightSky.setAttribute('y', '0');
		nightSky.setAttribute('rx', '0');
		nightSky.setAttribute('ry', '0');
		nightSky.setAttribute('width', '100%');
		nightSky.setAttribute('height', '100%');
		nightSky.setAttribute('fill', 'url(#night-gradient)');
		this._element.appendChild(nightSky);

		this._daySky = document.createElementNS(svgNS, 'rect');
		this._daySky.setAttribute('x', '0');
		this._daySky.setAttribute('y', '0');
		this._daySky.setAttribute('rx', '0');
		this._daySky.setAttribute('ry', '0');
		this._daySky.setAttribute('width', '100%');
		this._daySky.setAttribute('height', '100%');
		this._daySky.setAttribute('fill', 'url(#day-gradient)');
		this._element.appendChild(this._daySky);

		this._needs_redrawSkyGradients = true;
		this._needs_adjustSkyHorizon = true;
		this._needs_updateLevels = true;
	
		this._params = {
			dayBottomColor: '#29abe2',
			dayTopColor: '#155ac7',
			nightBottomColor: '#323052',
			nightTopColor: '#030305',
			skyTransitionBelowThreshold: 0.15,
			skyTransitionAboveThreshold: 0.05,
			skyLevelTransitionPower: 2,
			darkestShadingLevel: 0.5,
			shadingLevelTransitionPower: 3,
		};

		this.setParams(this._params);
	}


	/*
	**	Linking Dependencies
	*/

	link(otherObjects) {
		this._mainGeometry = otherObjects.mainGeometry;
		this._sun = otherObjects.sun;
	}


	/*
	**	Update Cycle Methods
	*/

	update() {

		// Check dependencies.

		if (this._mainGeometry.getHaveLayoutPropsChanged()) {
			this._needs_adjustSkyHorizon = true;
		}

		if (this._sun.getHasPositionChanged()) {
			this._needs_updateLevels = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_redrawSkyGradients) {
			this._redrawSkyGradients();
		}

		if (this._needs_adjustSkyHorizon) {
			this._adjustSkyHorizon();
		}

		if (this._needs_updateLevels) {
			this._updateLevels();
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

	assignParams(params) {
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

		if (vp.hasOwnProperty('dayBottomColor') || vp.hasOwnProperty('dayTopColor')
					|| vp.hasOwnProperty('nightBottomColor') || vp.hasOwnProperty('nightTopColor')) {
			this._needs_redrawSkyGradients = true;
		}

		// Some straightforward derived values are calculated here, instead of deferring to the update.

		if (vp.hasOwnProperty('skyTransitionBelowThreshold') || vp.hasOwnProperty('skyTransitionAboveThreshold')) {
	
			// The labels 'start' and 'end' make sense if the sun position is increasing.	
			this._leftTransitionStart = ((-this._params.skyTransitionBelowThreshold)%1 + 1)%1;
			this._leftTransitionEnd = (this._params.skyTransitionAboveThreshold%1 + 1)%1;
			this._rightTransitionStart = ((0.5 - this._params.skyTransitionAboveThreshold)%1 + 1)%1;
			this._rightTransitionEnd = ((0.5 + this._params.skyTransitionBelowThreshold)%1 + 1)%1;
			this._transitionDuration = this._params.skyTransitionBelowThreshold + this._params.skyTransitionAboveThreshold;

			this._needs_updateLevels = true;
		}

		if (vp.hasOwnProperty('darkestShadingLevel')) {

			this._nightShadingRange = 1 - this._params.darkestShadingLevel;

			this._needs_updateLevels = true;
		}

		if (vp.hasOwnProperty('skyLevelTransitionPower') || vp.hasOwnProperty('shadingLevelTransitionPower')) {
			this._needs_updateLevels = true;
		}
	}

	validateParams(params) {

		let vp = {};

		if (params.hasOwnProperty('dayBottomColor')) {
			vp.dayBottomColor = params.dayBottomColor;
		}

		if (params.hasOwnProperty('dayTopColor')) {
			vp.dayTopColor = params.dayTopColor;
		}

		if (params.hasOwnProperty('nightBottomColor')) {
			vp.nightBottomColor = params.nightBottomColor;
		}

		if (params.hasOwnProperty('nightTopColor')) {
			vp.nightTopColor = params.nightTopColor;
		}

		if (params.hasOwnProperty('skyTransitionBelowThreshold')) {
			vp.skyTransitionBelowThreshold = this._validateThreshold(params.skyTransitionBelowThreshold, 'skyTransitionBelowThreshold');
		}

		if (params.hasOwnProperty('skyTransitionAboveThreshold')) {
			vp.skyTransitionAboveThreshold = this._validateThreshold(params.skyTransitionAboveThreshold, 'skyTransitionAboveThreshold');
		}

		if (params.hasOwnProperty('skyLevelTransitionPower')) {
			vp.skyLevelTransitionPower = this._validatePower(params.skyLevelTransitionPower, 'skyLevelTransitionPower');
		}

		if (params.hasOwnProperty('darkestShadingLevel')) {
			vp.darkestShadingLevel = this._validateDarkestShadingLevel(params.darkestShadingLevel);
		}

		if (params.hasOwnProperty('shadingLevelTransitionPower')) {
			vp.shadingLevelTransitionPower = this._validatePower(params.shadingLevelTransitionPower, 'shadingLevelTransitionPower');
		}

		return vp;
	}

	
	/*
	**	Internal Helpers for Parameter Methods
	*/

	_validateThreshold(arg, name) {
		let v = this._validateNumber(arg, name);
		return (v%1 + 1)%1;
	}

	_validateDarkestShadingLevel(arg) {
		arg = this._validateNumber(arg, 'darkestShadingLevel');
		if (arg < 0) {
			arg = 0;
		} else if (arg > 1) {
			arg = 1;
		}
		return arg;
	}

	_validatePower(arg, name) {
		arg = this._validateNumber(arg, name);
		if (arg < 0.1) {
			arg = 0.1;
		} else if (arg > 10) {
			arg = 10;
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

	getSkyElement() {
		return this._element;
	}

	getFilterElement() {
		return this._filter;
	}

	getShadingLevel() {
		return this._shadingLevel;
	}


	/*
	**	Internal Update Methods
	*/

	_redrawSkyGradients() {
		//console.log(' Sky._redrawSkyGradients');

		// This method needs to be called when the color stops have changed.

 		this._dayBottomStop.setAttribute('stop-color', this._params.dayBottomColor);
 		this._dayTopStop.setAttribute('stop-color', this._params.dayTopColor);
 		this._nightBottomStop.setAttribute('stop-color', this._params.nightBottomColor);
 		this._nightTopStop.setAttribute('stop-color', this._params.nightTopColor);

		this._needs_redrawSkyGradients = false;
	}

	_adjustSkyHorizon() {
		//console.log(' Sky._adjustSkyHorizon');

		// This method needs to be called when the horizon parameter has changed.
		// The bottoms of the sky gradients start at the horizon level.

		let layoutParams = this._mainGeometry.getLayoutProps();
		this._nightBottomStop.setAttribute('offset', layoutParams.horizon);
		this._dayBottomStop.setAttribute('offset', layoutParams.horizon);

		this._needs_adjustSkyHorizon = false;
	}

	_updateLevels() {
		//console.log(' Sky._updateLevels');

		// This method calculates the levels for the sky brightness and the ground/foreground shading. It applies any changes
		//	to the appropriate SVG elements.
		// It needs to be called if the sun position, transition parameters, or darkestShadingLevel have changed.

		let sunPosition = (this._sun.getPosition()%1 + 1)%1;

		// 'full night' is defined as the sun altitude (determined by position) being less than skyTransitionBelowThreshold.
		// 'full day' is defined as the sun altitude (determined by position) being greater than skyTransitionAboveThreshold.

		// Let u be a parameter that goes linearly from 0 to 1 during the transition from full night to full day.
		let u;
		
		// The following requires that all values are in the range [0, 1).

		if (sunPosition < this._leftTransitionEnd) {
			// Sky transition on left -- sun above horizon.
			u = (this._params.skyTransitionBelowThreshold + sunPosition) / this._transitionDuration;
		} else if (sunPosition < this._rightTransitionStart) {
			// Full day.
			u = 1;
		} else if (sunPosition < 0.5) {
			// Sky transition on right -- sun above horizon.
			u = 1 - ((sunPosition - this._rightTransitionStart) / this._transitionDuration);
		} else if (sunPosition < this._rightTransitionEnd) {
			// Sky transition on right -- sun below horizon.
			u = 1 - ((sunPosition - this._rightTransitionStart) / this._transitionDuration);
		} else if (sunPosition < this._leftTransitionStart) {
			// Full night.
			u = 0;
		} else {
			// Sky transition on left -- sun below horizon.
			u = (sunPosition - this._leftTransitionStart) / this._transitionDuration;
		}

		let newSkyLevel = Math.pow(u, this._params.skyLevelTransitionPower);
		if (newSkyLevel !== this._skyLevel) {

			// Sky level has changed.
			this._skyLevel = newSkyLevel;
		
			// Update the sky gradients.
			this._daySky.setAttribute('opacity', this._skyLevel);
		}

		let newShadingLevel = this._params.darkestShadingLevel + this._nightShadingRange * Math.pow(u, this._params.shadingLevelTransitionPower);
		if (newShadingLevel !== this._shadingLevel) {

			// Shading level has changed.
			this._hasShadingLevelChanged = true;
			this._shadingLevel = newShadingLevel;

			// Update the filter.
			let n = this._shadingLevel.toString();
			this._filterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');
		}

		this._needs_updateLevels = false;
	}

}


