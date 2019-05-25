/*
Asset1
WGBH
astro.unl.edu
2019-05-24
*/

	
import SkyDiagram from './SkyDiagram/SkyDiagram.js';

import Button from './Button.js';


var versionNum = '0.0';
var versionDateStr = '2019-05-24-xxxx';


class Asset1 {

	constructor() {
		
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


		// T is the official simulation time.
		this._T = 0.0;

		this._isAnimating = false;
		
		// These constants control the conversion of T to displayed time.
		this._P = 29;
		this._S = this._P;
		this._F = 0.5;
		this._I = 1;

		// These increment apply to T.
		this._HOUR_INCREMENT = (1/24) / this._S;
		this._DAY_INCREMENT = 1 / this._S;
	}

	_decrementDay() {
		console.log('decrement day');

		if (this._isAnimating) {
			console.error('Attempt to change time while animating.');
			return;
		}
	
		this._T -= this._DAY_INCREMENT;
		this._update();	
	}


	_decrementHour() {
		console.log('decrement hour');
		
		if (this._isAnimating) {
			console.error('Attempt to change time while animating.');
			return;
		}

		this._T -= this._HOUR_INCREMENT;
		this._update();
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


	_incrementHour() {
		console.log('increment hour');

		if (this._isAnimating) {
			console.error('Attempt to change time while animating.');
			return;
		}

		this._T += this._HOUR_INCREMENT;
		this._update();
	}

	_incrementDay() {
		console.log('increment day');

		if (this._isAnimating) {
			console.error('Attempt to change time while animating.');
			return;
		}

		this._T += this._DAY_INCREMENT;
		this._update();
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


		let D = ((this._T * this._S + this._F)%this._P + this._P)%this._P + this._I;

		let skyParams = {};
		skyParams.sunPathPosition = D - 0.25;
		skyParams.moonPathPosition = skyParams.sunPathPosition - this._T;

		this._diagram.setParams(skyParams);
		this._diagram.update();
	}

	


/*
	Time Definitions

	T is the dimensionless simulation time that controls the state of the sim. It
		is defined such that one unit equals one lunar synodic period, with
		the fractional part -- T mod 1 -- corresponding to these phases:
			0.0  => new moon,
			0.25 => first quarter,
			0.5  => full moon, and
			0.75 => third quarter.

	The displayed calendar day D is derived using the following formula:
			D = ((T*S + F) mod P) + I,
		where S, P, F, and I are constants with these definitions:
			- S is the synodic period in days (it may have a fractional part -- but see
				discussion below); set it to be equal to P to have a perfect loop,
			- P is the calendar period in days (an integer); use 29 or 30,
			- F is the time offset; use 0.5 to have the new
				moon occur at noon on day 1, and
			- I is the calendar starting day (an integer); use 1.

	The calendar period P must be an integer so that the simulation doesn't jump
		at the end of the month (e.g. the sun suddenly skips ahead a few hours).

	Set the synodic period S to be equal to P to achieve a perfect loop. Otherwise,
		the phases will drift with respect to the calendar (e.g. initially the new moon
	 	will occur on day 1, but after several cycles it will occur on day 15).
	 	The fractional part of the calendar day -- D mod 1 -- determines the time of day,
	 	with the following correspondences:
			0.0  => midnight,
			0.25 => 6am (~sunrise),
			0.5  => noon, and
			0.75 => 6pm (~sunset).

	The actual sunrise and sunset times (the moment when the graphics appear or
		dissapear) depends on the size of the graphics, the waviness of the horizon,
		and the aspect ratio of the diagram (which affects the horizon graphic scaling).
	
	Note that the Sky Diagram component defines a path position of 0.0 to be the
		intersection of the path and the horizon level on the left side, so an offset
		will need to be used when assigning sunPathPosition for a given D.

	The moonPathPosition will always be offset from sunPathPosition according to
		the current point in the synodic cycle, i.e.
			moonPathPosition = sunPathPosition - (T mod 1).

	The synodic period S is the conversion factor for going between the sim time T
		and regular time (measured in hours and days). E.g. to advance the sim by an
		hour you would increment T by (1/24)/S.
*/


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

