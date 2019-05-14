/*
SkyDiagram
wgbh/asset1
astro.unl.edu
2019-05-12
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
		
		this._root.classList.add('wgbh-asset1-skydiagram-root');

		this._content = document.createElement('div');
		this._content.classList.add('wgbh-asset1-skydiagram-content');
		this._root.appendChild(this._content);

		this._rootStyle = window.getComputedStyle(this._root);

		this._skyCanvas = document.createElement('canvas');
		this._content.appendChild(this._skyCanvas);

		this._defaultParams = {
			width: 800,
			height: 300,
			horizon: 0.2,
			peak: 0.8,
			margin: 0.1,
			//path: [{x: 0.5, y: 1.0}],
			path: [{x: 0, y: 0.75}, {x: 0.125, y: 0.875}, {x: 0.25, y: 1.0}],
			//path: [{x: 0, y: 1}],

			sunPathPosition: 0.5,
			moonPathPosition: 0.2,
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
		};
	}


	getWidth() {
		return this._width;
	}

	setWidth(arg) {
		this._width = arg;
		this._needsUpdateDimensions = true;
	}


	getHeight() {
		return this._height;
	}

	setHeight(arg) {
		this._height = arg;
		this._needsUpdateDimensions = true;
	}


	getHorizon() {
		return this._horizon;
	}

	setHorizon(arg) {
		this._horizon = arg;
		this._needsUpdateLayout = true;
	}


	getPeak() {
		return this._peak;
	}

	setPeak(arg) {
		this._peak = arg;
		this._needsUpdateLayout = true;
	}


	getMargin() {
		return this._margin;
	}

	setMargin(arg) {
		this._margin = arg;
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
			throw new Error('path array must have odd length.');
		}
		var copy = [];
		for (let i = 0; i < arg.length; ++i) {
			let pt = arg[i];
			if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) {
				throw new Error('Each object in the path array must have valid x and y properties.');
			}
			copy[i] = {x: pt.x, y: pt.y};
		}
		return copy;
	}


	getSunPathPosition() {
		return this._sunPathPosition;
	}

	setSunPathPosition(arg) {
		this._sunPathPosition = this.validateObjectPathPosition(arg);
		this._needsUpdatePathPositions;
	}

	validateObjectPathPosition(arg) {
		if (!Number.isFinite(arg)) {
			throw new Error('A path position must be a finite number.');
		}
		return (arg%1 + 1)%1;
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
		//	this.setMoonPathPosition(params.moonPathPosition);
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

		this._skyCanvas.width = this._contentWidth;
		this._skyCanvas.height = this._contentHeight;

		this._needsUpdateDimensions = false;
	}


	_updateLayout() {
		this._needsPrepPath = true;

		this._groundOrigin = this._contentHeight*(1 - this._horizon);
		this._groundHeight = this._contentHeight - this._groundOrigin;

		this._needsUpdateLayout = false;
	}


	_prepPath() {

		this._needsUpdatePathPositions = true;

		let startTime = performance.now();

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

		// _segments will contain the piecewise definition of the sun/moon path starting at the left
		//  horizon point, going up to the zenith, and then going back down to the right horizon point.
		// Each object in _segments has these properties:
		//  a0, a1: the starting and ending anchor points (the ending anchor point of one segment will
		//					be identical to the starting anchor point of the next segment),
		// 	cq: the control point for the quadratic bezier (from definition),
		//  cc0, cc1: the control points for the cubic bezier (derived).
		// All segment points are objects with x and y properties, defined in screen space (LHS).
		this._segments = [];

		if (p.length % 2 !== 1) {
			throw new Error('Assert failed: p.length must be odd.');
		}

		let numSegments = (p.length - 1) / 2;
		let pIndex = 0;

		for (let n = 0; n < numSegments; ++n) {
			let segment = {};
			segment.a0 = p[pIndex++];
			segment.qc = p[pIndex++];
			segment.a1 = p[pIndex];
			segment.cc0 = {	x: segment.a0.x + (2/3)*(segment.qc.x - segment.a0.x),
											y: segment.a0.y + (2/3)*(segment.qc.y - segment.a0.y)};
			segment.cc1 = { x: segment.a1.x + (2/3)*(segment.qc.x - segment.a1.x),
											y: segment.a1.y + (2/3)*(segment.qc.y - segment.a1.y)};
			this._segments.push(segment);
		}


		let contentWidth = this._contentWidth;

		function getMirroredPoint(pt) {
			let mpt = {};
			mpt.x = contentWidth - pt.x;
			mpt.y = pt.y;
			return mpt;
		}

		// Mirror the left quadrant to the right.
		for (let i = this._segments.length - 1; i >= 0; --i) {
			let left = this._segments[i];

			let segment = {};
			segment.a0 = getMirroredPoint(left.a1);
			segment.qc = getMirroredPoint(left.qc);
			segment.a1 = getMirroredPoint(left.a0);
			segment.cc0 = getMirroredPoint(left.cc1);
			segment.cc1 = getMirroredPoint(left.cc0);

			this._segments.push(segment);
		}

		// Calculate the lookup tables for the segments.
		this._calcPathLookup();

		// Determine the total path length (has to be done after _calcPathLookup).
		// The path length from the left horizon, up to the zenith, and then back down
		//  to the right horizon defined as exactly half the total path length.
		let halfPathLength = 0;
		for (let i = 0; i < this._segments.length; ++i) {
			halfPathLength += this._segments[i].length;
		}
		this._totalPathLength = 2 * halfPathLength;

		// Objects below the horizon will follow a linear path that continues from
		//  the horizon intersection point. This line is defined by the horizon intersection
		//  point and the 'nadir' point, which is the point 1/4th of the total path length
		//  away (below the horizon), in the direction of the path's tangent at the horizon
		//  intersection. The left and right 'nadir' points will not be the same.

		// ldx, ldy: left horizon point derivative
		// lbha: left below horizon angle
		let s = this._segments[0];
		let ldx = 2*(s.qc.x - s.a0.x);
		let ldy = 2*(s.qc.y - s.a0.y);
		let lbha = Math.atan2(ldy, ldx) + Math.PI;

		this._leftHorizonPt = {x: s.a0.x, y: s.a0.y};
		this._leftNadirPt = {};
		let quadPathLength = this._totalPathLength / 4;
		this._leftNadirPt.x = this._leftHorizonPt.x + quadPathLength * Math.cos(lbha);
		this._leftNadirPt.y = this._leftHorizonPt.y + quadPathLength * Math.sin(lbha);	

		this._rightHorizonPt = getMirroredPoint(this._leftHorizonPt);
		this._rightNadirPt = getMirroredPoint(this._leftNadirPt);

		this._needsPrepPath = false;

		let endTime = performance.now();

		console.log('prepPath: ' + (endTime - startTime).toFixed(1) + ' ms');
	}


	_updatePathPositions() {

		let sunPt = this.getScreenPointForPathPosition(this._sunPathPosition);

		let ctx = this._skyCanvas.getContext('2d');

		ctx.beginPath();
		ctx.fillStyle = 'rgb(255, 255, 200)';
		ctx.ellipse(sunPt.x, sunPt.y, 10, 10, 0, 0, 2*Math.PI);
		ctx.fill();

		
		this._needsUpdatePathPositions = false;
	}

	getScreenPointForPathPosition(position) {

		let startTime = performance.now();

		// TODO: check whether improved algorithm efficiency is warranted (search for position
		// above horizon always starts at 0 and goes up linearly)

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

		// position in [0, 1)
		position = (position%1 + 1)%1;

		let pt = {};

		if (position < 0.5) {
			// Above the horizon.

			// dist is the distance along the path to the position, starting
			//  from the left horizon point.
			const dist = position * this._totalPathLength;

			// totalDist: the total distance traversed along path so far
			let totalDist = 0;

			// Find the curve containing the path position.
			let segment = this._segments[0];
			for (let i = 1; i < this._segments.length; ++i) {

				// nextTotalDist: next totalDist, if advancing to the next curve
				let nextTotalDist = totalDist + segment.length;

				if (dist < nextTotalDist) {
					// The next curve starts after the position.
					break;
				}

				segment = this._segments[i];
				totalDist = nextTotalDist;
			}

			let lookup = segment.lookup;

			// ts: the total length along this curve to the position.
			let ts = dist - totalDist;

			// Find the entry in the lookup table for the interval containing the position.
			let entry = lookup[0];
			for (let i = 1; i < lookup.length; ++i) {
				if (ts < lookup[i].ts) {
					// The next interval starts after the position.
					break;
				}
				entry = lookup[i];
			}

			// Calculate the bezier parameter for the position.
			let u = entry.u + entry.du*((ts - entry.ts) / entry.s);
			
			let a0 = segment.a0;
			let qc = segment.qc;
			let a1 = segment.a1;

			let A = (1 - u)*(1 - u);
			let B = 2*(1 - u)*u;
			let C = u*u;

			pt.x = A*a0.x + B*qc.x + C*a1.x;
			pt.y = A*a0.y + B*qc.y + C*a1.y;

		} else {
			// Below the horizon.

			// quadPos is the position within a quadrant.
			// quadPos in [0, 1)
			let quadPos = (4*position)%1;
	
			if (position < 0.75) {
				// Below the horizon, on the right.
				pt.x = this._rightHorizonPt.x + quadPos*(this._rightNadirPt.x - this._rightHorizonPt.x);
				pt.y = this._rightHorizonPt.y + quadPos*(this._rightNadirPt.y - this._rightHorizonPt.y);
			} else {
				// Below the horizon, on the left.
				pt.x = this._leftNadirPt.x + quadPos*(this._leftHorizonPt.x - this._leftNadirPt.x);
				pt.y = this._leftNadirPt.y + quadPos*(this._leftHorizonPt.y - this._leftNadirPt.y);
			}
		}


		let endTime = performance.now();

		console.log('getScreenPointForPathPosition: ' + (endTime - startTime).toFixed(1) + ' ms');

		return pt;
	}


	_calcPathLookup() {

		// This method computes (by piecewise linear approximation) the length of each curve defining
		//  the path. It also generates lookup tables for each curve. These tables are used for assigning
		//  a position that is based on the actual path length, and not the bezier parameter (u).

		// minS and maxS define the target range (in pixels) for the piecewise linear approximation
		//  of the bezier curve. The distance between sampled points must be less than maxS -- the
		//  algorithm will keep reducing du until this is achieved. The distance may be less than
		//  minS, in which case the algorithm will try increasing du for the next sample. 
		const maxS = 1.5;
		const minS = 0.5;

		function dist(p1, p2) {
			let dx = p2.x - p1.x;
			let dy = p2.y - p1.y;
			return Math.sqrt(dx*dx + dy*dy);
		}

		for (let i = 0; i < this._segments.length; ++i) {

			let segment = this._segments[i];
			let a0 = segment.a0;
			let qc = segment.qc;
			let a1 = segment.a1;

			function curvePt(u) {
				let A = (1 - u)*(1 - u);
				let B = 2*(1 - u)*u;
				let C = u*u;

				let pt = {};
				pt.x = A*a0.x + B*qc.x + C*a1.x;
				pt.y = A*a0.y + B*qc.y + C*a1.y;
				return pt;
			}

			// Each segment has a lookup table assigned to it. This table consists of sampled
  		//  points along the curve. 
			// Properties of each entry in the lookup table:
			//  u - bezier parameter, monotonically increasing over the samples, in range [0, 1)
			//  du - delta u to next sample
			//  s - linear distance, in pixels, to next sample
			//  ts - total length of curve (by linear approx) up to the sampled point (is 0 for first entry)
			//  pt - sampled point, an object with x and y properties (in screen space)

			let u = 0;
			let du = 0.5;
			
			let lookup = [];

			let pt = {x: segment.a0.x, y: segment.a0.y};
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

				// If the distance was small try a larger delta next time.
				if (s < minS) {
					du *= 1.5;
				}
			}

			segment.lookup = lookup;
			segment.length = ts;
		}


	}

	_redraw() {

		this._needsUpdatePathPositions = true;

		let ctx = this._skyCanvas.getContext('2d');

		ctx.fillStyle = 'rgb(200, 200, 250)';
		ctx.fillRect(0, 0, this._contentWidth, this._contentHeight);

		ctx.fillStyle = 'rgb(150, 90, 90)';
		ctx.fillRect(0, this._groundOrigin, this._contentWidth, this._groundHeight);

		ctx.strokeStyle = 'rgb(235, 235, 255)';
		ctx.lineWidth = 2;

		let s = this._segments[0];
		ctx.beginPath();
		ctx.moveTo(s.a0.x, s.a0.y);
		for (let i = 0; i < this._segments.length; ++i) {
			let s = this._segments[i];
			ctx.quadraticCurveTo(s.qc.x, s.qc.y, s.a1.x, s.a1.y);
		}
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = 'rgb(200, 255, 200)';
		ctx.moveTo(this._leftHorizonPt.x, this._leftHorizonPt.y);
		ctx.lineTo(this._leftNadirPt.x, this._leftNadirPt.y);
		ctx.moveTo(this._rightHorizonPt.x, this._rightHorizonPt.y);
		ctx.lineTo(this._rightNadirPt.x, this._rightNadirPt.y);
		ctx.stroke();
		
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


