/*
Sky.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/


/*

The Sky object is responsible for drawing the sky gradient.

Parameters:
	dayBottomColor
	dayTopColor
	nightBottomColor
	nightTopColor

Flags:
	<none>

Special Methods:
	getElement

Dependencies:
	MainGeometry
	Sun

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Sky {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');

		let defs = document.createElementNS(svgNS, 'defs');
		this._element.appendChild(defs);
		
		let skyGradient = document.createElementNS(svgNS, 'linearGradient');
		skyGradient.setAttribute('id', 'sky-gradient');
		skyGradient.setAttribute('gradientTransform', 'rotate(-90, 1, 0)');
		defs.appendChild(skyGradient);

		this._skyBottomStop = document.createElementNS(svgNS, 'stop');
		this._skyBottomStop.setAttribute('offset', '0');
		skyGradient.appendChild(this._skyBottomStop);

		this._skyTopStop = document.createElementNS(svgNS, 'stop');
		this._skyTopStop.setAttribute('offset', '1');
		skyGradient.appendChild(this._skyTopStop);

		let sky = document.createElementNS(svgNS, 'rect');
		sky.setAttribute('x', '0');
		sky.setAttribute('y', '0');
		sky.setAttribute('rx', '0');
		sky.setAttribute('ry', '0');
		sky.setAttribute('width', '100%');
		sky.setAttribute('height', '100%');
		sky.setAttribute('fill', 'url(#sky-gradient)');
		this._element.appendChild(sky);

		this._params = {
			dayBottomColor: '#29abe2',
			dayTopColor: '#155ac7',
			nightBottomColor: '#323052',
			nightTopColor: '#030305',
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
			this._needs_redrawSky = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_redrawSky) {
			this._redrawSky();
		}

		if (this._needs_adjustSkyHorizon) {
			this._adjustSkyHorizon();
		}
	}

	clearFlags() {
		// No flags.
	}


	/*
	**	Parameter Methods
	*/

	assignParams(params) {
		params.dayBottomColor		= this._params.dayBottomColor;
		params.dayTopColor			= this._params.dayTopColor;
		params.nightBottomColor	= this._params.nightBottomColor;
		params.nightTopColor		= this._params.nightTopColor;
	}

	setParams(params) {

		let vp = this.validateParams(params);

		for (let key in this._params) {
			if (vp[key] !== undefined) {
				this._params[key] = vp[key];
			}
		}

		if (vp.dayBottomColor !== undefined || vp.dayTopColor !== undefined
					|| vp.nightBottomColor !== undefined || vp.nightTopColor !== undefined) {
			this._needs_redrawSky = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.dayBottomColor !== undefined) {
			vp.dayBottomColor = params.dayBottomColor;
		}

		if (params.dayTopColor !== undefined) {
			vp.dayTopColor = params.dayTopColor;
		}

		if (params.nightBottomColor !== undefined) {
			vp.nightBottomColor = params.nightBottomColor;
		}

		if (params.nightTopColor !== undefined) {
			vp.nightTopColor = params.nightTopColor;
		}

		return vp;
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

	_redrawSky() {
		console.log(' Sky._redrawSky');

		let sunPosition = this._sun.getPosition();

		// TODO: dusk, dawn
		// TODO: don't assign attributes if no change


		console.log('=== sunPosition: '+sunPosition);

		if (sunPosition <= 0.5) {
			this._skyBottomStop.setAttribute('stop-color', this._params.dayBottomColor);
			this._skyTopStop.setAttribute('stop-color', this._params.dayTopColor);
		} else {
			this._skyBottomStop.setAttribute('stop-color', this._params.nightBottomColor);
			this._skyTopStop.setAttribute('stop-color', this._params.nightTopColor);
		}

		this._needs_redrawSky = false;
	}

	_adjustSkyHorizon() {
		console.log(' Sky._adjustSkyHorizon');

		// The bottom of the sky starts at the horizon level.

		let layoutParams = this._mainGeometry.getLayoutProps();
		this._skyBottomStop.setAttribute('offset', layoutParams.horizon);

		this._needs_adjustSkyHorizon = false;
	}

}


