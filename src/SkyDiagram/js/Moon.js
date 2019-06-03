/*
Moon.js
2019-06-02
*/


/*

There is some redundancy between Sun.js and Moon.js, so any change is made to one file the
	other should be reviewed to see if a similar change should be made there.

Parameters:
	moonPosition
	moonSize
	moonPhase
	moonImageSrc

Flags:
	hasMoved
	hasSizeChanged

Special Methods:
	getScreenPoint
	getScreenRadius

Dependencies:
	TrackGeometry

*/


export default class Moon {


	constructor() {

		this._params = {
			moonPosition: 0.2,


		};
	}
}



	_replaceMoonImage() {

		if (this._moon !== undefined) {
			this._moonGroup.removeChild(this._moon);
		}

		if (typeof this._moonImageSrc === 'string' && this._moonImageSrc !== '') {
			// Attach an image.
			this._moon = document.createElementNS(svgNS, 'image');
			this._moon.setAttributeNS(xlinkNS, 'href', this._moonImageSrc);
			this._moon.setAttribute('width', '80');
			this._moon.setAttribute('height', '80');
		} else {
			// Draw a filled circle -- this is just intended as a placeholder.
			// The offset is required due to the way the moon is masked.
			this._moon = document.createElementNS(svgNS, 'circle');
			this._moon.setAttribute('fill', '#e0e0e0');
			this._moon.setAttribute('r', '40');
			this._moon.setAttribute('cx', '40');
			this._moon.setAttribute('cy', '40');
		}

		this._moon.setAttribute('transform', 'translate(-40, -40)');
		this._moon.setAttribute('mask', 'url(#moon-mask)');

		this._moonGroup.appendChild(this._moon);

		this._needs_replaceMoonImage = false;
	}



	// The moon image should be an 80x80px image with an 80px diameter moon disc
	//	centered in the image. SVG is preferred. The image will be masked to
	//	indicate the phase.
	// If moonImageSrc is the empty string a placeholder disc will be drawn.

	getMoonImageSrc() {
		return this._moonImageSrc;
	}

	setMoonImageSrc(arg, warnings) {
		this._moonImageSrc = this.validateMoonImageSrc(arg, warnings);
		this._needs_replaceMoonImage = true;
	}

	validateMoonImageSrc(arg, warnings) {
		return this.validateImageSrc(arg, warnings);
	}	





			sunImageSrc: 'graphics/sun.svg',
			moonImageSrc: 'graphics/moon.svg',
			groundImageSrc: 'graphics/ground.svg',
		// Layer 4: The Moon

		this._moonGroup = document.createElementNS(svgNS, 'g');
		main.appendChild(this._moonGroup);

		// The moon is masked to indicate phases.

		this._moonMask = document.createElementNS(svgNS, 'mask');
		this._moonMask.setAttribute('id', 'moon-mask');
		this._moonGroup.appendChild(this._moonMask);

		this._moonMaskPath = document.createElementNS(svgNS, 'path');
		this._moonMaskPath.setAttribute('fill', 'white');
		this._moonMask.appendChild(this._moonMaskPath);

		// The element _moon will be created and appended to _moonGroup in _replaceMoonImage.

	_redrawPhase() {

		let delta = ((this._moonPathPosition - this._sunPathPosition)%1 + 1)%1;
		let alpha = 2*Math.PI * delta;
		let rx = Math.abs(40*Math.cos(alpha));

		if (delta === 0) {
			this._moonGroup.setAttribute('display', 'none');
		} else {
			this._moonGroup.setAttribute('display', 'inline');
		}

		let d = '';

		if (delta === 0) {
			// New moon.
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

	_recalcSunAndMoonPts() {
		// The _sunPt and _moonPt objects will have these properties:
		// 	x, y: the screen coordinates (LHS with the origin in the upper left of diagram),
		//  angle: the angle, in radians, of the tangent at that position,
		//  radius: the radius of the disc, in pixels,
		//	scale: the scale needed to be applied to the graphic to achieve the desired radius,
		//  transform: the transform string to assign to the given object's group.

		this._sunPt = this.getScreenPointForPathPosition(this._sunPathPosition);
		this._moonPt = this.getScreenPointForPathPosition(this._moonPathPosition);

		let diagonal = Math.sqrt(this._contentWidth*this._contentWidth + this._contentHeight*this._contentHeight);
		let diameter = this._sunAndMoonSize * diagonal;
	
		let radius = 0.5 * this._sunAndMoonSize * diagonal;
		this._sunPt.radius = radius;
		this._moonPt.radius = radius;
		
		let scale = (this._sunAndMoonSize * diagonal) / 80;
		this._sunPt.scale = scale;
		this._moonPt.scale = scale;

		let sunTransform = '';
		sunTransform += 'rotate(' + (this._sunPt.angle * 180 / Math.PI) + ', ' + this._sunPt.x + ', ' + this._sunPt.y + ')';
		sunTransform += ' translate(' + this._sunPt.x + ', ' + this._sunPt.y + ')';
		sunTransform += ' scale(' + this._sunPt.scale + ')';
		this._sunPt.transform = sunTransform;

		let moonTransform = '';
		moonTransform += 'rotate(' + (this._moonPt.angle * 180 / Math.PI) + ', ' + this._moonPt.x + ', ' + this._moonPt.y + ')';
		moonTransform += ' translate(' + this._moonPt.x + ', ' + this._moonPt.y + ')';
		moonTransform += ' scale(' + this._moonPt.scale + ')';
		this._moonPt.transform = moonTransform;
		
		this._needsRecalcSunAndMoonPts = false;
	}

	_moveSunAndMoon() {
		this._sunGroup.setAttribute('transform', this._sunPt.transform);
		this._moonGroup.setAttribute('transform', this._moonPt.transform);
	}


