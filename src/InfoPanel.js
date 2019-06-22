/*
InfoPanel.js
wgbh-asset1
astro.unl.edu
2019-06-21
*/


export default class InfoPanel {



	constructor() {

		this._element = document.createElement('div');
		this._element.classList.add('wgbh-asset1-infopanel');


		this._dayDiv = document.createElement('div');
		this._dayDiv.textContent = '.';
		this._element.appendChild(this._dayDiv);


//		this._timeOfDayDiv = document.createElement('div');
//		this._timeOfDayDiv.textContent = '.';
//		this._element.appendChild(this._timeOfDayDiv);


//		this._phaseNameDiv = document.createElement('div');
//		this._phaseNameDiv.textContent = '.';
//		this._element.appendChild(this._phaseNameDiv);

	}

	getMinHeight() {
		let bb = this._sampler.getBoundingClientRect();
		return bb.height;
	}


	setInfo(info) {
		if (info.day !== undefined) {
			this._dayDiv.textContent = info.day;
		}
//		if (info.timeOfDay !== undefined) {
//			this._timeOfDayDiv.textContent = info.timeOfDay;
//		}
//		if (info.phaseName !== undefined) {
//			this._phaseNameDiv.textContent = info.phaseName;
//		}
	}


	getHeight() {
		return this._element.clientHeight;
	}


	getElement() {
		return this._element;
	}


}


