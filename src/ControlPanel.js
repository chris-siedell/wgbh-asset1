/*
ControlPanel.js
wgbh-asset1
astro.unl.edu
2019-06-25
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

		this._goToDay1Button = new Button({
			desc: loc.goToDay1Button.desc,
			label: loc.goToDay1Button.label,
			specificClass: 'wgbh-asset1-reset',
		});
		this._goToDay1Button.addHandler(this._parent.goToDay1);
		bottomSection.appendChild(this._goToDay1Button.getElement());

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

		// TODO: finalize
		let bottomestSection = document.createElement('div');
		bottomestSection.classList.add('wgbh-asset1-controlpanel-bottomest');
		this._element.appendChild(bottomestSection);

		this._phaseReadoutCheck = document.createElement('input');
		this._phaseReadoutCheck.type = 'checkbox';
		this._phaseReadoutCheck.id = 'wgbh-asset1-phase-readout-check';
		this._phaseReadoutCheck.name = 'Show Moon Phase Names';
		this._phaseReadoutCheck.checked = this._parent._isPhaseReadoutShown;
		this._phaseReadoutCheck.addEventListener('change', (e) => {
			try {
				this._parent._setIsPhaseReadoutShown(this._phaseReadoutCheck.checked);
			} catch (err) {
				console.error(err);
				this._phaseReadoutCheck.checked = this._parent._isPhaseReadoutShown;
				return;
			}
		});

		this._phaseReadoutLabel = document.createElement('label');
		this._phaseReadoutLabel.htmlFor = 'wgbh-asset1-phase-readout-check';
		this._phaseReadoutLabel.appendChild(this._phaseReadoutCheck);

		this._phaseReadoutLabelText = document.createElement('span');
		this._phaseReadoutLabelText.textContent = loc.phaseReadoutCheckLabel;
		this._phaseReadoutLabel.appendChild(this._phaseReadoutLabelText);

		bottomestSection.appendChild(this._phaseReadoutLabel);

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


