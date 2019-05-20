/*
SkyDiagram
wgbh/asset1
astro.unl.edu
2019-05-19
*/

import './SkyDiagram.css';


export default class SkyDiagram {


	constructor(rootElement) {

		if (rootElement !== undefined) {
			this._removeAllChildren(rootElement);
			this._root = rootElement;
		} else {
			this._root = document.createElement('div');
		}
		
		this._rootStyle = window.getComputedStyle(this._root);

		this._root.classList.add('wgbh-asset1-skydiagram-root');

		this._content = document.createElement('div');
		this._content.classList.add('wgbh-asset1-skydiagram-content');
		this._root.appendChild(this._content);

		const svgNS = 'http://www.w3.org/2000/svg';
		const xlinkNS = 'http://www.w3.org/1999/xlink';

		// Background: sky and path.

		this._background = document.createElementNS(svgNS, 'svg');
		this._background.classList.add('wgbh-asset1-skydiagram-absolute');

		let defs = document.createElementNS(svgNS, 'defs');
		this._background.appendChild(defs);
		
		let skyGradient = document.createElementNS(svgNS, 'linearGradient');
		skyGradient.setAttribute('id', 'skyGradient');
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
		sky.setAttribute('fill', 'url(#skyGradient)');
		this._background.appendChild(sky);


		this._pathMask = document.createElementNS(svgNS, 'mask');
		this._pathMask.setAttribute('id', 'pathMask');
		
		this._pathMaskRect = document.createElementNS(svgNS, 'rect');
		this._pathMaskRect.setAttribute('fill', 'white');
		this._pathMaskRect.setAttribute('x', 0);
		this._pathMaskRect.setAttribute('y', 0);
		this._pathMaskRect.setAttribute('width', '100%');
		this._pathMaskRect.setAttribute('height', '100%');

		this._pathMaskMoonCircle = document.createElementNS(svgNS, 'ellipse');
		this._pathMaskMoonCircle.setAttribute('fill', 'black');

		this._pathMask.appendChild(this._pathMaskRect);
		this._pathMask.appendChild(this._pathMaskMoonCircle);
		this._background.appendChild(this._pathMask);	

		this._drawnPath = document.createElementNS(svgNS, 'path');
		this._drawnPath.setAttribute('mask', 'url(#pathMask)');
		this._drawnPath.setAttribute('fill', 'none');
		this._drawnPath.setAttribute('stroke', '#ffffff');
		this._drawnPath.setAttribute('stroke-width', '2');
		this._background.appendChild(this._drawnPath);

		this._content.appendChild(this._background);

		// Middle ground: Sun and Moon.

		this._sunGroup = document.createElementNS(svgNS, 'g');
		this._background.appendChild(this._sunGroup);

		this._sun = document.createElementNS(svgNS, 'image');
		this._sun.setAttributeNS(xlinkNS, 'href', 'sun.svg');
		this._sun.setAttribute('width', '120');
		this._sun.setAttribute('height', '120');
		this._sun.setAttribute('transform', 'translate(-60, -60)');
		this._sunGroup.appendChild(this._sun);	

//		this._sun = document.createElement('img');
//		this._sun.src = 'sun.svg';
//		this._sun.classList.add('wgbh-asset1-skydiagram-absolute');
//		this._sun.ondragstart = () => {return false;};
//		this._content.appendChild(this._sun);


		this._moonGroup = document.createElementNS(svgNS, 'g');
		this._background.appendChild(this._moonGroup);

		this._moonMask = document.createElementNS(svgNS, 'mask');
		this._moonMask.setAttribute('id', 'moonMask');

		this._moonMaskPath = document.createElementNS(svgNS, 'path');
		this._moonMaskPath.setAttribute('fill', 'white');

		this._moonMask.appendChild(this._moonMaskPath);

		this._moonGroup.appendChild(this._moonMask);

		this._moon = document.createElementNS(svgNS, 'image');
		this._moon.setAttributeNS(xlinkNS, 'href', 'moon.svg');
		this._moon.setAttribute('width', '80');
		this._moon.setAttribute('height', '80');
		this._moon.setAttribute('mask', 'url(#moonMask)');
		this._moon.setAttribute('transform', 'translate(-40, -40)');
		this._moonGroup.appendChild(this._moon);

		this._moonMask.appendChild(this._moonMaskPath);

//		this._moon = document.createElement('img');
//		this._moon.src = 'moon.svg';
//		this._moon.classList.add('wgbh-asset1-skydiagram-absolute');
//		this._moon.ondragstart = () => {return false;};
//		this._content.appendChild(this._moon);

		// Foreground: ground, objects.

		this._foreground = document.createElementNS(svgNS, 'svg');
		this._foreground.classList.add('wgbh-asset1-skydiagram-absolute');

		this._ground = document.createElementNS(svgNS, 'image');
		this._ground.setAttributeNS(xlinkNS, 'href', 'ground.svg');
		this._ground.setAttribute('preserveAspectRatio', 'none');

		this._foreground.appendChild(this._ground);

		this._content.appendChild(this._foreground);


		this._defaultParams = {
			width: 800,
			height: 300,
			horizon: 0.2,
			peak: 0.8,
			margin: 0.1,

			sunAndMoonSize: 0.05,

			path: [{x: 0.5, y: 1.0}],
			//path: [{x: 0, y: 0.75}, {x: 0.125, y: 0.875}, {x: 0.25, y: 1.0}],
			//path: [{x: 0, y: 1}],

			sunPathPosition: 0.2,
			moonPathPosition: 0,
		};

		this.setParams(this._defaultParams);
	}


