/*
SkyDiagram.js
wgbh-skydiagram
astro.unl.edu
2019-06-02
*/


import './css/SkyDiagram.css';


// The code for SkyDiagram has been separated out into these objects:
import './js/MainGeometry.js';
import './js/TrackGeometry.js';
import './js/Sky.js';
import './js/Track.js';
import './js/Sun.js';
import './js/Moon.js';
import './js/TerrestrialGroup.js';
import './js/Ground.js';
import './js/ForegroundObjects.js';



const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';


export default class SkyDiagram {


	constructor() {


		// The separate code objects making up the SkyDiagram need to refer to
		//	each other. This is done with the _domain object and linking.
		this._domain = {};

		this._domain.mainGeometry				=	new MainGeometry();
		this._domain.trackGeometry			= new TrackGeometry();
		this._domain.sky								= new Sky();
		this._domain.track							= new Track();
		this._domain.sun								= new Sun();
		this._domain.moon								= new Moon();
		this._domain.terrestrialGroup		= new TerrestrialGroup();
		this._domain.ground							= new Ground();
		this._domain.foregroundObjects	= new ForegroundObjects();

		// The linking step allows the code objects to make any necessary
		//	references to other code objects.
		for (let key in this._domain) {
			this._domain[key].link(this._domain);
		}	
		
		// The SkyDiagram component consists of an outer div (aka the root, which is what is
		//	returned by getElement), and an inner SVG. This arrangement allows the diagram
		//	to have an inset border. The root div and svg elements are created by MainGeometry.

		// The SVG has several layers, added from back to front. The layers are managed by
		//	separate objects.

		let svg = this._mainGeometry.getSVG();

		svg.appendChild(this._sky.getElement());
		svg.appendChild(this._track.getElement());
		svg.appendChild(this._sun.getElement());
		svg.appendChild(this._moon.getElement());

		// Everything in the terrestrial group get shading applied to it at nighttime.

		let terrestrialGroup = this._terrestrialGroup.getElement();
		svg.appendChild(terrestrialGroup);

		terrestrialGroup.appendChild(this._ground.getElement());
		terrestrialGroup.appendChild(this._foregroundObjects.getElement());
	}

	getElement() {
		return this._mainGeometry.getRoot();
	}


	getParams() {
		let params = {};
		this._mainGeometry.addParams(params);
		this._trackGeometry.addParams(params);
		this._sky.addParams(params);


		params.sunPathPosition = this._sunPathPosition;
		params.moonPathPosition = this._moonPathPosition;
		params.sunAndMoonSize = this._sunAndMoonSize;
		params.dayBottomColor = this._dayBottomColor;
		params.dayTopColor = this._dayTopColor;
		params.nightBottomColor = this._nightBottomColor;
		params.nightTopColor = this._nightTopColor;
		params.pathColor = this._pathColor;
		params.pathWidth = this._pathWidth;
		params.nightForegroundShading = this._nightForegroundShading;
		return params;
	}

	setDayBottomColor(arg) {
		this._dayBottomColor = arg;
	}

	setDayTopColor(arg) {
		this._dayTopColor = arg;
	}

	setNightBottomColor(arg) {
		this._nightBottomColor = arg;
	}

	setNightTopColor(arg) {
		this._nightTopColor = arg;
	}



	setNightForegroundShading(arg) {
		this._nightForegroundShading = this.validateNightForegroundShading(arg);
		let n = String(this._nightForegroundShading);
		this._foregroundFilterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');
	}

