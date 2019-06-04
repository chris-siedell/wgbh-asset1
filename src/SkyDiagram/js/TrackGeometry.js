/*
TrackGeometry.js
wgbh-skydiagram
astro.unl.edu
2019-06-03
*/


/*

The TrackGeometry object is responsible only for the geometry of the
 sun-moon track (i.e. celestial equator) -- it does not manage any visual content.

See Track.js for the object responsible for drawing the track.

Parameters:
	trackPath

Flags:
	hasTrackChanged

Special Methods:
	getTrackPathData
	getScreenPointForPosition

Dependencies:
	MainGeometry

*/


export default class TrackGeometry {


	constructor() {

		this._params = {
			trackPath: [{x: 0.5, y: 1.0}],
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
			this._needs_updateTrack = true;
		}

		// Call internal update sub-methods as required.

		if (this._needs_updateTrack) {
			this._updateTrack();
		}
	}

	clearFlags() {
		this._hasTrackChanged = false;
	}

	getHasTrackChanged() {
		return this._hasTrackChanged;
	}


	/*
	**	Parameter Methods
	*/

	addParams(params) {
		params.trackPath = this._copyTrackPath(this._params.trackPath);
	}

	setParams(params) {

		let vp = this.validateParams(params);

		for (let key in this._params) {
			if (vp[key] !== undefined) {
				this._params[key] = vp[key];
			}
		}

		if (vp.trackPath !== undefined) {
			this._needs_updateTrack = true;
		}
	}	

	validateParams(params) {

		let vp = {};

		if (params.trackPath !== undefined) {
			vp.trackPath = this._validateTrackPath(params.trackPath);
		}

		return vp;
	}


	/*
	**	Internal Helpers for Parameter Methods
	*/