	getElement() {
		return this._root;
	}


	getDefaultParams() {
		// TODO: fix, assign copy is shallow
		let copy = Object.assign({}, this._defaultParams);
		return copy;
	}


	getParams() {
		return {
			width: this._width,
			height: this._height,
			horizon: this._horizon,
			peak: this._peak,
			margin: this._margin,
			path: this._path,
			sunPathPosition: this._sunPathPosition,
			moonPathPosition: this._moonPathPosition,
			sunAndMoonSize: this._sunAndMoonSize,
		};
	}


	validateNumber(arg, paramName) {
		if (typeof arg !== 'number') {
			arg = Number(arg);
		}
		if (!Number.isFinite(arg)) {
			throw new Error(paramName + ' must be a valid number.');
		}
		return arg;
	}

	getWidth() {
		return this._width;
	}

	setWidth(arg) {
		this._width = this.validateNumber(arg, 'width');
		this._needsUpdateDimensions = true;
	}


	getHeight() {
		return this._height;
	}

	setHeight(arg) {
		this._height = this.validateNumber(arg, 'height');
		this._needsUpdateDimensions = true;
	}


	getHorizon() {
		return this._horizon;
	}

	setHorizon(arg) {
		this._horizon = this.validateNumber(arg, 'horizon');
		this._needsUpdateLayout = true;
	}


	getPeak() {
		return this._peak;
	}

	setPeak(arg) {
		this._peak = this.validateNumber(arg, 'peak');
		this._needsUpdateLayout = true;
	}


	getMargin() {
		return this._margin;
	}

	setMargin(arg) {
		this._margin = this.validateNumber(arg, 'margin');
		this._needsUpdateLayout = true;
	}


	getPath() {
		return this._path;
	}

	setPath(arg) {
		this._path = this.validatePath(arg);
		this._needsUpdatePath = true;
	}

