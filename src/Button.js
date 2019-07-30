/*
Button.js
wgbh-asset1
astro.unl.edu
2019-07-29
*/


export default class Button {


	constructor(initParams) {
		// initParams:
		//	desc - required
		//	iconSrc - optional
		//	label - required
		// 	specificClass - optional
		
		this._button = document.createElement('button');
		this._button.classList.add('wgbh-button');

		this._button.setAttribute('aria-label', initParams.desc);
		this._button.setAttribute('title', initParams.desc);

		if (initParams.hasOwnProperty('specificClass')) {
			this._button.classList.add(initParams.specificClass);
		}

		this._contents = document.createElement('div');
		this._button.appendChild(this._contents);

		if (initParams.hasOwnProperty('iconSrc')) {
			this._icon = document.createElement('img');
			this._icon.src = initParams.iconSrc;
			this._contents.appendChild(this._icon);
		}

		this._label = document.createElement('span');
		this._label.textContent = initParams.label;
		this._contents.appendChild(this._label);

		this._isFocused = false;
		this._isEnabled = true;

		this._onFocus = this._onFocus.bind(this);
		this._onBlur = this._onBlur.bind(this);

		this._button.addEventListener('focusin', this._onFocus);
		this._button.addEventListener('focusout', this._onBlur);
	}

	toString() {
		return 'Button (' + this._label.textContent + ')';
	}

	_onFocus(e) {
		this._isFocused = true;
	}

	_onBlur(e) {
		this._isFocused = false;
	}

	getIsFocused() {
		return this._isFocused;
	}

	setIsFocused(arg) {
		arg = Boolean(arg);
		if (arg === this._isFocused) {
			return;
		}
		// Setting _isFocused here is redundant *if* the focusin/out events are dispatched when focus()
		//	and blur() are called, however in Firefox that does not appear to be the case.
		this._isFocused = arg;
		if (this._isFocused) {
			this._button.focus();
		} else {
			this._button.blur();
		}
	}

	getElement() {
		return this._button;
	}

	updateWithParams(params) {
		this._button.setAttribute('aria-label', params.desc);
		this._button.setAttribute('title', params.desc);
		this._label.textContent = params.label;
	}

	addHandler(func) {
		this._button.addEventListener('click', (e) => {
			e.preventDefault();
			func();
		});
	}

	setEnabled(arg) {
		arg = Boolean(arg);
		if (arg === this._isEnabled) {
			return;
		}
		this._isEnabled = arg;
		this._button.disabled = !this._isEnabled;
	}
	
	setVisible(arg) {
		// Currently only the play/pause buttons require this method to
		//	alternate between them.
		if (arg) {
			this._button.style.display = 'inline-block';
		} else {
			this._button.style.display = 'none';
		}
	}

}


