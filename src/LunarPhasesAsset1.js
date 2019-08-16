/*
Asset1.js
wgbh-asset1
astro.unl.edu
2019-08-16
*/


// This simulator will automatically resize itself to fill the window.

// Version and other info is at bottom -- remember to update.


import './css/Asset1.css';

import LunarTimekeeper from 'LunarTimekeeper.js';
import SkyDiagram from 'SkyDiagram.js';

import {SkyDiagramParams} from './SkyDiagramParams/SkyDiagramParams.js';

import ControlPanel from './js/ControlPanel.js';
import InfoPanel from './js/InfoPanel.js';
import PhaseReadout from './js/PhaseReadout.js';

import {Localizations} from './localizations/Localizations.js';


export class LunarPhasesAsset1 {


	constructor() {

		// Some child elements (info panel, control panel, and phase readout) will
		//	directly access _currLocalizations.
		this._currLocalizations = Localizations['default'];

		this.decrementDay = this.decrementDay.bind(this);
		this.decrementHour = this.decrementHour.bind(this);
		this.incrementDay = this.incrementDay.bind(this);
		this.incrementHour = this.incrementHour.bind(this);
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);
		this.goToDay1 = this.goToDay1.bind(this);
		this.update = this.update.bind(this);

		this._timekeeper = new LunarTimekeeper();
		this._timekeeper.setTime({calendarDay: 6, fractionalTimeOfDay: 0.5875});
		this._timekeeper.setChangeCallback(this.update);

		this._root = document.createElement('div');
		this._root.classList.add('wgbh-asset1-root');

		this._inner = document.createElement('div');
		this._inner.classList.add('wgbh-asset1-inner');
		this._root.appendChild(this._inner);

		this._innerStyle = window.getComputedStyle(this._inner);

		this._diagram = new SkyDiagram();
		this._phaseReadout = new PhaseReadout(this);

		// The _phaseReadout element is appended/removed from _diagramContainer
		//	depending on whether the feature is currently enabled.
		// _isPhaseReadoutShown must be in sync with whether _phaseReadout is
		//	currently a child of _diagramContainer.
		this._isPhaseReadoutShown = false;

		this._diagramContainer = document.createElement('div');
		this._diagramContainer.classList.add('wgbh-asset1-diagram');
		this._diagramContainer.appendChild(this._diagram.getElement());
		this._inner.appendChild(this._diagramContainer);

		this._panels = document.createElement('div');
		this._panels.classList.add('wgbh-asset1-panels');
		this._inner.appendChild(this._panels);

		this._infoPanel = new InfoPanel(this);
		this._panels.appendChild(this._infoPanel.getElement());

		this._controlPanel = new ControlPanel(this);
		this._panels.appendChild(this._controlPanel.getElement());

		this._minSkyDiagramAspectRatio = 1.3;
		this._maxSkyDiagramAspectRatio = 2.3;

		// Internal update flags.
		this._needs_redoLayout = true;
		this._needs_updateDiagram = true;

		this._calcWindowDim();
		this._needs_redoLayout = true;
		
		this._onWindowResize = this._onWindowResize.bind(this);
		window.addEventListener('resize', this._onWindowResize);

