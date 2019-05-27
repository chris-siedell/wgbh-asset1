/*
Asset1
WGBH
astro.unl.edu
2019-05-24
*/

	
import SkyDiagram from './SkyDiagram/SkyDiagram.js';

import Button from './Button.js';


var versionNum = '0.0';
var versionDateStr = '2019-05-26-xxxx';


class Asset1 {

	constructor() {


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
		this._ATU_PER_HOUR = 10;
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

		console.log("CALENDAR_PERIOD: "+this._CALENDAR_PERIOD);
		console.log("SYNODIC_PERIOD: "+this._SYNODIC_PERIOD);
		console.log("TIME_CYCLE: "+this._TIME_CYCLE);
		console.log("MAX_SAFE_INTEGER: "+Number.MAX_SAFE_INTEGER);
	
		
		this._root = document.createElement('div');
		this._root.classList.add('wgbh-asset1-root');

		this._diagram = new SkyDiagram();
		this._root.appendChild(this._diagram.getElement());

		this._controlsDiv = document.createElement('div');
		this._controlsDiv.style.position = 'relative';
		this._controlsDiv.style.top = this._diagram.getHeight() + 'px';
		this._root.appendChild(this._controlsDiv);
		
		this._decrementDayButton = new Button({title: 'go back one day', text: 'decrement day'});
		this._decrementDayButton.setHandler(this._decrementDay.bind(this));
		this._controlsDiv.appendChild(this._decrementDayButton.getElement());

		this._decrementHourButton = new Button({title: 'go back one hour', text: 'decrement hour'});
		this._decrementHourButton.setHandler(this._decrementHour.bind(this));
		this._controlsDiv.appendChild(this._decrementHourButton.getElement());
		
		this._playPauseButton = new Button({title: 'play', text: 'play'});
		this._playPauseButton.setHandler(this._toggleAnimation.bind(this));
		this._controlsDiv.appendChild(this._playPauseButton.getElement());

		this._incrementHourButton = new Button({title: 'go forward one hour', text: 'increment hour'});
		this._incrementHourButton.setHandler(this._incrementHour.bind(this));
		this._controlsDiv.appendChild(this._incrementHourButton.getElement());

		this._incrementDayButton = new Button({title: 'go forward one day', text: 'increment day'});
		this._incrementDayButton.setHandler(this._incrementDay.bind(this));
		this._controlsDiv.appendChild(this._incrementDayButton.getElement());



		this._isAnimating = false;
		this._setTime(12 * this._ATU_PER_HOUR);

	}




	_setTime(arg) {

		// _time is expressed as an integer number of atomic time units (ATU). It must be kept an
		//	integer to avoid unexpected numerical precision issues (e.g. clicking the hour increment
		//	button 24 times but not having the day change).
		// _time must be kept in the interval [0, _TIME_CYCLE) to avoid integer overflow.
		// By definition, _time = 0 corresponds to midnight on the first calendar day.

		console.log("time before: "+this._time);

		this._time = ( Math.round(arg) % this._TIME_CYCLE + this._TIME_CYCLE)%this._TIME_CYCLE;

		console.log(" time after: "+this._time);

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
			
		console.log("");
		console.log("            time: "+this._time);
		console.log("       moonPhase: "+this._moonPhase);
		console.log("     calendarDay: "+this._calendarDay);
		console.log("       timeOfDay: "+this._timeOfDay);
	}


	_setTimeByDelta(delta) {
		// This helper function used by the increment and decrement
		//	button handlers.
		
		if (this._isAnimating) {
			console.warn('Attempt to change time while animating.');
			return;
		}

		this._setTime(this._time + delta);
		this._update();
	}

	_decrementDay() {
		this._setTimeByDelta(-this._ATU_PER_DAY);
	}

	_decrementHour() {
		this._setTimeByDelta(-this._ATU_PER_HOUR);	
	}

	_incrementHour() {
		this._setTimeByDelta(this._ATU_PER_HOUR);	
	}

	_incrementDay() {
		this._setTimeByDelta(this._ATU_PER_DAY);	
	}


	_toggleAnimation() {
		console.log('toggle animation');

		this._setIsAnimating(!this._isAnimating);
	}

	_setIsAnimating(arg) {

		arg = Boolean(arg);

		if (arg === this._isAnimating) {
			return;
		}

		this._isAnimating = arg;

		if (this._isAnimating) {
			this._playPauseButton.setParams({title: 'pause', text: 'pause'});
			this._decrementHourButton.setEnabled(false);
			this._decrementDayButton.setEnabled(false);	
			this._incrementHourButton.setEnabled(false);
			this._incrementDayButton.setEnabled(false);	
		} else {
			this._playPauseButton.setParams({title: 'play', text: 'play'});
			this._decrementHourButton.setEnabled(true);
			this._decrementDayButton.setEnabled(true);	
			this._incrementHourButton.setEnabled(true);
			this._incrementDayButton.setEnabled(true);	
		}

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
		console.log('Component loaded: WGBHAsset1 (version: ' + versionNum + ', build: ' + versionDateStr + ')');
	}
}

