/*
js/ControlPanel.js
wgbh-asset1
astro.unl.edu
2019-08-12
*/


import PlayIconURL from '../icons/play-icons_v2_play.svg';
import PauseIconURL from '../icons/play-icons_v2_pause.svg';
import SkipBackOneDayURL from '../icons/double-back-white.svg';
import SkipBackOneHourURL from '../icons/back-white.svg';
import SkipForwardOneDayURL from '../icons/double-forward-white.svg';
import SkipForwardOneHourURL from '../icons/forward-white.svg';


import Button from 'Button.js';
import Checkbox from 'Checkbox.js';


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

		let loc = this._parent._currLocalizations;

		this._decrementHourButton = new Button({
			desc: loc.decrementHourButton.desc,
			label: loc.decrementHourButton.label,
			iconSrc: SkipBackOneHourURL,
			specificClass: 'wgbh-asset1-skip',
		});
		this._decrementHourButton.addHandler(this._parent.decrementHour);
		leftSection.appendChild(this._decrementHourButton.getElement());
		
		this._decrementDayButton = new Button({
			desc: loc.decrementDayButton.desc,
			label: loc.decrementDayButton.label,
			iconSrc: SkipBackOneDayURL,
			specificClass: 'wgbh-asset1-skip',
		});

		this._decrementDayButton.addHandler(this._parent.decrementDay);
		leftSection.appendChild(this._decrementDayButton.getElement());

		this._playButton = new Button({
			desc: loc.playButton.desc,
			label: loc.playButton.label,
			iconSrc: PlayIconURL,
			specificClass: 'wgbh-asset1-play-pause',
		});
		this._playButton.addHandler(this._parent.play);
		topSection.appendChild(this._playButton.getElement());

		this._pauseButton = new Button({
			desc: loc.pauseButton.desc,
			label: loc.pauseButton.label,
			iconSrc: PauseIconURL,
			specificClass: 'wgbh-asset1-play-pause',
		});
		this._pauseButton.addHandler(this._parent.pause);
		topSection.appendChild(this._pauseButton.getElement());

		this._incrementHourButton = new Button({
			desc: loc.incrementHourButton.desc,
			label: loc.incrementHourButton.label,
			iconSrc: SkipForwardOneHourURL,
			specificClass: 'wgbh-asset1-skip',
		});
		this._incrementHourButton.addHandler(this._parent.incrementHour);
		rightSection.appendChild(this._incrementHourButton.getElement());

		this._incrementDayButton = new Button({
			desc: loc.incrementDayButton.desc,
			label: loc.incrementDayButton.label,
			iconSrc: SkipForwardOneDayURL,
			specificClass: 'wgbh-asset1-skip',
		});
		this._incrementDayButton.addHandler(this._parent.incrementDay);
		rightSection.appendChild(this._incrementDayButton.getElement());

		this._showPhaseReadoutCheck = new Checkbox({
			label: "Show Moon Phase Names",
			isChecked: this._parent._isPhaseReadoutShown,
			callback: (checkbox, value) => {
				this._parent._setIsPhaseReadoutShown(value);
			},
		});
		bottomSection.appendChild(this._showPhaseReadoutCheck.getElement());

		this._goToDay1Button = new Button({
			desc: loc.goToDay1Button.desc,
			label: loc.goToDay1Button.label,
			specificClass: 'wgbh-asset1-reset',
		});
		this._goToDay1Button.addHandler(this._parent.goToDay1);
		bottomSection.appendChild(this._goToDay1Button.getElement());

		this._prevFocusedButton = null;

		this.setMode(this.MODE_ALL_ENABLED);
	}

	getElement() {
		return this._element;
	}

	getHeight() {
		return this._element.clientHeight;
	}

	updateLocalizations() {
		let loc = this._parent._currLocalizations;
		this._decrementHourButton.updateWithParams(loc.decrementHourButton);
		this._decrementDayButton.updateWithParams(loc.decrementDayButton);
		this._playButton.updateWithParams(loc.playButton);
		this._pauseButton.updateWithParams(loc.pauseButton);
		this._goToDay1Button.updateWithParams(loc.goToDay1Button);
		this._incrementHourButton.updateWithParams(loc.incrementHourButton);
		this._incrementDayButton.updateWithParams(loc.incrementDayButton);
		this._phaseReadoutLabelText.textContent = loc.phaseReadoutCheckLabel;
	}

	_getCurrentFocusedButton() {
		// May return null.

		let buttons = [
			this._decrementDayButton,
			this._decrementHourButton,
			this._pauseButton,
			this._playButton,
			this._goToDay1Button,
			this._incrementHourButton,
			this._incrementDayButton,
		];

		for (const button of buttons) {
			if (button.getIsFocused()) {
				return button;
			}
		}

		return null;
	}

	setMode(arg) {

		if (arg === this.MODE_ALL_DISABLED) {

			this._prevFocusedButton = this._getCurrentFocusedButton();

			this._decrementDayButton.setEnabled(false);
			this._decrementHourButton.setEnabled(false);
			this._pauseButton.setEnabled(false);
			this._playButton.setEnabled(false);
			this._goToDay1Button.setEnabled(false);
			this._incrementHourButton.setEnabled(false);
			this._incrementDayButton.setEnabled(false);

			if (this._prevFocusedButton !== null) {
				// Sometimes, some browsers allow buttons to retain focus while disabled. When this
				//	happens and the user presses SPACE while disabled the button will be stuck in
				//	the activated state when the transition is over. Making sure the button does not
				//	have focus while disabled mitigates this issue (and correctly signifies to the user
				//	that interaction is currently not possible).
				this._prevFocusedButton.setIsFocused(false);
			}
		} else if (arg === this.MODE_PAUSE_ENABLED) {

			this._prevFocusedButton = this._getCurrentFocusedButton();

			this._playButton.setIsVisible(false);
			this._pauseButton.setIsVisible(true);

			this._decrementDayButton.setEnabled(false);
			this._decrementHourButton.setEnabled(false);
			this._pauseButton.setEnabled(true);
			this._goToDay1Button.setEnabled(false);
			this._incrementHourButton.setEnabled(false);
			this._incrementDayButton.setEnabled(false);

			if (this._prevFocusedButton === this._playButton) {
				// Transfer focus to pause button.
				this._pauseButton.setIsFocused(true);
			} else if (this._prevFocusedButton !== null) {
				// See comments in MODE_ALL_DISABLED section above.
				this._prevFocusedButton.setIsFocused(false);
			}
		} else if (arg === this.MODE_ALL_ENABLED) {

			this._playButton.setIsVisible(true);
			this._pauseButton.setIsVisible(false);

			this._decrementDayButton.setEnabled(true);
			this._decrementHourButton.setEnabled(true);
			this._playButton.setEnabled(true);
			this._goToDay1Button.setEnabled(true);
			this._incrementHourButton.setEnabled(true);
			this._incrementDayButton.setEnabled(true);

			if (this._prevFocusedButton !== null) {
				// Restore saved focus state from other two modes.
				this._prevFocusedButton.setIsFocused(true);
				this._prevFocusedButton = null;
			}	
		} else {
			this._prevFocusedButton = null;
			console.error('Invalid mode in control panel.');
			return;
		}
	}

}


