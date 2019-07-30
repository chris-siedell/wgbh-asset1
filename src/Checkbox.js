/*
Checkbox.js
wgbh-asset1
astro.unl.edu
2019-07-29
*/


export default class Checkbox {

	
	static getUniqueID() {
 		let id = 'wgbh-checkbox-' + Checkbox.prototype.__checkboxNum;
		Checkbox.prototype.__checkboxNum += 1;
		return id;
	}


	constructor(initParams) {

		this._onCheckChange = this._onCheckChange.bind(this);
		this._onFocusIn = this._onFocusIn.bind(this);
		this._onFocusOut = this._onFocusOut.bind(this);

		let labelText = 'Checkbox';
		this._isChecked = true;
		this._callback = null;

		if (typeof initParams === 'object') {
			if (initParams.hasOwnProperty('label')) {
				labelText = initParams.label;
			}
			if (initParams.hasOwnProperty('isChecked')) {
				this._isChecked = Boolean(initParams.isChecked);
			}
			if (initParams.hasOwnProperty('callback')) {
				this._callback = initParams.callback;
			}
		}

		let id = Checkbox.getUniqueID();

		this._element = document.createElement('div');
		this._element.classList.add('wgbh-checkbox');		

		this._check = document.createElement('input');
		this._check.classList.add('wgbh-checkbox-input');
		this._check.type = 'checkbox';
		this._check.id = id;
		this._check.name = labelText;
		this._check.checked = this._isChecked;
		this._check.addEventListener('change', this._onCheckChange);

		this._label = document.createElement('label');
		this._label.htmlFor = id;
		this._element.appendChild(this._label);
		this._label.appendChild(this._check);

		this._indicator = document.createElement('div');
		this._indicator.classList.add('wgbh-checkbox-indicator');
		this._label.appendChild(this._indicator);

		this._text = document.createElement('span');
		this._text.textContent = labelText;
		this._label.appendChild(this._text);

		this._element.addEventListener('focusin', this._onFocusIn);
		this._element.addEventListener('focusout', this._onFocusOut);
	}

	getElement() {
		return this._element;
	}

	setLabel(arg) {
		this._check.name = arg;
		this._labelText.textContent = arg;
	}

	getIsChecked() {
		return this._isChecked;
	}

	setIsChecked(arg) {
		arg = Boolean(arg);
		if (this._isChecked !== arg) {
			this._isChecked = arg;
			this._check.checked = this._isChecked;
		}
	}

	_onCheckChange() {
		this._isChecked = this._check.checked;
		if (this._callback !== null) {
			this._callback(this, this._isChecked);
		}	
	}

	_onFocusIn(e) {
		this._element.classList.add('wgbh-checkbox-focused');
	}

	_onFocusOut(e) {
		this._element.classList.remove('wgbh-checkbox-focused');
	}

}


Checkbox.prototype.__checkboxNum = 1;

