/*
ControlPanel.js
wgbh-asset1
astro.unl.edu
2019-06-10
*/

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

		let leftSection = document.createElement('div');
		leftSection.classList.add('wgbh-asset1-controlpanel-side');
		this._element.appendChild(leftSection);

		let middleSection = document.createElement('div');
		middleSection.classList.add('wgbh-asset1-controlpanel-middle');
		this._element.appendChild(middleSection);

		let rightSection = document.createElement('div');
		rightSection.classList.add('wgbh-asset1-controlpanel-side');
		this._element.appendChild(rightSection);

		this._decrementHourButton = new Button({title: 'go back one hour', text: '1 Hour', icon: 'play-icons_v2_back'});
		this._decrementHourButton.setHandler(this._parent.decrementHour);
//		this._decrementHourButton.addCSSClass('increment-decrement');
		leftSection.appendChild(this._decrementHourButton.getElement());
		
		this._decrementDayButton = new Button({title: 'go back one day', text: '1 Day', icon: 'play-icons_v2_double-back'});
		this._decrementDayButton.setHandler(this._parent.decrementDay);
//		this._decrementDayButton.addCSSClass('increment-decrement');
		leftSection.appendChild(this._decrementDayButton.getElement());

		this._playButton = new Button({title: 'play', text: 'Play', icon: 'play-icons_v2_play'});
		this._playButton.setHandler(this._parent.play);
//		this._playButton.addCSSClass('play-pause');
		middleSection.appendChild(this._playButton.getElement());

		this._pauseButton = new Button({title: 'pause', text: 'Pause', icon: 'play-icons_v2_pause'});
		this._pauseButton.setHandler(this._parent.pause);
//		this._pauseButton.addCSSClass('play-pause');
		middleSection.appendChild(this._pauseButton.getElement());

		this._goToDay1Button = new Button({title: 'go to day 1', text: 'Go to Day 1', icon: undefined});
		this._goToDay1Button.setHandler(this._parent.goToDay1);
		middleSection.appendChild(this._goToDay1Button.getElement());

		this._incrementHourButton = new Button({title: 'go forward one hour', text: '1 Hour', icon: 'play-icons_v2_forward'});
		this._incrementHourButton.setHandler(this._parent.incrementHour);
//		this._incrementHourButton.addCSSClass('increment-decrement');
		rightSection.appendChild(this._incrementHourButton.getElement());

		this._incrementDayButton = new Button({title: 'go forward one day', text: '1 Day', icon: 'play-icons_v2_double-forward'});
		this._incrementDayButton.setHandler(this._parent.incrementDay);
//		this._incrementDayButton.addCSSClass('increment-decrement');
		rightSection.appendChild(this._incrementDayButton.getElement());

		this.setMode(this.MODE_ALL_ENABLED);
	}


	getElement() {
		return this._element;
	}


	getHeight() {
		return this._element.clientHeight;
	}

	setMode(arg) {

		if (arg === this.MODE_ALL_DISABLED) {

			this._decrementDayButton.setEnabled(false);
			this._decrementHourButton.setEnabled(false);
			this._pauseButton.setEnabled(false);
			this._playButton.setEnabled(false);
			this._goToDay1Button.setEnabled(false);
			this._incrementHourButton.setEnabled(false);
			this._incrementDayButton.setEnabled(false);

		} else if (arg === this.MODE_PAUSE_ENABLED) {

			this._playButton.setVisible(false);
			this._pauseButton.setVisible(true);

			this._decrementDayButton.setEnabled(false);
			this._decrementHourButton.setEnabled(false);
			this._pauseButton.setEnabled(true);
			this._goToDay1Button.setEnabled(false);
			this._incrementHourButton.setEnabled(false);
			this._incrementDayButton.setEnabled(false);

		} else if (arg === this.MODE_ALL_ENABLED) {

			this._playButton.setVisible(true);
			this._pauseButton.setVisible(false);

			this._decrementDayButton.setEnabled(true);
			this._decrementHourButton.setEnabled(true);
			this._playButton.setEnabled(true);
			this._goToDay1Button.setEnabled(true);
			this._incrementHourButton.setEnabled(true);
			this._incrementDayButton.setEnabled(true);

		} else {
			console.error('Invalid mode.');
			return;
		}
	}


}


