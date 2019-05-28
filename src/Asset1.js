/*
Asset1
WGBH
astro.unl.edu
2019-05-27
*/

import './Asset1.css';

	
import SkyDiagram from './SkyDiagram/SkyDiagram.js';


import ControlPanel from './ControlPanel.js';



var versionNum = '0.0';
var versionDateStr = '2019-05-27-xxxx';


class Asset1 {


	constructor() {

		this.decrementDay = this.decrementDay.bind(this);
		this.decrementHour = this.decrementHour.bind(this);
		this.incrementDay = this.incrementDay.bind(this);
		this.incrementHour = this.incrementHour.bind(this);
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);

		
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

		console.log("ATU_PER_HOUR: "+this._ATU_PER_HOUR);
		console.log("CALENDAR_PERIOD: "+this._CALENDAR_PERIOD);
		console.log("SYNODIC_PERIOD: "+this._SYNODIC_PERIOD);
		console.log("TIME_CYCLE: "+this._TIME_CYCLE);
		console.log("MAX_SAFE_INTEGER: "+Number.MAX_SAFE_INTEGER);
	
		
		this._root = document.createElement('div');
		this._root.classList.add('wgbh-asset1-root');

		this._diagram = new SkyDiagram();
		this._root.appendChild(this._diagram.getElement());

		this._controlPanel = new ControlPanel(this);
		this._root.appendChild(this._controlPanel.getElement());

		// _isPlaying signifies that the simulation is running continuously.
		this._isPlaying = false;

		// If _animFrameID is defined it means there's a queued request for an animation frame
		//	callback -- that is, there's an animation in progress. Animations are used for
		//	time transitions (incrementing/decrementing) in addition to continuous playing.
		this._animFrameID = undefined;

		this._minTransitionDurationMS = 300;
		this._maxTransitionDurationMS = 1000;


		this.setSecondsPerCalendarPeriod(90);
		this._setTime((9*24 + 15) * this._ATU_PER_HOUR);


		this._animFrameHandler = this._animFrameHandler.bind(this);


	}




	_setTime(arg) {

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

		//console.log("anim clock: "+clock);

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

//			this._animTransitionInitTime = this._time;
//			this._animTransitionInitClock = performance.now();
//			this._animTransitionTimeDelta = delta;
//			this._animTransitionFinalTime = this._time + delta;
//			this._animTransitionDurationMS = this._transitionDurationMS;

			let u = (clock - this._animTransitionInitClock) / this._animTransitionDurationMS;

			if (u < 1) {
				// Transition is on-going.

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

/*
	_onAnimPlayFrame(clock) {

		if (this._isAnimating) {
			// TODO: revise

				let clockDelta = clock - this._animInitClock;
				let timeDelta = clockDelta * this._animATUPerMS;
				this._setTime(this._animInitTime + timeDelta);
				this._update();

//			if (this._animPrevClock !== undefined) {
//
//				let clockDelta = clock - this._animPrevClock;
//		
//				//console.log(clockDelta.toPrecision(3)+ ", " + (1000/clockDelta).toPrecision(3));
//				
//				let timeDelta = clockDelta * this._animATUPerMS;
//				//console.log("timeDelta: "+timeDelta);
//
//				this._setTime(this._time + timeDelta);
//				this._update();
//			}			
//
//			this._animPrevClock = clock;
		}

		if (this._isAnimating) {
			this._animFrameID = window.requestAnimationFrame(this._onAnimFrame);
		} else {
			this._animFrameID = undefined;
		}
	}
*/

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
		this._diagram.setParams(params);
	}


	update() {
		this._update();
	}

	_update() {

		let skyParams = {};
		skyParams.sunPathPosition = this._timeOfDay - 0.25;
		skyParams.moonPathPosition = skyParams.sunPathPosition - this._moonPhase;

		this._diagram.setParams(skyParams);
		this._diagram.update();
	}

	

	_removeAllChildren(element) {
	  while (element.firstChild) {
	    element.removeChild(element.firstChild);
	  }
	}

}


if (typeof window !== 'undefined') {
	if (window.WGBHAsset1 === undefined) {
		window.WGBHAsset1 = Asset1;
		console.info('Component loaded: WGBHAsset1 (version: ' + versionNum + ', build: ' + versionDateStr + ')');
	}
}