	_validateTrackPath(arg) {
		if (arg.length % 2 !== 1) {
			throw new Error('The trackPath array must have odd length.');
		}
		var copy = this._copyTrackPath(arg);
		for (let i = 0; i < copy.length; ++i) {
			let pt = copy[i];
			if (typeof pt.x !== 'number') {
				pt.x = Number(pt.x);
			}
			if (typeof pt.y !== 'number') {
				pt.y = Number(pt.y);
			}
			if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) {
				throw new Error('Each object in the trackPath array must have valid x and y properties.');
			}
		}
		return copy;
	}

	_copyTrackPath(arg) {
		let copy = [];
		for (let i = 0; i < arg.length; ++i) {
			let pt = arg[i];
			copy[i] = {x: pt.x, y: pt.y};
		}
		return copy;
	}


	/*
	**	Special Methods
	*/

	getTrackPathData() {
		return this._trackPathData;
	}

	getScreenPointForPosition(position) {

		//let startTime = performance.now();

		// TODO: check whether improved algorithm efficiency is warranted (search for position
		// above horizon always starts at 0 and goes up linearly, both in _curves and in lookup table)

		// This method returns a screen point for a track position. The fractional part of the
		//  position argument specifies a position along the track. Some key positions:
		//	 0.0: left horizon point,
		//   0.25: zenith,
		//   0.5: right horizon point.
		// The returned object has these properties:
		// 	x, y: the screen coordinates (LHS with the origin in the upper left of content area),
		//  angle: the angle, in radians, of the tangent at that position.

		if (!Number.isFinite(position)) {
			throw new Error('A track position must be a finite number.');
		}

		// Require position to be in [0, 1).
		position = (position%1 + 1)%1;

		let pt = {};

		if (position < 0.5) {
			// Above the horizon.

			// dist is the distance along the track to the position, starting
			//  from the left horizon point, going up.
			const dist = position * this._totalTrackLength;

			// totalDist: the total distance traversed along the track so far.
			let totalDist = 0;

			// Find the curve containing the track position.
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

		//let endTime = performance.now();
		//console.log('getScreenPointForPosition: ' + (endTime - startTime).toFixed(1) + ' ms');

		return pt;
	}


	/*
	**	Internal Update Methods
	*/

	_updateTrack() {
		console.log(' TrackGeometry._updateTrack');

		//let startTime = performance.now();

		// This method needs to be called if any of these MainGeometry flags are raised:
		// 	haveLayoutPropsChanged
		// It will also need to be called if any of the following parameters have changed:
		//	trackPath
		// This method will raise the following flags:
		//	hasTrackChanged
		// It creates and updates these internal properties (with the help of sub-methods):
		//	_curves
		//	_trackPathData
		//	_leftBelowHorizonTangentAngle
		//	_rightBelowHorizonTangentAngle
		//	_leftHorizonPt
		//	_leftNadirPt
		//	_rightHorizonPt
		//	_rightNadirPt

		this._hasTrackChanged = true;

		let layoutProps = this._mainGeometry.getLayoutProps();

		// The sun-moon track is defined by the trackPath parameter. This parameter is an array of
		//	points (objects with x and y properties) defining the shape of the track (essentially
		//	the celestial equator). These are alternately control and anchor points of a series
		//	of connected quadratic bezier curves. The initial and final anchor points are implied.

		// These constants are used to transform a track path definition point to a screen point. 
		//  Track path definition space: right-hand system with origin at lower left track/horizon
		//		intersection and <1,1> at zenith.
		//  Screen space: left-hand system with origin at upper-left corner of content area (inset
		//		from component edge if a border is defined).
		const pXOffset = layoutProps.contentWidth * layoutProps.margin;
		const pYOffset = layoutProps.horizonY;
		const pYScale = -layoutProps.peak * pYOffset;
		const pXScale = 0.5 * layoutProps.contentWidth*(1 - 2*layoutProps.margin);

		// Start by defining p as a copy of _trackPath, with implied endpoints added.
		let p = [{x: 0, y: 0}];
		for (let i = 0; i < this._params.trackPath.length; ++i) {
			let pt = this._params.trackPath[i];
			p.push({x: pt.x, y: pt.y});
		}
		p.push({x: 1, y: 1});

		// Transform p to screen coordinates.
		for (let i = 0; i < p.length; ++i) {
			p[i].x = pXScale*p[i].x + pXOffset;
			p[i].y = pYScale*p[i].y + pYOffset;
		}

		// _curves will contain the quadratic bezier curves defining the sun/moon track starting at the left
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

		let contentWidth = layoutProps.contentWidth;

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
		this._calcCurvesLookupTables();

		// Objects below the horizon will follow a linear path that continues from
		//  the horizon intersection point. This line is defined by the horizon intersection
		//  point and the 'nadir' point, which is the point 1/4th of the total track length
		//  away (below the horizon), in the direction of the track's tangent at the horizon
		//  intersection. The left and right 'nadir' points will not be the same.

		// ldx, ldy: left horizon point derivative
		// lbha: left below horizon angle, the angle going down (opposite the track tangent)
		let a0 = this._curves[0].a0;
		let c = this._curves[0].c;
		let ldx = 2*(c.x - a0.x);
		let ldy = 2*(c.y - a0.y);

		this._leftBelowHorizonTangentAngle = Math.atan2(ldy, ldx);

		let lbha = this._leftBelowHorizonTangentAngle + Math.PI;

		this._rightBelowHorizonTangentAngle = Math.PI - lbha;

		this._leftHorizonPt = {x: a0.x, y: a0.y};
		this._leftNadirPt = {};
		let quadPathLength = this._totalTrackLength / 4;
		this._leftNadirPt.x = this._leftHorizonPt.x + quadPathLength * Math.cos(lbha);
		this._leftNadirPt.y = this._leftHorizonPt.y + quadPathLength * Math.sin(lbha);	

		this._rightHorizonPt = getMirroredPoint(this._leftHorizonPt);
		this._rightNadirPt = getMirroredPoint(this._leftNadirPt);

		// Calculate the track path data.
		this._calcTrackPathData();

		this._needs_updateTrack = false;

		//let endTime = performance.now();
		//console.log('prepPath: ' + (endTime - startTime).toFixed(1) + ' ms');
	}


	_calcTrackPathData() {
		// This helper method is called by _updateTrack. It calculates _trackPathData,
		// 	which is a string suitable for setting the d attribute of an SVG path element.
		// It includes the linear parts of the track below the horizon.
		// It does not include cutouts around sun and moon -- use a mask for that.
		let d = 'M ' + this._leftNadirPt.x + ',' + this._leftNadirPt.y;
		d += ' L ' + this._leftHorizonPt.x + ',' + this._leftHorizonPt.y;
		for (let i = 0; i < this._curves.length; ++i) {
			let c = this._curves[i];
			d += ' Q ' + c.c.x + ',' + c.c.y + ' ' + c.a1.x + ',' + c.a1.y;
		}
		d += ' L ' + this._rightNadirPt.x + ',' + this._rightNadirPt.y;
		this._trackPathData = d;
	}


	_calcCurvesLookupTables() {

		// This helper method is called by _updateTrack. It assumes _curves exists and is ready.
		//  It will populate each bezier curve in _curves with a lookup table, and it will calculate
		//	_totalTrackLength.

		// This method computes by piecewise linear approximation the length of each curve defining
		//  the track. It also generates lookup tables for each curve. These tables are used for assigning
		//  a position that is based on the actual curve length, and not the bezier parameter (u).

		// This method requires that _curves be populated with the curves that define the track from
		//  the left horizon point, up to the zenith, and then back down to the right horizon point. It adds
		//  a lookup property (an array of entries, see below) to each of these curve objects. It also
		//  sets the object's _totalTrackLength property.

		// The track length and lookup tables do not need to be very accurate -- the track is drawn using
		//  bezier parameters (i.e. it doesn't rely on these values), and an object's position on the
		//  track is also determined using the bezier curve formula. The values calculated here
		//  are used just to determine which bezier curve a track position is on, and the bezier parameter
		//  on that curve corresponding to that position (see getScreenPointForPosition). The only
		//  critical requirement is that all the pieces in all the lookup tables sum up to half the
		//  calculated track length -- which this method guarantees is true. A lack of precision in the
		//  lookup tables will just introduce some non-linear distortions in an object's movement along
		//  the track.

		// minS and maxS define the target range (in pixels) for the piecewise linear approximation
		//  of each bezier curve. The distance between sampled points must be less than maxS -- the
		//  algorithm will keep reducing du until this is achieved. The distance may be less than
		//  minS, in which case the algorithm will try increasing du for the next sample. 
		// Recommendation: set maxS > 2 * minS (at least), since du is either doubled or halved.
		const maxS = 12;
		const minS = 5;

		// All the curves will sum up to half the track length (the other half is below the horizon).	
		let halfTrackLength = 0;

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
			
			halfTrackLength += ts;
		}

		this._totalTrackLength = 2 * halfTrackLength;
	}

}


