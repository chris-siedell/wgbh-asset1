/*
MainGeometry.js
2019-06-02
*/


/*

The MainGeometry object manages the essential parameters that control the
 size and layout of the diagram.

It also creates and controls the size and position of the diagram's root div
 and the svg element it contains. 

Parameters:
	width
	height
	horizon
	peak
	margin	

Flags:
	haveDimensionsChanged
	haveLayoutPropsChanged

Special Methods:
	getRoot
	getSVG
	getDimensions
	getContentDimensions
	getLayoutProps

Dependencies:
	<none>

*/


const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class MainGeometry {

	constructor() {

		this._root = document.createElement('div');
		this._root.classList.add('wgbh-skydiagram-root');

		this._svg = document.createElementNS(svgNS, 'svg');
		this._svg.classList.add('wgbh-skydiagram-svg');
		this._root.appendChild(this._svg);

		this._params = {
			width: 800,
			height: 400,
			horizon: 0.2,
			peak: 0.8,
			margin: 0.1,
		};
	
		this.setParams(this._params);	
	}

	/*
	**	Linking Dependencies
	*/

	link(domain) {
		// No dependencies.
	}


	/*
	**	Update Cycle Methods
	*/

	update() {

		// Call internal update sub-methods as required.

		if (this._needs_updateDimensions) {
			this._updateDimensions();
		}

		if (this._needs_updateLayoutProps) {
			this._updateLayoutProps();
		}
	}

	clearFlags() {
		this._haveDimensionsChanged = false;
		this._haveLayoutPropsChanged = false;
	}

	getHaveDimensionsChanged() {
		return this._haveDimensionsChanged;
	}
	
	getHaveLayoutPropsChanged() {
		return this._haveLayoutPropsChanged;
	}


	/*
	**	Parameter Methods
	*/

	assignParams(params) {
		params.width = this._params.width;
		params.height = this._params.height;
		params.horizon = this._params.horizon;
		params.peak = this._params.peak;
		params.margin = this._params.margin;
	}

	setParams(params) {

		let vp = this.validateParams(params);

		for (let key in this._params) {
			if (vp[key] !== undefined) {
				this._params[key] = vp[key];
			}
		}

		if (vp.width !== undefined || vp.height !== undefined) {
			this._needs_updateDimensions = true;
		}

		if (vp.horizon !== undefined || vp.peak !== undefined || vp.margin !== undefined) {
			this._needs_updateLayoutProps = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.width !== undefined) {
			vp.width = this._validateNumber(params.width, 'width');
		}

		if (params.height !== undefined) {
			vp.height = this._validateNumber(params.height, 'height');
		}

		if (params.horizon !== undefined) {
			vp.horizon = this._validateNumber(params.horizon, 'horizon');
		}

		if (params.peak !== undefined) {
			vp.peak = this._validateNumber(params.peak, 'peak');
		}

		if (params.margin !== undefined) {
			vp.margin = this._validateNumber(params.margin, 'margin');
		}

		return vp;
	}


	/*
	**	Internal Helpers for Parameter Methods
	*/

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
	** Special Methods
	*/

	getRoot() {
		return this._root;
	}

	getSVG() {
		return this._svg;
	}

	getDimensions() {
			return {width: this._params.width, height: this._params.height};
	}

	getContentDimensions() {
			return {width: this._contentWidth, height: this._contentHeight};
	}

	getLayoutProps() {
		// This method returns an object whose properties are a mix of parameters
		//	and derived quantities that affect the overall layout of the diagram.
		// See _updateLayoutProps for specific properties.
		return Object.assign({}, this._layoutProps);
	}


	/*
	**	Internal Update Methods
	*/

	_updateDimensions() {
		
		this._haveDimensionsChanged = true;

		this._needs_updateLayoutProps = true;

		this._root.style.width = this._params.width + 'px';
		this._root.style.height = this._params.height + 'px';

		this._contentWidth = this._root.clientWidth;
		this._contentHeight = this._root.clientHeight;

		this._main.setAttribute('viewBox', '0 0 ' + this._contentWidth + ' ' + this._contentHeight);
		
		this._needs_updateDimensions = false;
	}


	_updateLayoutProps() {

		this._haveLayoutPropsChanged = true;

		this._horizonY = this._contentHeight*(1 - this._params.horizon);

		this._layoutProps = {

			// Parameters:
			horizon: this._params.horizon,
			peak: this._params.peak,
			margin: this._params.margin,

			// Derived properties:
			contentWidth: this._contentWidth,
			contentHeight: this._contentHeight,
			horizonY: this._horizonY,
		};

		this._needs_updateLayoutProps = false;
	}

}


