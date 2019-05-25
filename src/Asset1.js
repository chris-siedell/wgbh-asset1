/*
Asset1
WGBH
astro.unl.edu
2019-05-19
*/

	
import SkyDiagram from './SkyDiagram/SkyDiagram.js';

var versionNum = '0.0';
var versionDateStr = '2019-05-20-xxxx';


class Asset1 {

	constructor(rootElement) {

		this._diagram = new SkyDiagram(rootElement);
	}

	getElement() {
		return this._diagram.getElement();
	}

	getParams() {
		return this._diagram.getParams();
	}

	setParams(params) {
		this._diagram.setParams(params);
	}

	update() {
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
*/



}


if (typeof window !== 'undefined') {
	if (window.WGBHAsset1 === undefined) {
		window.WGBHAsset1 = Asset1;
		console.log('Component loaded: WGBHAsset1 (version: ' + versionNum + ', build: ' + versionDateStr + ')');
	}
}

