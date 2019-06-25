/*
InfoPanel.js
wgbh-asset1
astro.unl.edu
2019-06-25
*/


export default class InfoPanel {


	constructor(parent) {

		this._parent = parent;

		this._element = document.createElement('div');
		this._element.classList.add('wgbh-asset1-infopanel');

		this._dayDiv = document.createElement('div');
		this._dayDiv.textContent = '.';
		this._element.appendChild(this._dayDiv);

		this._timeOfDayDiv = document.createElement('div');
		this._timeOfDayDiv.textContent = '.';
		this._element.appendChild(this._timeOfDayDiv);
	}


	getElement() {
		return this._element;
	}


	getHeight() {
		return this._element.clientHeight;
	}


	updateWithTimeObj(timeObj) {
		this._dayDiv.textContent = this._parent._currLocalizations.dayLabel + ' ' + timeObj.calendarDay;
		this._timeOfDayDiv.textContent = this.getTimeAsDigitalTimeString(timeObj);
	}


	getTimeAsDigitalTimeString(timeObj) {
		// Not showing minutes.
		// timeObj.hour will be an integer in [0, 23].
		let hour = timeObj.hour;
		if (hour >= 12) {
			hour -= 12;
		}	
		if (hour < 1) {
			hour = 12;
		}	
		let str = hour.toFixed(0) + ":00 ";
		if (timeObj.hour < 12) {
			str += "AM";
		} else {
			str += "PM";
		}
		return str;
	}	

}


