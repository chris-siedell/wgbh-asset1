/*
Ground.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/


/*

The Ground object is responsible for loading and scaling an image representing
	the ground, assuming a link to an image is provided. Otherwise, no ground graphic
	is shown (unlike with the sun and moon).

The ground image is scaled and placed horizontally such that it takes the entire width
	of the diagram. It is scaled and placed vertically such that the lower half of the
	image goes from the the bottom edge of the diagram to the horizon level, and the upper
	half of the image is above that. This setup allows a wavy horizon.

As the horizon parameter gets smaller the image is vertically compressed. When the horizon
	parameter is zero the ground image is hidden.

The above scaling rules mean that the image usually does not preserve its aspect ratio.

The TerrestrialGroup object has responsibility for shading the ground at night.

Parameters:
	groundImageSrc

Flags:
	<none>	

Special Methods:
	getElement

Dependencies:
	MainGeometry

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class Ground {


	constructor() {

		this._element = document.createElementNS(svgNS, 'g');

		this._params = {
			groundImageSrc: '',
		};

		this.setParams(this._params);
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
			this._needs_adjustGroundImage = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_replaceGroundImage) {
			this._replaceGroundImage();
		}

		if (this._needs_adjustGroundImage) {
			this._adjustGroundImage();
		}
	}

	clearFlags() {
		// No flags.
	}


	/*
	**	Parameter Methods
	*/

	addParams(params) {
		params.groundImageSrc = this._params.groundImageSrc;
	}

	setParams(params) {

		let vp = this.validateParams(params);

		for (let key in this._params) {
			if (vp[key] !== undefined) {
				this._params[key] = vp[key];
			}
		}

		if (vp.groundImageSrc !== undefined) {
			this._needs_replaceGroundImage = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.groundImageSrc !== undefined) {
			vp.groundImageSrc = this._validateImageSrc(params.groundImageSrc);
		}

		return vp;
	}


	/*
	**	Internal Helpers for Parameter Methods
	*/

	_validateImageSrc(arg) {
		if (typeof arg !== 'string') {
			throw new Error('The image src must be a string.');
		}
		return arg;
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

	_replaceGroundImage() {
		//console.log(' Ground._replaceGroundImage');

		this._needs_adjustGroundImage = true;

		if (typeof this._params.groundImageSrc === 'string' && this._params.groundImageSrc !== '') {
			// Attach an image.

			let newGround = document.createElementNS(svgNS, 'image');
			newGround.setAttributeNS(xlinkNS, 'href', this._params.groundImageSrc);
			newGround.setAttribute('preserveAspectRatio', 'none');
			newGround.setAttribute('x', 0);
			newGround.setAttribute('width', '100%');

			if (this._ground !== undefined) {
				this._element.replaceChild(newGround, this._ground);
			} else {
				this._element.appendChild(newGround);
			}

			this._ground = newGround;

		} else {
			// No ground image specified.

			if (this._ground !== undefined) {
				this._element.removeChild(this._ground);
				this._ground = undefined;
			}
		}
		
		this._needs_replaceGroundImage = false;

	}

	_adjustGroundImage() {
		//console.log(' Ground._adjustGroundImage');
	
		// The method adjusts the vertical placement and scaling of the ground image.

		if (this._ground !== undefined) {
	
			let layoutProps = this._mainGeometry.getLayoutProps();
	
			let groundHeight = 2*(layoutProps.contentHeight - layoutProps.horizonY);
	
			if (groundHeight <= 0) {
				this._ground.setAttribute('display', 'none');
			} else {
				this._ground.setAttribute('display', 'inline');
				this._ground.setAttribute('height', groundHeight);
				this._ground.setAttribute('y', layoutProps.contentHeight - groundHeight);
			}
		}
		
		this._needs_adjustGroundImage = false;
	}

}


