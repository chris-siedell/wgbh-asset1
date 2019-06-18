/*
SkyDiagram.js
wgbh-skydiagram
astro.unl.edu
2019-06-17
*/


import './css/SkyDiagram.css';

// The code for SkyDiagram has been separated out into these sub-objects:
import MainGeometry from './js/MainGeometry.js';
import TrackGeometry from './js/TrackGeometry.js';
import Sky from './js/Sky.js';
import Track from './js/Track.js';
import Sun from './js/Sun.js';
import Moon from './js/Moon.js';
import Ground from './js/Ground.js';
import ForegroundObjects from './js/ForegroundObjects.js';


/*

SkyDiagram Methods:
	getParams()					- returns an object with current values of all parameters
	setParams(params) 	- sets one or more parameters using the params object; lightweight; no
												significant calculations or redrawing occurs until update is called;
												the params object is copied and values validated and normalized
	update()						- applies all parameter value changes and redraws the diagram
	getElement()				- returns the HTML element for the diagram; important: the component
												manually resizes the element based on the width and height parameters

For an explanation of parameters refer to the various sub-object files (e.g. the MainGeometry
	object is responsible for the width and height parameters, amongst others).


Notes on Design

Parameters are set by calling setParams, which takes as an argument an object with
	one or more of the parameters to change. A setParams call on the SkyDiagram component
	leads to setParams being called on all the sub-objects. These sub-objects will inspect
	the params argument for the properties specific to that sub-object and ignore the rest.
	The sub-objects will validate (copy and normalize) any parameters that they use.

Setting parameters is designed to be a light-weight operation. No significant
	calculations or redrawing of the diagram occurs until update is called.

Calling update on the SkyDiagram component causes the update methods to be called on the various
	sub-objects. These in turn use internal sub-methods to update just the parts of the
	diagram that need to be updated, improving performance.

Determining which sub-methods to call is managed by using flags, both internal (referenced only
	within that sub-object), and external (reference by other, dependent sub-objects).

When a parameter has been set on a sub-object, one or more internal flags are set. These flags
	are named "_needs_method", where "_method" is the name of the internal update sub-method that
	will need to be called on the next update.

When update is called on a sub-object, it first inspects any other sub-objects it depends on
	to see if an external flag has been raised that might affect it. If so, the necessary
	internal flag(s) will be set before starting to call internal update sub-methods.

External flags are not raised until update is called. They stay raised until clearFlags
	is called. Internal flags are cleared when the corresponding sub-method finishes
	successfully.

Example:
	The sun graphic is constrained to the sun-moon track. The sunPosition parameter controls
	where on the track the sun is placed. So when sunPosition has been set the Sun object
	raises its internal _needs_transformSun flag (_transformSun is responsible for moving
	the sun graphic). The actual screen point on the track is determined by the TrackGeometry
	object, so before starting its internal updates the Sun object checks the TrackGeometry
	object to see if the track has changed (by calling getHasTrackChanged on the TrackGeometry
	object). If the track has changed then _transformSun will need to be called, even if the
	position hasn't changed. The _transformSun method raises the Sun object's external
	hasPositionChanged flag, which other objects (e.g. the Moon) will query later on.

*/



export default class SkyDiagram {


	constructor() {

		this._subs = {};
		this._subs.mainGeometry				=	new MainGeometry();
		this._subs.trackGeometry			= new TrackGeometry();
		this._subs.sky								= new Sky();
		this._subs.track							= new Track();
		this._subs.sun								= new Sun();
		this._subs.moon								= new Moon();
		this._subs.ground							= new Ground();
		this._subs.foregroundObjects	= new ForegroundObjects();

		// The linking step allows the sub-objects to make any necessary
		//	references to each other.
		for (const key in this._subs) {
			this._subs[key].link(this._subs);
		}	
		
		// The SkyDiagram component consists of an outer div (aka the root, which is what is
		//	returned by getElement), and an inner SVG. This arrangement allows the diagram
		//	to have an inset border on the div. The root div and svg elements are created
		//	and sized by MainGeometry.

		// The SVG has several layers, added from back to front. The layers are managed by
		//	the separate sub-objects.

		let svg = this._subs.mainGeometry.getSVG();

		svg.appendChild(this._subs.sky.getSkyElement());
		svg.appendChild(this._subs.track.getElement());
		svg.appendChild(this._subs.sun.getElement());
		svg.appendChild(this._subs.moon.getElement());
		svg.appendChild(this._subs.sky.getFilterElement());
		svg.appendChild(this._subs.ground.getElement());
		svg.appendChild(this._subs.foregroundObjects.getElement());
	}


	getElement() {
		return this._subs.mainGeometry.getRoot();
	}


	/*
	**	Parameter Methods
	**
	**	The sub-objects handle the parameters specific to each.
	*/

	getParams() {
		let params = {};
		for (const key in this._subs) {
			this._subs[key].addParams(params);
		}
		return params;
	}
	
	setParams(params) {
		for (const key in this._subs) {
			this._subs[key].setParams(params);
		}
	}


	/*
	**	Updating
	*/

	update() {
		//console.log("\n*** UPDATE ***");

		// The update order is significant due to dependencies.
		this._subs.mainGeometry.update();
		this._subs.trackGeometry.update();
		this._subs.sun.update();
		this._subs.moon.update();
		this._subs.sky.update();
		this._subs.track.update();
		this._subs.ground.update();
		this._subs.foregroundObjects.update();

		// Clearing flags can be done in any order.
		for (const key in this._subs) {
			this._subs[key].clearFlags();
		}
	}

}


