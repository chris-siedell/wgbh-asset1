/*
Asset1.js
wgbh-asset1
astro.unl.edu
2019-06-25
*/


import './Asset1.css';

import LunarTimekeeper from 'LunarTimekeeper.js';
import SkyDiagram from 'SkyDiagram.js';

import {SkyDiagramParams} from './SkyDiagramParams/SkyDiagramParams.js';

import ControlPanel from './ControlPanel.js';
import InfoPanel from './InfoPanel.js';
import PhaseReadout from './PhaseReadout.js';

import {Localizations} from './Localizations.js';


export class Asset1 {


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

		this._diagram = new SkyDiagram();
		this._phaseReadout = new PhaseReadout(this);

		// The _phaseReadout element is appended/removed from _diagramContainer
		//	depending on whether the feature is currently enabled.
		// _isPhaseReadoutShown must be in sync with whether _phaseReadout is
		//	currently a child of _diagramContainer.
		this._isPhaseReadoutShown = false;

		this._diagramContainer = document.createElement('div');
		this._diagramContainer.classList.add('wgbh-asset1-diagram-container');
		this._diagramContainer.appendChild(this._diagram.getElement());
		this._root.appendChild(this._diagramContainer);

		this._panels = document.createElement('div');
		this._panels.classList.add('wgbh-asset1-panels');
		this._root.appendChild(this._panels);

		this._infoPanel = new InfoPanel(this);
		this._panels.appendChild(this._infoPanel.getElement());

		this._controlPanel = new ControlPanel(this);
		this._panels.appendChild(this._controlPanel.getElement());

		this._minSkyDiagramAspectRatio = 1.3;
		this._maxSkyDiagramAspectRatio = 2.3;

//		let bb = this._root.getBoundingClientRect();
//		this._width = bb.width;
//		this._height = bb.height;

		// Internal update flags.
		this._needs_redoLayout = true;
		this._needs_updateDiagram = true;

		this.setParams({
			diagramParams: SkyDiagramParams,
		});

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
	**
	*/

	getElement() {
		return this._root;
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

	setParams(params) {
		// Note: some properties of the params.diagramParams object may be deleted.

		if (params.hasOwnProperty('diagramParams')) {
			// Some SkyDiagram params are controlled by the sim and are not allowed
			//	to pass through.
			let strippedParams = ['width', 'height', 'sunPosition', 'moonPosition', 'sunSize', 'moonSize'];
			for (const key of strippedParams) {
				if (params.diagramParams.hasOwnProperty(key)) {
					delete params.diagramParams[key];
				}
			}
			this._diagram.setParams(params.diagramParams);
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
			// Simply the presence of this flag will cause the layout to be redone.
			this._needs_redoLayout = true;
		}

/*
		if (params.hasOwnProperty('width')) {
			this._width = this._validateNumberWithRange(params.width, 100, 5000, 'width');
			this._needs_redoLayout = true;
		}

		if (params.hasOwnProperty('height')) {
			this._height = this._validateNumberWithRange(params.height, 100, 5000, 'height');
			this._needs_redoLayout = true;
		}
*/
	}

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


	/*
	**	Internal Update Sub-Methods
	*/

	_redoLayout() {

		// Call when width or height have changed.

		this._needs_updateDiagram = true;

		let rbb = this._root.getBoundingClientRect();
//		console.log(rbb.width+", "+rbb.height);
//		console.warn(this._width+", "+this._height);

//		this._root.style.width = this._width + 'px';
//		this._root.style.height = this._height + 'px';
//
		let skyParams = {};

		// The media query below must be identical to the one used in Asset1.css.
		let useSidewaysLayout = window.matchMedia('(min-aspect-ratio: 177/100)').matches;
		if (useSidewaysLayout) {
			// Sideways Layout
			let bb = this._panels.getBoundingClientRect();
			skyParams.width = rbb.width - bb.width;
			skyParams.height = rbb.height;
//			skyParams.width = this._width - bb.width;
//			skyParams.height = this._height;
		} else {
			// Stacked Layout
			let iph = this._infoPanel.getHeight();
			let cph = this._controlPanel.getHeight();
			skyParams.width =  rbb.width;
			skyParams.height = rbb.height - iph - cph;
//			skyParams.width =  this._width;
//			skyParams.height = this._height - iph - cph;
		}
	
		let ratio = skyParams.width / skyParams.height;
		if (ratio < this._minSkyDiagramAspectRatio) {
			skyParams.height = skyParams.width / this._minSkyDiagramAspectRatio;
		} else if (ratio > this._maxSkyDiagramAspectRatio) {
			skyParams.width = skyParams.height * this._maxSkyDiagramAspectRatio;				
		}

		skyParams.width = Math.floor(skyParams.width);
		skyParams.height = Math.floor(skyParams.height);

		this._diagramContainer.style.width = skyParams.width + 'px';
		this._diagramContainer.style.height = skyParams.height + 'px';

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

const COMPONENT = Asset1;
const COMPONENT_NAME = 'Asset1';
const VERSION_STR = '0.6';
const BUILD_DATE_STR = '2019-06-25';

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


