/*
PhaseReadout.js
wgbh-asset1
astro.unl.edu
2019-06-25
*/


export default class PhaseReadout {


	constructor(parent) {

		this._parent = parent;

		this._element = document.createElement('div');
		this._element.classList.add('wgbh-asset1-phase-readout');

		this._text = document.createElement('span');
		this._text.textContent = '.';
		this._element.appendChild(this._text);
	}


	getElement() {
		return this._element;
	}


	updateWithTimeObj(timeObj) {
		this._text.textContent = this.getMoonPhaseName(timeObj.moonPhase);
	}


	getMoonPhaseName(moonPhase) {
		moonPhase = (moonPhase%1 + 1)%1;
		let newDelta = 0.02;
		let quarterDelta = 0.02;
		let fullDelta = 0.05;
		if (moonPhase < newDelta) {
			return this._parent._currLocalizations.newMoon;
		} else if (moonPhase < 0.25 - quarterDelta) {
			return this._parent._currLocalizations.waxingCrescent;
		} else if (moonPhase < 0.25 + quarterDelta) {
			return this._parent._currLocalizations.firstQuarter;
		} else if (moonPhase < 0.5 - fullDelta) {
			return this._parent._currLocalizations.waxingGibbous;
		} else if (moonPhase < 0.5 + fullDelta) {
			return this._parent._currLocalizations.fullMoon;
		} else if (moonPhase < 0.75 - quarterDelta) {
			return this._parent._currLocalizations.waningGibbous;
		} else if (moonPhase < 0.75 + quarterDelta) {
			return this._parent._currLocalizations.thirdQuarter;
		} else if (moonPhase < 1 - newDelta) {
			return this._parent._currLocalizations.waningCrescent;
		} else {
			return this._parent._currLocalizations.newMoon;
		}
	}

}


