/*
Asset1.js
wgbh-asset1
astro.unl.edu
2019-06-19
*/


import './Asset1.css';

import SkyDiagram from 'SkyDiagram.js';

import ControlPanel from './ControlPanel.js';
import InfoPanel from './InfoPanel.js';


class Asset1 {


	constructor() {

		this.decrementDay = this.decrementDay.bind(this);
		this.decrementHour = this.decrementHour.bind(this);
		this.incrementDay = this.incrementDay.bind(this);
		this.incrementHour = this.incrementHour.bind(this);
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);
		this.goToDay1 = this.goToDay1.bind(this);

		
		// The official timekeeping property of the simulation is _time. This variable is assigned
		//	only in _setTime() -- see the comments there for more information about _time and the
		//	properties derived from it.

		// All of the time related constants below MUST be integers, unless otherwise indicated.

		// Unless otherwise indicated in the property name, all of these constants are defined in
		//	ATUs -- atomic time units. See _setTime() for more details.
		
		// The ATU must be a common divisor of a day, all other increment and decrement quantities,
		//	and the calendar and synodic periods. It must also be small enough to allow smooth control
		//	over the animation rate. However, it can not be so small that 2*_TIME_CYCLE is larger
		//	than Number.MAX_SAFE_INTEGER (check console output for an error message).
		this._ATU_PER_HOUR = 3600;
		this._ATU_PER_DAY = 24 * this._ATU_PER_HOUR;

		// The displayed calendar day will be an integer in the interval [1, _CALENDAR_PERIOD_IN_DAYS].
		this._CALENDAR_PERIOD_IN_DAYS = 30; // this must be an integer
		this._CALENDAR_PERIOD = this._CALENDAR_PERIOD_IN_DAYS * this._ATU_PER_DAY;
		
		// Set the synodic period to be equal to the calendar period to achieve a perfect
		//	loop -- otherwise, the phases will drift within the calendar.
		this._SYNODIC_PERIOD_IN_DAYS = this._CALENDAR_PERIOD_IN_DAYS; // this may be fractional
		this._SYNODIC_PERIOD = Math.round(this._SYNODIC_PERIOD_IN_DAYS * this._ATU_PER_DAY);

		// The synodic offset determines how the synodic cycle aligns with the calendar. A value
		//	of 12 hours has the new moon occur at noon on the first calendar day.
		this._SYNODIC_OFFSET = 12 * this._ATU_PER_HOUR;

		// _TIME_CYCLE must contain an integer number of both synodic and calendar periods (in ATUs).
		//	It must also be less than half of Number.MAX_SAFE_INTEGER to avoid integer overflow and to
		//	allow for modular arithmetic.
		this._TIME_CYCLE = this._SYNODIC_PERIOD * this._CALENDAR_PERIOD;
		if ((2 * this._TIME_CYCLE) > Number.MAX_SAFE_INTEGER) {
			// If this happens make the ATU longer (i.e. fewer ATUs per day).
			console.error('TIME_CYCLE is greater than MAX_SAFE_INTEGER.');
		}

//		console.log("ATU_PER_HOUR: "+this._ATU_PER_HOUR);
//		console.log("CALENDAR_PERIOD: "+this._CALENDAR_PERIOD);
//		console.log("SYNODIC_PERIOD: "+this._SYNODIC_PERIOD);
//		console.log("TIME_CYCLE: "+this._TIME_CYCLE);
//		console.log("MAX_SAFE_INTEGER: "+Number.MAX_SAFE_INTEGER);
	
		
		this._root = document.createElement('div');
		this._root.classList.add('wgbh-asset1-root');

		this._diagram = new SkyDiagram();
		this._root.appendChild(this._diagram.getElement());

		this._infoPanel = new InfoPanel();
		this._root.appendChild(this._infoPanel.getElement());

		this._controlPanel = new ControlPanel(this);
		this._root.appendChild(this._controlPanel.getElement());