	validateNightForegroundShading(arg) {
		arg = this.validateNumber(arg, 'nightForegroundShading');
		if (arg < 0) {
			arg = 0;
		} else if (arg > 1) {
			arg = 1;
		}
		return arg;
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


/*
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
*/




	getMoonPathPosition() {
		return this._moonPathPosition;
	}

	setMoonPathPosition(arg) {
		this._moonPathPosition = this.validateObjectPathPosition(arg);
		this._needsRecalcSunAndMoonPts = true;
	}	


	getSunPathPosition() {
		return this._sunPathPosition;
	}

	setSunPathPosition(arg) {
		this._sunPathPosition = this.validateObjectPathPosition(arg);
		this._needsRecalcSunAndMoonPts = true;
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
		this._needsRecalcSunAndMoonPts = true;
	}



	setParams(params) {

/*
		for (let key in params) {

			let cappedKey = key[0].toUpperCase() + key.slice(1);
			let setter = 'set' + cappedKey;
			let validator = 'validate' + cappedKey;

			console.log(key);
			console.log(validator);
			console.log(setter);
			console.log(' ' + params[key]);
		}
*/

		this._mainGeometry.setParams(params);
		this._trackGeometry.setParams(params);
		this._sunGeometry.setParams(params);
		this._moonGeometry.setParams(params);
		this._track.setParams(params);


		if (params.sunImageSrc !== undefined) {
			this.setSunImageSrc(params.sunImageSrc);
		}
		
		if (params.moonImageSrc !== undefined) {
			this.setMoonImageSrc(params.moonImageSrc);
		}

		if (params.groundImageSrc !== undefined) {
			this.setGroundImageSrc(params.groundImageSrc);
		}

/*
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
*/

		if (params.sunPathPosition !== undefined) {
			this.setSunPathPosition(params.sunPathPosition);
		}

		if (params.moonPathPosition !== undefined) {
			this.setMoonPathPosition(params.moonPathPosition);
		}

		if (params.sunAndMoonSize !== undefined) {
			this.setSunAndMoonSize(params.sunAndMoonSize);
		}


		if (params.dayBottomColor !== undefined) {
			this.setDayBottomColor(params.dayBottomColor);
		}

		if (params.dayTopColor !== undefined) {
			this.setDayTopColor(params.dayTopColor);
		}

		if (params.nightBottomColor !== undefined) {
			this.setNightBottomColor(params.nightBottomColor);
		}

		if (params.nightTopColor !== undefined) {
			this.setNightTopColor(params.nightTopColor);
		}

/*
		if (params.pathColor !== undefined) {
			this.setPathColor(params.pathColor);
		}

		if (params.pathWidth !== undefined) {
			this.setPathWidth(params.pathWidth);
		}
*/

		if (params.nightForegroundShading !== undefined) {
			this.setNightForegroundShading(params.nightForegroundShading);
		}
	}


	/*
	 * Update
	*/

	update() {

		this._mainGeometry.update();
		this._trackGeometry.update();
		this._sun.update();
		this._moon.update();
		this._track.update();

		this._mainGeometry.clearFlags();
		this._trackGeometry.clearFlags();
		this._sun.clearFlags();
		this._moon.clearFlags();
		this._track.clearFlags();


		return;


//
//
//
//		let groundHeight = 2*(this._contentHeight - this._horizonY);
//
//		if (this._ground !== undefined) {
//			if (groundHeight === 0) {
//				this._ground.setAttribute('display', 'none');
//			} else {
//				this._ground.setAttribute('display', 'inline');
//				this._ground.setAttribute('height', groundHeight);
//				this._ground.setAttribute('x', '0');
//				this._ground.setAttribute('y', this._contentHeight - groundHeight);
//			}
//		}
//
//		this._foregroundXOrigin = this._contentWidth * this._margin;
//		this._foregroundUnitWidth = this._contentWidth*(1 - 2*this._margin);
//		this._foregroundYOrigin = this._horizonY;
//		this._foregroundUnitHeight = this._contentHeight * this._horizon;
//
//		this._skyBottomStop.setAttribute('offset', this._horizon);
//




		

		if (this._needs_replaceSunImage) {
			this._replaceSunImage();
		}

		if (this._needs_replaceMoonImage) {
			this._replaceMoonImage();
		}

		if (this._needs_replaceGroundImage) {
			this._replaceGroundImage();
		}

		if (this._needsUpdateDimensions) {
			this._updateDimensions();
		}

		if (this._needsUpdateLayout) {
			this._updateLayout();
			this._layoutForegroundObjects();
		}

		if (this._needsPrepPath) {
			this._prepPath();
		}

		if (this._needsRecalcSunAndMoonPts) {
			this._recalcSunAndMoonPts();
		}


		this._moveSunAndMoon();
		this._redrawSky();
		this._redrawPath();
		this._redrawPhase();
		this._redrawPathCutouts();

	
		this._geometry.clearFlags();
	}



	_layoutForegroundObjects() {

		for (let i = 0; i < this._foregroundObjects.length; ++i) {

			let obj = this._foregroundObjects[i];
			
			let width = obj.width * this._foregroundUnitWidth;
			obj.image.setAttribute('width', width + 'px');
			
			let height = width / obj.aspectRatio;
			obj.image.setAttribute('height', height + 'px');

			let cx = 0;	
			if (obj.cx !== undefined) {
				cx = obj.cx * width;
			}

			let cy = 0;
			if (obj.cy !== undefined) {
				cy = obj.cy * height;
			}

			let x = this._foregroundXOrigin - cx + obj.x*this._foregroundUnitWidth;
			let y = this._foregroundYOrigin - cy + obj.y*this._foregroundUnitHeight;

			obj.image.setAttribute('x', x + 'px');
			obj.image.setAttribute('y', y + 'px');

		}	
	}


/*
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
	}
*/



	_redrawSky() {

		// TODO: dusk, dawn
		// TODO: move foreground shadowing

		if (this._sunPathPosition <= 0.5) {
			this._skyBottomStop.setAttribute('stop-color', this._dayBottomColor);
			this._skyTopStop.setAttribute('stop-color', this._dayTopColor);
			this._foregroundGroup.setAttribute('filter', 'none');
		} else {
			this._skyBottomStop.setAttribute('stop-color', this._nightBottomColor);
			this._skyTopStop.setAttribute('stop-color', this._nightTopColor);
			this._foregroundGroup.setAttribute('filter', 'url(#foreground-filter)');
		}

	}






	/*
	 * Update
	*/


	_removeAllChildren(element) {
	  while (element.firstChild) {
	    element.removeChild(element.firstChild);
	  }
	}

}