	validatePath(arg) {
		if (arg.length % 2 !== 1) {
			throw new Error('The path array must have odd length.');
		}
		var copy = [];
		for (let i = 0; i < arg.length; ++i) {
			let pt = arg[i];
			if (typeof pt.x !== 'number') {
				pt.x = Number(pt.x);
			}
			if (typeof pt.y !== 'number') {
				pt.y = Number(pt.y);
			}
			if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) {
				throw new Error('Each object in the path array must have valid x and y properties.');
			}
			copy[i] = {x: pt.x, y: pt.y};
		}
		return copy;
	}


	getMoonPathPosition() {
		return this._moonPathPosition;
	}

	setMoonPathPosition(arg) {
		this._moonPathPosition = this.validateObjectPathPosition(arg);
		this._needsUpdatePathPositions;
	}	


	getSunPathPosition() {
		return this._sunPathPosition;
	}

	setSunPathPosition(arg) {
		this._sunPathPosition = this.validateObjectPathPosition(arg);
		this._needsUpdatePathPositions;
	}

	validateObjectPathPosition(arg) {
		if (typeof arg !== 'number') {
			arg = Number(arg);
		}
		if (!Number.isFinite(arg)) {
			throw new Error('A path position must be a finite number.');
		}
		return (arg%1 + 1)%1;
	}


	getSunAndMoonSize() {
		return this._sunAndMoonSize;
	}

	setSunAndMoonSize(arg) {
		this._sunAndMoonSize = this.validateNumber(arg, 'sunAndMoonSize');
	}



	setParams(params) {

		if (params.width !== undefined) {
			this.setWidth(params.width);
		}

		if (params.height !== undefined) {
			this.setHeight(params.height);
		}

		if (params.horizon !== undefined) {
			this.setHorizon(params.horizon);
		}

		if (params.peak !== undefined) {
			this.setPeak(params.peak);
		}

		if (params.margin !== undefined) {
			this.setMargin(params.margin);
		}

		if (params.path !== undefined) {
			this.setPath(params.path);
		}

		if (params.sunPathPosition !== undefined) {
			this.setSunPathPosition(params.sunPathPosition);
		}

		if (params.moonPathPosition !== undefined) {
			this.setMoonPathPosition(params.moonPathPosition);
		}

		if (params.sunAndMoonSize !== undefined) {
			this.setSunAndMoonSize(params.sunAndMoonSize);
		}


	}


	/*
	 * Internal Update Methods
	*/

	_update(cause) {

		if (this._needsUpdateDimensions) {
			this._updateDimensions();
		}

		if (this._needsUpdateLayout) {
			this._updateLayout();
		}

		if (this._needsPrepPath) {
			this._prepPath();
		}

		this._redraw();

		if (this._needsUpdatePathPositions) {
			this._updatePathPositions();
		}

		let event = new CustomEvent('update', {
			detail: {
				cause: cause
			}
		});

		this._root.dispatchEvent(event);
	}


	_updateDimensions() {
		this._needsUpdateLayout = true;

		this._root.style.width = this._width + 'px';
		this._root.style.height = this._height + 'px';

		this._contentWidth = this._root.clientWidth;
		this._contentHeight = this._root.clientHeight;


		this._background.setAttribute('viewBox', '0 0 ' + this._contentWidth + ' ' + this._contentHeight);
		this._foreground.setAttribute('viewBox', '0 0 ' + this._contentWidth + ' ' + this._contentHeight);
		
		this._needsUpdateDimensions = false;
	}


	_updateLayout() {
		this._needsPrepPath = true;

		this._groundOrigin = this._contentHeight*(1 - this._horizon);
		this._groundHeight = this._contentHeight - this._groundOrigin;

		if (this._groundHeight === 0) {
			this._ground.setAttribute('display', 'none');
		} else {
			this._ground.setAttribute('display', 'block');
			this._ground.setAttribute('x', '0');
			this._ground.setAttribute('y', this._contentHeight - 2*this._groundHeight);
			this._ground.setAttribute('width', this._contentWidth);
			this._ground.setAttribute('height', 2*this._groundHeight);

		}




		this._needsUpdateLayout = false;
	}


	_prepPath() {

		this._needsUpdatePathPositions = true;

		let startTime = performance.now();

		// The path is defined by the _path property. This property is an array of points (objects
		//  with x and y properties) defining the shape of the objects' path (i.e. the celestial
		//  horizon).

		// TODO: document

		// These constants are used to transform a path definition point to a screen point. 
		//  Path definition space: right-hand system with origin at lower left path/horizon
		//		intersection and <1,1> at zenith.
		//  Screen space: left-hand system with origin at upper-left corner of component.
		const pXOffset = this._contentWidth * this._margin;
		const pYOffset = this._groundOrigin;
		const pYScale = -this._peak * pYOffset;
		const pXScale = 0.5 * this._contentWidth*(1 - 2*this._margin);

		// Start by defining p as a copy of _path, with implied endpoints added.
		let p = [{x: 0, y: 0}];
		for (let i = 0; i < this._path.length; ++i) {
			let pt = this._path[i];
			p.push({x: pt.x, y: pt.y});
		}
		p.push({x: 1, y: 1});

		// Transform p to screen coordinates.
		for (let i = 0; i < p.length; ++i) {
			p[i].x = pXScale*p[i].x + pXOffset;
			p[i].y = pYScale*p[i].y + pYOffset;
		}

		// _curves will contain the quadratic bezier curves defining the sun/moon path starting at the left
		//  horizon point, going up to the zenith, and then going back down to the right horizon point.
		// Each object in _curves has these properties:
		//  a0, a1: the starting and ending anchor points (the ending anchor point of one curve will
		//					be identical to the starting anchor point of the next curve),
		// 	c: the control point for the quadratic bezier.
		// All curve points are objects with x and y properties, defined in screen space (LHS).
		this._curves = [];

		if (p.length % 2 !== 1) {
			throw new Error('Assert failed: p.length must be odd.');
		}

		let numCurves = (p.length - 1) / 2;
		let pIndex = 0;

		for (let n = 0; n < numCurves; ++n) {
			let curve = {};
			curve.a0 = p[pIndex++];
			curve.c = p[pIndex++];
			curve.a1 = p[pIndex];
			this._curves.push(curve);
		}

		let contentWidth = this._contentWidth;

		function getMirroredPoint(pt) {
			let mpt = {};
			mpt.x = contentWidth - pt.x;
			mpt.y = pt.y;
			return mpt;
		}

		// Mirror the left quadrant to the right.
		for (let i = this._curves.length - 1; i >= 0; --i) {
			let left = this._curves[i];

			let curve = {};
			curve.a0 = getMirroredPoint(left.a1);
			curve.c = getMirroredPoint(left.c);
			curve.a1 = getMirroredPoint(left.a0);

			this._curves.push(curve);
		}

		// Calculate the lookup tables for the curves.
		this._calcPathLookup();

		// Objects below the horizon will follow a linear path that continues from
		//  the horizon intersection point. This line is defined by the horizon intersection
		//  point and the 'nadir' point, which is the point 1/4th of the total path length
		//  away (below the horizon), in the direction of the path's tangent at the horizon
		//  intersection. The left and right 'nadir' points will not be the same.

		// ldx, ldy: left horizon point derivative
		// lbha: left below horizon angle, the angle going down (opposite the path tangent)
		let a0 = this._curves[0].a0;
		let c = this._curves[0].c;
		let ldx = 2*(c.x - a0.x);
		let ldy = 2*(c.y - a0.y);

		this._leftBelowHorizonTangentAngle = Math.atan2(ldy, ldx);

		let lbha = this._leftBelowHorizonTangentAngle + Math.PI;

		this._rightBelowHorizonTangentAngle = Math.PI - lbha;

		this._leftHorizonPt = {x: a0.x, y: a0.y};
		this._leftNadirPt = {};
		let quadPathLength = this._totalPathLength / 4;
		this._leftNadirPt.x = this._leftHorizonPt.x + quadPathLength * Math.cos(lbha);
		this._leftNadirPt.y = this._leftHorizonPt.y + quadPathLength * Math.sin(lbha);	

		this._rightHorizonPt = getMirroredPoint(this._leftHorizonPt);
		this._rightNadirPt = getMirroredPoint(this._leftNadirPt);

		this._needsPrepPath = false;

		let endTime = performance.now();

		//console.log('prepPath: ' + (endTime - startTime).toFixed(1) + ' ms');
	}


	_updatePathPositions() {

		let diagonal = Math.sqrt(this._contentWidth*this._contentWidth + this._contentHeight*this._contentHeight);
		let diameter = this._sunAndMoonSize * diagonal;
		let radius = 0.5 * this._sunAndMoonSize * diagonal;
		let scale = (this._sunAndMoonSize * diagonal) / 80;

		let sunPt = this.getScreenPointForPathPosition(this._sunPathPosition);
		let sunTransform = '';
		sunTransform += 'rotate(' + (sunPt.angle * 180 / Math.PI) + ', ' + sunPt.x + ', ' + sunPt.y + ')';
		sunTransform += ' translate(' + sunPt.x + ', ' + sunPt.y + ')';
		sunTransform += ' scale(' + scale + ')';
		this._sunGroup.setAttribute('transform', sunTransform);
		
//		this._moonGroup.setAttribute('transform', moonTransform);
//		this._sun.style.top = sunPt.y + 'px';
//		this._sun.style.left = sunPt.x + 'px';
//		this._sun.style.transform = 'translate(-50%, -50%) rotate(' + sunPt.angle + 'rad) scale(' + scale + ')';

		let moonPt = this.getScreenPointForPathPosition(this._moonPathPosition);
		let moonTransform = '';
		moonTransform += 'rotate(' + (moonPt.angle * 180 / Math.PI) + ', ' + moonPt.x + ', ' + moonPt.y + ')';
		moonTransform += ' translate(' + moonPt.x + ', ' + moonPt.y + ')';
		moonTransform += ' scale(' + scale + ')';
		this._moonGroup.setAttribute('transform', moonTransform);
		


		this._pathMaskMoonCircle.setAttribute('cx', moonPt.x);
		this._pathMaskMoonCircle.setAttribute('cy', moonPt.y);
		this._pathMaskMoonCircle.setAttribute('rx', radius);
		this._pathMaskMoonCircle.setAttribute('ry', radius);

		this._updatePhaseMask();

		this._needsUpdatePathPositions = false;
	}


	_updatePhaseMask() {

		let delta = ((this._moonPathPosition - this._sunPathPosition)%1 + 1)%1;
		let alpha = 2*Math.PI * delta;
		let rx = Math.abs(40*Math.cos(alpha));

		let d = 'M 40 0 ';

		console.log(delta);

		if (delta === 0) {
			// New moon.
			// TODO		

		} else if (delta < 0.25) {
			// Waning crescent.
			d = 'M 40 0 A ' + rx + ' 40 0 1 0 40 80 A 40 40 0 1 1 40 0 Z'; 	
		} else if (delta === 0.25) {
			// Third quarter.
			d = 'M 40 0 L 40 80 A 40 40 0 1 1 40 0 Z';
		} else if (delta < 0.5) {
			// Waning gibbous.
			d = 'M 40 0 A ' + rx + ' 40 0 1 1 40 80 A 40 40 0 1 1 40 0 Z';
		} else if (delta === 0.5) {
			// Full moon.
			d = 'M 40 0 A 40 40 0 1 1 40 80 A 40 40 0 1 1 40 0 Z';
		} else if (delta < 0.75) {
			// Waxing gibbous.
			d = 'M 40 0 A 40 40 0 1 1 40 80 A ' + rx + ' 40 0 1 1 40 0 Z';
		} else if (delta === 0.75) {
			// First quarter.
			d = 'M 40 0 A 40 40 0 1 1 40 80 L 40 0 Z';
		} else {
			// Waxing crescent.
			d = 'M 40 0 A 40 40 0 1 1 40 80 A ' + rx + ' 40 0 1 0 40 0 Z';
		}

		this._moonMaskPath.setAttribute('d', d);
	}


	getScreenPointForPathPosition(position) {

		let startTime = performance.now();

		// TODO: check whether improved algorithm efficiency is warranted (search for position
		// above horizon always starts at 0 and goes up linearly, both in _curves and in lookup table)

		// This method returns a screen point for a path position. The fractional part of the
		//  position argument specifies a position along the path. Some key positions:
		//	 0.0: left horizon point,
		//   0.25: zenith,
		//   0.5: right horizon point.
		// The returned object has these properties:
		// 	x, y: the screen coordinates (LHS with the origin in the upper left of diagram),
		//  angle: the angle, in radians, of the tangent at that position.

		if (!Number.isFinite(position)) {
			throw new Error('A path position must be a finite number.');
		}

		// Require position to be in [0, 1).
		position = (position%1 + 1)%1;

		let pt = {};

		if (position < 0.5) {
			// Above the horizon.

			// dist is the distance along the path to the position, starting
			//  from the left horizon point, going up.
			const dist = position * this._totalPathLength;

			// totalDist: the total distance traversed along the path so far.
			let totalDist = 0;

			// Find the curve containing the path position.
			let curve = this._curves[0];
			for (let i = 1; i < this._curves.length; ++i) {

				// nextTotalDist: next totalDist, if advancing to the next curve.
				let nextTotalDist = totalDist + curve.length;

				if (dist < nextTotalDist) {
					// The next curve starts after the position, so we've found the
					//  curve to use.
					break;
				}

				// Advance to the next curve. 
				curve = this._curves[i];
				totalDist = nextTotalDist;
			}

			let lookup = curve.lookup;

			// ts: the total length along the given curve to the position.
			let ts = dist - totalDist;

			// Find the entry in the lookup table for the sampled interval containing the position.
			let entry = lookup[0];
			for (let i = 1; i < lookup.length; ++i) {
				if (ts < lookup[i].ts) {
					// The next interval starts after the position, so we're done.
					break;
				}
				entry = lookup[i];
			}

			// Calculate the bezier parameter for the position.
			let u = entry.u + entry.du*((ts - entry.ts) / entry.s);
			
			let a0 = curve.a0;
			let c = curve.c;
			let a1 = curve.a1;

			let A = (1 - u)*(1 - u);
			let B = 2*(1 - u)*u;
			let C = u*u;

			let D = 2*(1 - u);
			let E = 2*u;

			pt.x = A*a0.x + B*c.x + C*a1.x;
			pt.y = A*a0.y + B*c.y + C*a1.y;

			let dx = D*(c.x - a0.x) + E*(a1.x - c.x);
			let dy = D*(c.y - a0.y) + E*(a1.y - c.y);

			pt.angle = Math.atan2(dy, dx);

		} else {
			// Below the horizon.

			// quadPos is the position within a quadrant.
			// quadPos in [0, 1)
			let quadPos = (4*position)%1;
	
			if (position < 0.75) {
				// Below the horizon, on the right.
				pt.x = this._rightHorizonPt.x + quadPos*(this._rightNadirPt.x - this._rightHorizonPt.x);
				pt.y = this._rightHorizonPt.y + quadPos*(this._rightNadirPt.y - this._rightHorizonPt.y);
				pt.angle = this._rightBelowHorizonTangentAngle;
			} else {
				// Below the horizon, on the left.
				pt.x = this._leftNadirPt.x + quadPos*(this._leftHorizonPt.x - this._leftNadirPt.x);
				pt.y = this._leftNadirPt.y + quadPos*(this._leftHorizonPt.y - this._leftNadirPt.y);
				pt.angle = this._leftBelowHorizonTangentAngle;
			}
		}

		let endTime = performance.now();

		//console.log('getScreenPointForPathPosition: ' + (endTime - startTime).toFixed(1) + ' ms');

		return pt;
	}


	_calcPathLookup() {

		// This method computes (by piecewise linear approximation) the length of each curve defining
		//  the path. It also generates lookup tables for each curve. These tables are used for assigning
		//  a position that is based on the actual path length, and not the bezier parameter (u).

		// This method requires that _curves be populated with the curves that define the path from
		//  the left horizon point, up to the zenith, then back down to the right horizon point. It adds
		//  a lookup property (an array of entries, see below) to each of these curve objects. It also
		//  sets the component's _totalPathLength property.

		// The path length and lookup tables do not need to be very accurate -- the path is drawn using
		//  bezier parameters (i.e. it doesn't rely on these values), and an object's position on the
		//  path is also determined using the bezier curve formula. The values calculated here
		//  are used just to determine which bezier curve a path position is on, and the bezier parameter
		//  on that curve corresponding to that position (see getScreenPointForPathPosition). The only
		//  essential requirement is that all the pieces in all the lookup tables sum up to half the
		//  calculated path length -- which this method guarantees is true. A lack of precision in the
		//  lookup tables will just introduce some non-linear distortions in an object's movement along
		//  the path.

		// minS and maxS define the target range (in pixels) for the piecewise linear approximation
		//  of each bezier curve. The distance between sampled points must be less than maxS -- the
		//  algorithm will keep reducing du until this is achieved. The distance may be less than
		//  minS, in which case the algorithm will try increasing du for the next sample. 
		// Recommendation: set maxS > 2 * minS (at least), since du is either doubled or halved.
		const maxS = 12;
		const minS = 5;

		// All the curves will sum up to half the path length (the other half is below the horizon).	
		let halfPathLength = 0;

		function dist(p1, p2) {
			let dx = p2.x - p1.x;
			let dy = p2.y - p1.y;
			return Math.sqrt(dx*dx + dy*dy);
		}

		for (let i = 0; i < this._curves.length; ++i) {

			let curve = this._curves[i];
			let a0 = curve.a0;
			let c = curve.c;
			let a1 = curve.a1;

			function curvePt(u) {
				let A = (1 - u)*(1 - u);
				let B = 2*(1 - u)*u;
				let C = u*u;

				let pt = {};
				pt.x = A*a0.x + B*c.x + C*a1.x;
				pt.y = A*a0.y + B*c.y + C*a1.y;
				return pt;
			}

			// Each curve has a lookup table assigned to it. This table consists of sampled
  		//  points along the curve. 
			// Properties of each entry in the lookup table:
			//  u: bezier parameter, monotonically increasing over the samples, in range [0, 1),
			//  du: delta u to next sample,
			//  s: linear distance, in pixels, to next sample,
			//  ts: total length of curve (by linear approx) up to the sampled point (is 0 for first entry),
			//  pt: sampled point, an object with x and y properties (in screen space).

			let u = 0;
			let du = 0.5;
			
			let lookup = [];

			let pt = {x: curve.a0.x, y: curve.a0.y};
			let npt, nu, s;

			let ts = 0;

			while (u < 1) {

				do {

					// Calculate potential next u parameter.
					nu = u + du;
					if (nu > 1) {
						// Reached end.
						du = 1 - u;
						nu = 1;
					}
					
					// Calculate the distance to the next point.
					npt = curvePt(nu);
					s = dist(pt, npt);

					// If the distance exceeds the desired limit reduce the delta and try again.
					//  Otherwise, we're done.
					if (s > maxS) {
						du *= 0.5;
						continue;
					} else {
						break;
					}

				} while (true);

				lookup.push({u: u, du: du, s: s, ts: ts, pt: pt});

				ts += s;

				u = nu;
				pt = npt;

				// If the distance was short try a larger delta next time.
				if (s < minS) {
					du *= 1.5;
				}
			}

			curve.lookup = lookup;
			curve.length = ts;
			
			halfPathLength += ts;
		}

		this._totalPathLength = 2 * halfPathLength;
	}


	_redraw() {

		this._needsUpdatePathPositions = true;

		// TODO: dusk, dawn

		if (this._sunPathPosition <= 0.5) {
			this._skyBottomStop.setAttribute('stop-color', '#efffff');
			this._skyTopStop.setAttribute('stop-color', '#9B96FF');
		} else {
			this._skyBottomStop.setAttribute('stop-color', '#323052');
			this._skyTopStop.setAttribute('stop-color', '#030305');
		}

		let d = 'M ' + this._leftNadirPt.x + ',' + this._leftNadirPt.y;
		d += ' L ' + this._leftHorizonPt.x + ',' + this._leftHorizonPt.y;
		for (let i = 0; i < this._curves.length; ++i) {
			let c = this._curves[i];
			d += ' Q ' + c.c.x + ',' + c.c.y + ' ' + c.a1.x + ',' + c.a1.y;
		}
		d += ' L ' + this._rightNadirPt.x + ',' + this._rightNadirPt.y;
		this._drawnPath.setAttribute('d', d);
	}


	/*
	 * Update
	*/

	update() {
		this._update('user');
	}

	_removeAllChildren(element) {
	  while (element.firstChild) {
	    element.removeChild(element.firstChild);
	  }
	}

}