		let diagramSettings = {
			showTrack: false,
			darkestShadingLevel: 0.3,
			sunImageSrc: 'graphics/sun.svg',
			moonImageSrc: 'graphics/Boston1_v7_moon-realisticcartoon.svg',//moon.svg',
			groundImageSrc: 'graphics/ground.svg',
			foregroundObjects: [
				{	ID: 'tree',
					params: {
						imageSrc: 'graphics/tree.svg',
						x: -0.05,
						y: 0.05,
						offsetX: 0.5,
						offsetY: 1.0,
						width: 0.1,
						aspectRatio: 150/175,
					},
				},
				{	ID: 'house',
					params: {
						imageSrc: 'graphics/house.svg',
						x: 0.8,
						y: 0.4,
						offsetX: 0.5,
						offsetY: 0.95,
						width: 0.17,
						aspectRatio: 150/130,
					},
				},
				{	ID: 'lamp-pane-off',
					params: {
						imageSrc: 'graphics/lamp-pane-off.svg',
						system: 'object',
						refObjectID: 'house',
						x: 0.5,
						y: 0.2,
						offsetX: 0.5,
						offsetY: 0.0,
						width: 0.4,
						aspectRatio: 2,
					},
				}, 
				{	ID: 'lamp-pane-on',
					params: {
						imageSrc: 'graphics/lamp-pane-on.svg',
						system: 'object',
						refObjectID: 'house',
						x: 0.5,
						y: 0.2,
						offsetX: 0.5,
						offsetY: 0.0,
						width: 0.4,
						aspectRatio: 2,
						applyNightShading: false,
						visibility: {
							sunPosition: [{begin: (18 - 6)/24, end: (6 - 6)/24}],
						}
					},
				}, 
				{	ID: 'lamp-frame',
					params: {
						imageSrc: 'graphics/lamp-frame.svg',
						system: 'object',
						refObjectID: 'house',
						x: 0.5,
						y: 0.2,
						offsetX: 0.5,
						offsetY: 0.0,
						width: 0.4,
						aspectRatio: 2,
					},
				}, 
			],
		};
		this._diagram.setParams(diagramSettings);

		// _isPlaying signifies that the simulation is running continuously.
		this._isPlaying = false;

		// If _animFrameID is defined it means there's a queued request for an animation frame
		//	callback -- that is, there's an animation in progress. Animations are used for
		//	time transitions (incrementing/decrementing) in addition to continuous playing.
		this._animFrameID = undefined;

		this._minTransitionDurationMS = 250;
		this._maxTransitionDurationMS = 1000;


		this._minSkyDiagramAspectRatio = 1.3;
		this._maxSkyDiagramAspectRatio = Number.POSITIVE_INFINITY; // 2.5 TODO
		
		let bb = this._root.getBoundingClientRect();
		this._width = bb.width;
		this._height = bb.height;


		this.setSecondsPerCalendarPeriod(180);

		this._setTime(134.1 * this._ATU_PER_HOUR);

