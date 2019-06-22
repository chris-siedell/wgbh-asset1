/*
ControlPanel.js
wgbh-asset1
astro.unl.edu
2019-06-21
*/


import PlayIconURL from './icons/play-icons_v2_play.svg';
import PauseIconURL from './icons/play-icons_v2_pause.svg';
import SkipBackOneDayURL from './icons/double-back.svg';
import SkipBackOneHourURL from './icons/back.svg';
import SkipForwardOneDayURL from './icons/double-forward.svg';
import SkipForwardOneHourURL from './icons/forward.svg';

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

		let primaryBlock = document.createElement('div');
		primaryBlock.classList.add('wgbh-asset1-controlpanel-primary');
		this._element.appendChild(primaryBlock);

		let topSection = document.createElement('div');
		topSection.classList.add('wgbh-asset1-controlpanel-top');
		primaryBlock.appendChild(topSection);

		let leftSection = document.createElement('div');
		leftSection.classList.add('wgbh-asset1-controlpanel-left');
		primaryBlock.appendChild(leftSection);

		let rightSection = document.createElement('div');
		rightSection.classList.add('wgbh-asset1-controlpanel-right');
		primaryBlock.appendChild(rightSection);

		let bottomSection = document.createElement('div');
		bottomSection.classList.add('wgbh-asset1-controlpanel-bottom');
		this._element.appendChild(bottomSection);


		this._decrementHourButton = new Button({
			title: 'go back one hour',
			text: '1 Hour',
			iconSrc: SkipBackOneHourURL,
			specificClass: 'wgbh-asset1-skip',
		});
		this._decrementHourButton.addHandler(this._parent.decrementHour);
		leftSection.appendChild(this._decrementHourButton.getElement());
		
		this._decrementDayButton = new Button({
			title: 'go back one day',
			text: '1 Day',
			iconSrc: SkipBackOneDayURL,
			specificClass: 'wgbh-asset1-skip',
		});

		this._decrementDayButton.addHandler(this._parent.decrementDay);
		leftSection.appendChild(this._decrementDayButton.getElement());

		this._playButton = new Button({
			title: 'play',
			text: 'Play',
			iconSrc: PlayIconURL,
			specificClass: 'wgbh-asset1-play-pause',
		});
		this._playButton.addHandler(this._parent.play);
		topSection.appendChild(this._playButton.getElement());

		this._pauseButton = new Button({
			title: 'pause',
			text: 'Pause',
			iconSrc: PauseIconURL,
			specificClass: 'wgbh-asset1-play-pause',
		});
		this._pauseButton.addHandler(this._parent.pause);
		topSection.appendChild(this._pauseButton.getElement());

		this._goToDay1Button = new Button({
			title: 'go to day 1',
			text: 'Go to Day 1',
			specificClass: 'wgbh-asset1-reset',
		});
		this._goToDay1Button.addHandler(this._parent.goToDay1);
		bottomSection.appendChild(this._goToDay1Button.getElement());

		this._incrementHourButton = new Button({
			title: 'go forward one hour',
			text: '1 Hour',
			iconSrc: SkipForwardOneHourURL,
			specificClass: 'wgbh-asset1-skip',
		});
		this._incrementHourButton.addHandler(this._parent.incrementHour);
		rightSection.appendChild(this._incrementHourButton.getElement());

		this._incrementDayButton = new Button({
			title: 'go forward one day',
			text: '1 Day',
			iconSrc: SkipForwardOneDayURL,
			specificClass: 'wgbh-asset1-skip',
		});
		this._incrementDayButton.addHandler(this._parent.incrementDay);
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


