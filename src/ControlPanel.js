

import Button from './Button.js';



export default class ControlPanel {


	constructor(parent) {

		// The control panel has three modes: 
		//	MODE_ALL_DISABLED: all buttons disabled, no change to which of play or pause is shown.
		//	MODE_PAUSE_ENABLED: increment/decrement buttons are disabled, pause is shown and enabled.
		//	MODE_ALL_ENABLED: all visible buttons enabled, play button shown.
		
		this.MODE_ALL_DISABLED = 1;
		this.MODE_PAUSE_ENABLED = 2;
		this.MODE_ALL_ENABLED = 3;

		this._parent = parent;

		this._element = document.createElement('div');
		this._element.classList.add('wgbh-asset1-controlpanel');

		this._decrementDayButton = new Button({title: 'go back one day', text: 'Go Back One Day', icon: 'double-back'});
		this._decrementDayButton.setHandler(this._parent.decrementDay);
		this._element.appendChild(this._decrementDayButton.getElement());

		this._decrementHourButton = new Button({title: 'go back one hour', text: 'Go Back One Hour', icon: 'back'});
		this._decrementHourButton.setHandler(this._parent.decrementHour);
		this._element.appendChild(this._decrementHourButton.getElement());

		
		this._playButton = new Button({title: 'play', text: 'Play', icon: 'play'});
		this._playButton.setHandler(this._parent.play);
		this._element.appendChild(this._playButton.getElement());

		this._pauseButton = new Button({title: 'pause', text: 'Pause', icon: 'pause'});
		this._pauseButton.setHandler(this._parent.pause);
		this._element.appendChild(this._pauseButton.getElement());


		this._incrementHourButton = new Button({title: 'go forward one hour', text: 'Go Forward One Hour', icon: 'forward'});
		this._incrementHourButton.setHandler(this._parent.incrementHour);
		this._element.appendChild(this._incrementHourButton.getElement());

		this._incrementDayButton = new Button({title: 'go forward one day', text: 'Go Forward One Day', icon: 'double-forward'});
		this._incrementDayButton.setHandler(this._parent.incrementDay);
		this._element.appendChild(this._incrementDayButton.getElement());

		this.setMode(this.MODE_ALL_ENABLED);
	}


	getElement() {
		return this._element;
	}


	setMode(arg) {

		if (arg === this.MODE_ALL_DISABLED) {

			this._decrementDayButton.setEnabled(false);
			this._decrementHourButton.setEnabled(false);
			this._pauseButton.setEnabled(false);
			this._playButton.setEnabled(false);
			this._incrementHourButton.setEnabled(false);
			this._incrementDayButton.setEnabled(false);

		} else if (arg === this.MODE_PAUSE_ENABLED) {

			this._playButton.setVisible(false);
			this._pauseButton.setVisible(true);

			this._decrementDayButton.setEnabled(false);
			this._decrementHourButton.setEnabled(false);
			this._pauseButton.setEnabled(true);
			this._incrementHourButton.setEnabled(false);
			this._incrementDayButton.setEnabled(false);

		} else if (arg === this.MODE_ALL_ENABLED) {

			this._playButton.setVisible(true);
			this._pauseButton.setVisible(false);

			this._decrementDayButton.setEnabled(true);
			this._decrementHourButton.setEnabled(true);
			this._playButton.setEnabled(true);
			this._incrementHourButton.setEnabled(true);
			this._incrementDayButton.setEnabled(true);

		} else {
			console.error('Invalid mode.');
			return;
		}
	}


}