		this._animFrameHandler = this._animFrameHandler.bind(this);


	}

	getTimeOfDayName(timeOfDay) {

		timeOfDay = (timeOfDay%1 + 1)%1;

		if (timeOfDay < 0.25) {
			return 'Nighttime';
		} else if (timeOfDay <= 0.75) {
			return 'Daytime';
		} else {
			return 'Nighttime';
		}
	}

	getMoonPhaseName(moonPhase) {

		moonPhase = (moonPhase%1 + 1)%1;

		let newDelta = 0.02;
		let quarterDelta = 0.02;
		let fullDelta = 0.05;

		if (moonPhase < newDelta) {
			return 'New Moon';
		} else if (moonPhase < 0.25 - quarterDelta) {
			return 'Waxing Crescent';
		} else if (moonPhase < 0.25 + quarterDelta) {
			return 'First Quarter';
		} else if (moonPhase < 0.5 - fullDelta) {
			return 'Waxing Gibbous';
		} else if (moonPhase < 0.5 + fullDelta) {
			return 'Full Moon';
		} else if (moonPhase < 0.75 - quarterDelta) {
			return 'Waning Gibbous';
		} else if (moonPhase < 0.75 + quarterDelta) {
			return 'Third Quarter';
		} else if (moonPhase < 1 - newDelta) {
			return 'Waning Crescent';
		} else {
			return 'New Moon';
		}
	}

	


	_setTime(arg) {

		// This method is the only place where _time should be changed.

		// _time is expressed as an integer number of atomic time units (ATU). It must be kept an
		//	integer to avoid unexpected numerical precision issues (e.g. clicking the hour increment
		//	button 24 times but not having the day change).
		// _time must be kept in the interval [0, _TIME_CYCLE) to avoid integer overflow.
		// By definition, _time = 0 corresponds to midnight on the first calendar day.

		if (typeof arg !== 'number' || !Number.isFinite(arg)) {
			console.error('Invalid argument passed to internal _setTime method.');
			return;
		}

		this._time = ( Math.round(arg) % this._TIME_CYCLE + this._TIME_CYCLE)%this._TIME_CYCLE;

		// _moonPhase is a rational number in [0, 1), where
		//	0.0  = new moon,
		//	0.25 = first quarter,
		//	0.5  = full moon, and
		//	0.75 = third quarter.
		this._moonPhase = (( (this._time - this._SYNODIC_OFFSET) / this._SYNODIC_PERIOD )%1 + 1)%1;

		// n is the integer number of zero-based days up to the given _time within the cycle.
		// r is the remaining number of ATUs within the zero-based day given by _time.
		let n = Math.floor(this._time / this._ATU_PER_DAY);
		let r = this._time - n*this._ATU_PER_DAY;	
		
		// _calendarDay is an integer in [1, _CALENDAR_PERIOD_IN_DAYS].
		this._calendarDay = 1 + ((n % this._CALENDAR_PERIOD_IN_DAYS) + this._CALENDAR_PERIOD_IN_DAYS)%this._CALENDAR_PERIOD_IN_DAYS;
		
		// _timeOfDay is a rational number in [0, 1), where
		// 	0.0  = midnight,
		//	0.25 = 6am,
		//	0.5  = noon, and
		//	0.76 = 6pm.
		this._timeOfDay = r / this._ATU_PER_DAY;
			
//		console.log("");
//		console.log("            time: "+this._time);
//		console.log("       moonPhase: "+this._moonPhase);
//		console.log("     calendarDay: "+this._calendarDay);
//		console.log("       timeOfDay: "+this._timeOfDay);
	}


	_setTimeByDelta(delta) {
		// This helper function is for use by the increment and decrement methods.
		
		if (this._animFrameID !== undefined) {
			console.warn('Can not change time while animating.');
			return;
		}
		
		this._controlPanel.setMode(this._controlPanel.MODE_ALL_DISABLED);

		// Calculate the transition params and start the animation.

		this._animTransitionInitTime = this._time;
		this._animTransitionInitClock = undefined;
		this._animTransitionTimeDelta = delta;
		this._animTransitionFinalTime = this._time + delta;


		if (Math.abs(delta) < 12 * this._ATU_PER_HOUR) {
			//console.log("short transition");
			this._animTransitionDurationMS = this._minTransitionDurationMS;
		} else {
			//console.log("long transition");
			this._animTransitionDurationMS = this._maxTransitionDurationMS;
		}

		//console.log("init clock: "+this._animTransitionInitClock);

		this._animFrameID = window.requestAnimationFrame(this._animFrameHandler);
	}


	decrementDay() {
		this._setTimeByDelta(-this._ATU_PER_DAY);
	}

	decrementHour() {
		this._setTimeByDelta(-this._ATU_PER_HOUR);	
	}

	incrementHour() {
		this._setTimeByDelta(this._ATU_PER_HOUR);	
	}

	incrementDay() {
		this._setTimeByDelta(this._ATU_PER_DAY);	
	}

	play() {
		this.setIsPlaying(true);		
	}

	pause() {
		this.setIsPlaying(false);
	}

	goToDay1() {
		this._setTime(12 * this._ATU_PER_HOUR);
		this.update();
	}

	getIsPlaying() {
		return this._isPlaying;
	}

	setIsPlaying(arg) {

		arg = Boolean(arg);

		if (arg) {
			// To start playing:
			//	- the sim must not be playing already, and
			//	- there must be no other animation (e.g. a transition).
			if (this._isPlaying) {
				console.warn('Can not start playing when already playing.');
				return;
			}
			if (this._animFrameID !== undefined) {
				console.warn('Can not start playing while animating.');
				return;
			}
		} else {
			// To pause playing:
			//	- the sim must be playing.
			if (!this._isPlaying) {
				console.warn('Can not pause unless playing.');
				return;
			}	
		}

		//console.log('Will set is playing: '+arg);

		this._isPlaying = arg;
		
		if (this._isPlaying) {
			// Start playing.

			this._controlPanel.setMode(this._controlPanel.MODE_PAUSE_ENABLED);

			this._recalcAnimPlayingParams();

			this._animFrameID = window.requestAnimationFrame(this._animFrameHandler);

		} else {
			// Pause playing.
			
			this._controlPanel.setMode(this._controlPanel.MODE_ALL_ENABLED);

			window.cancelAnimationFrame(this._animFrameID);
			this._animFrameID = undefined;
		}
	}


	_recalcAnimPlayingParams() {
		// Call this whenever playing is about to start or when the animation
		//	rate (secondsPerCalendarPeriod) has changed.

		if (!this._isPlaying) {
			return;
		}

		this._animPlayingInitTime = this._time;
		this._animPlayingInitClock = undefined;
		this._animPlayingATUPerMS = this._CALENDAR_PERIOD / (1000 * this._secondsPerCalendarPeriod);
		this._animPlayingMSPerTimeCycle = this._TIME_CYCLE / this._animPlayingATUPerMS;
	}


	_animFrameHandler(clock) {

		if (this._isPlaying) {
			// Continuous playing.

			if (this._animPlayingInitClock === undefined) {
				this._animPlayingInitClock = clock;
			}

			let clockDelta = (clock - this._animPlayingInitClock)%this._animPlayingMSPerTimeCycle;
			let timeDelta = clockDelta * this._animPlayingATUPerMS;
			this._setTime(this._animPlayingInitTime + timeDelta);
			this._update();
		
			this._animFrameID = window.requestAnimationFrame(this._animFrameHandler);

		} else {
			// Temporary transition.

			if (this._animTransitionInitClock === undefined) {
				this._animTransitionInitClock = clock;
			}

			// t goes linearly in clock time from 0 (start) to 1 (finish).
			let t = (clock - this._animTransitionInitClock) / this._animTransitionDurationMS;

			if (t < 1) {
				// Transition is on-going.

				// Using cubic easing.
				let u = t*t*(3*(1 - t) + t);

				let timeDelta = u * this._animTransitionTimeDelta;
				this._setTime(this._animTransitionInitTime + timeDelta);
				this._update();
				
				this._animFrameID = window.requestAnimationFrame(this._animFrameHandler);

			} else {
				// Transition is finished.
				
				this._controlPanel.setMode(this._controlPanel.MODE_ALL_ENABLED);

				this._animFrameID = undefined;

				this._setTime(this._animTransitionFinalTime);
				this._update();
			}

		}
	}


	getSecondsPerCalendarPeriod() {
		return this._secondsPerCalendarPeriod;
	}

	setSecondsPerCalendarPeriod(arg) {
		this._secondsPerCalendarPeriod = arg;
		this._recalcAnimPlayingParams();
	}



	getElement() {
		return this._root;
	}

	getParams() {
		return this._diagram.getParams();
	}

	setParams(params) {

		if (params.width !== undefined || params.height !== undefined) {

			let w = params.width || this._width;
			let h = params.height || this._height;

			this._root.style.width = w + 'px';
			this._root.style.height = h + 'px';

			let iph = this._infoPanel.getHeight();
			let cph = this._controlPanel.getHeight();
	
			let skyParams = {
				width: w,
				height: h - iph - cph,
			};

			let ratio = skyParams.width / skyParams.height;
			if (ratio < this._minSkyDiagramAspectRatio) {
				skyParams.height = skyParams.width / this._minSkyDiagramAspectRatio;
			} else if (ratio > this._maxSkyDiagramAspectRatio) {
				// TODO -- need to fix CSS
			}
	
			this._diagram.setParams(skyParams);

			this._width = w;
			this._height = h;
		}
				
	}


	update() {
		this._update();
	}

	_update() {

		let skyParams = {};
		skyParams.sunPosition = this._timeOfDay - 0.25;
		skyParams.moonPosition = skyParams.sunPosition - this._moonPhase;

		let info = {};
		info.day = 'Day ' + this._calendarDay;
		info.timeOfDay = this.getTimeOfDayName(this._timeOfDay);
		info.phaseName = this.getMoonPhaseName(this._moonPhase);

		this._infoPanel.setInfo(info);

		this._diagram.setParams(skyParams);
		this._diagram.update();
	}
	

	_removeAllChildren(element) {
	  while (element.firstChild) {
	    element.removeChild(element.firstChild);
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
const VERSION_STR = '0.3.0';
const BUILD_DATE_STR = '2019-06-19';

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