		this.setParams({
			skyDiagramParams: SkyDiagramParams,
		});
	}


	/*
	**	Public Methods
	*/

	getElement() {
		return this._root;
	}

	setParams(params) {
		// Note: some properties of the params.skyDiagramParams object may be deleted.

		if (params.hasOwnProperty('skyDiagramParams')) {
			// Some SkyDiagram params are controlled by the sim and are not allowed
			//	to pass through.
			let strippedParams = ['width', 'height', 'sunPosition', 'moonPosition', 'sunSize', 'moonSize'];
			for (const key of strippedParams) {
				if (params.skyDiagramParams.hasOwnProperty(key)) {
					delete params.skyDiagramParams[key];
				}
			}
			this._diagram.setParams(params.skyDiagramParams);
			this._needs_updateDiagram = true;
		}

		if (params.hasOwnProperty('sunAndMoonSize')) {
			this._diagram.setParams({
				sunSize: params.sunAndMoonSize,
				moonSize: params.sunAndMoonSize,
			});
			this._needs_updateDiagram = true;
		}

		if (params.hasOwnProperty('needsRedoLayout')) {
			this._needs_redoLayout = Boolean(params.needsRedoLayout);
		}
	}

	update() {

		if (this._needs_redoLayout) {
			this._redoLayout();
		}

		if (this._needs_updateLocalizations) {
			// The other panels/readouts will be updated with _doTimeBasedUpdates.
			this._controlPanel.updateLocalizations();
		}

		if (this._timekeeper.getHasAnimationStateChanged()) {
			let animState = this._timekeeper.getAnimationState();
			if (animState === LunarTimekeeper.prototype.IDLE) {
				this._controlPanel.setMode(this._controlPanel.MODE_ALL_ENABLED);
			} else if (animState === LunarTimekeeper.prototype.PLAYING) {
				this._controlPanel.setMode(this._controlPanel.MODE_PAUSE_ENABLED);
			} else if (animState === LunarTimekeeper.prototype.TRANSITIONING) {
				this._controlPanel.setMode(this._controlPanel.MODE_ALL_DISABLED);
			} else {
				console.error('Unknown animation state.');
			}
		}

		if (this._timekeeper.getHasTimeChanged() || this._needs_updateLocalizations) {
			this._doTimeBasedUpdates();
		}

		this._timekeeper.clearFlags();
		this._needs_updateLocalizations = false;

		if (this._needs_updateDiagram) {
			this._diagram.update();
			this._needs_updateDiagram = false;
		}
	}


	/*
	**	Button Handlers
	*/

	decrementDay() {
		this._timekeeper.setTimeByDelta({day: -1});
	}

	decrementHour() {
		this._timekeeper.setTimeByDelta({hour: -1});
	}

	incrementHour() {
		this._timekeeper.setTimeByDelta({hour: 1});
	}

	incrementDay() {
		this._timekeeper.setTimeByDelta({day: 1});
	}

	play() {
		this._timekeeper.setIsPlaying(true);
	}

	pause() {
		this._timekeeper.setIsPlaying(false);
	}

	goToDay1() {
		this._timekeeper.setTime({calendarDay: 1, fractionalTimeOfDay: 0.5});
	}


	/*
	**	Internal Sizing Methods
	*/

	_onWindowResize() {
		this._calcWindowDim();
		this._needs_redoLayout = true;
		this.update();
	}

	_calcWindowDim() {
		// Sets the _windowWidth and _windowHeight properties.
		// May account for scrollbars in future.
		this._windowWidth = window.innerWidth;
		this._windowHeight = window.innerHeight;
	}

	_calcFullDim() {
		// Sets the _width and _height properties. These are set so that the sim fits
		//	the entire viewport. However, they will not be set less than the minimums
		//	defined in the CSS file.
		// This function can't be called from the constructor since on initialization
		//	the min-width and min-height properties will not be accessible.
		let minWidth = parseFloat(this._innerStyle.getPropertyValue('min-width'));
		if (Number.isNaN(minWidth)) {
			minWidth = 0;
		}
		let minHeight = parseFloat(this._innerStyle.getPropertyValue('min-height'));
		if (Number.isNaN(minHeight)) {
			minHeight = 0;
		}
		this._width = (this._windowWidth > minWidth) ? this._windowWidth : minWidth;
		this._height = (this._windowHeight > minHeight) ? this._windowHeight : minHeight;
	}


	/*
	**	Misc Internal Methods
	*/

	_validateNumberWithRange(arg, min, max, name) {
		if (typeof arg !== 'number') {
			arg = parseFloat(arg);
		}
		if (Number.isNaN(arg) || !Number.isFinite(arg)) {
			throw new Error(name + ' must be a finite number.');
		}
		if (arg < min) {
			arg = min;
		}
		if (arg > max) {
			arg = max;
		}
		return arg;
	}

	_setIsPhaseReadoutShown(arg) {
		arg = Boolean(arg);
		if (arg === this._isPhaseReadoutShown) {
			throw new Error('_isPhaseReadoutShown was out of sync with checkbox value.');
		}
		if (arg) {
			this._diagramContainer.appendChild(this._phaseReadout.getElement());
		} else {
			this._diagramContainer.removeChild(this._phaseReadout.getElement());
		}
		this._isPhaseReadoutShown = arg;
	}


	/*
	**	Internal Update Sub-Methods
	*/

	_redoLayout() {

		// Call when width or height have changed.

		this._needs_updateDiagram = true;

		this._calcFullDim();

		this._root.style.width = this._width + 'px';
		this._root.style.height = this._height + 'px';

		let skyParams = {};

		// The media query below must be identical to the one used in the CSS file.
		const isInLandscape = window.matchMedia('(min-aspect-ratio: 177/100)').matches;
		if (isInLandscape) {
			// Landscape Layout
			let bb = this._panels.getBoundingClientRect();
			skyParams.width = this._width - bb.width;
			skyParams.height = this._height;
		} else {
			// Portrait Layout
			let iph = this._infoPanel.getHeight();
			let cph = this._controlPanel.getHeight();
			skyParams.width =  this._width;
			skyParams.height = this._height - iph - cph;
		}
	
		let ratio = skyParams.width / skyParams.height;
		if (ratio < this._minSkyDiagramAspectRatio) {
			skyParams.height = skyParams.width / this._minSkyDiagramAspectRatio;
		} else if (ratio > this._maxSkyDiagramAspectRatio) {
			skyParams.width = skyParams.height * this._maxSkyDiagramAspectRatio;				
		}

		skyParams.width = Math.floor(skyParams.width);
		skyParams.height = Math.floor(skyParams.height);

		this._diagram.setParams(skyParams);
	
		this._needs_redoLayout = false;
	}

	_doTimeBasedUpdates() {

		this._needs_updateDiagram = true;

		// timeObj will be an object with these properties:
		// 	calendarDay: an integer in [1, 30]
		//	fractionalTimeOfDay: a rational number in [0, 1) giving the time of day, where 0.0 is midnight, 0.5 is noon, etc.
		//	moonPhase: a rational number in [0, 1) giving the moon phase, where 0.0 is the new moon, 0.25 is first quarter, etc.
		let timeObj = this._timekeeper.getTime();
		
		let diagramParams = {};
		diagramParams.sunPosition = timeObj.fractionalTimeOfDay - 0.25;
		diagramParams.moonPosition = diagramParams.sunPosition - timeObj.moonPhase;
		this._diagram.setParams(diagramParams);

		this._infoPanel.updateWithTimeObj(timeObj);

		this._phaseReadout.updateWithTimeObj(timeObj);
	}

}


/*
**	WGBH Window Object Module Setup
**
**	Assign the constants below to have the component made available
**		via the window object.
**	New instances of the component can be created using
**			var c = new window.WGBH[COMPONENT_NAME]();
**		or
**			var c = new window.WGBH.<COMPONENT_NAME>();
*/

const COMPONENT = LunarPhasesAsset1;
const COMPONENT_NAME = 'LunarPhasesAsset1';
const VERSION_STR = '1.1';
const BUILD_DATE_STR = '2019-08-16';

if (typeof window !== 'undefined') {
	if (!window.hasOwnProperty('WGBH')) {
		window.WGBH = {};
	}
	if (!window.WGBH.hasOwnProperty(COMPONENT_NAME)) {
		window.WGBH[COMPONENT_NAME] = COMPONENT;
		console.info('Component loaded: WGBH.' + COMPONENT_NAME + ' (version: '
			+ VERSION_STR + ', build: ' + BUILD_DATE_STR + ')');
	} else {
		console.warn('The component WGBH.' + COMPONENT_NAME
			+ ' has already been loaded. (This version: ' + VERSION_STR
			+ ', build: ' + BUILD_DATE_STR + '.)');
	}
}


