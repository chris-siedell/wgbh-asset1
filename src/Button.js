/*
Button.js
wgbh-asset1
astro.unl.edu
2019-06-25
*/


export default class Button {


	constructor(initParams) {
		// initParams:
		//	desc - required
		//	iconSrc - optional
		//	label - required
		// 	specificClass - optional
		
		this._button = document.createElement('button');
		this._button.classList.add('wgbh-asset1-button');

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
		this._button.disabled = !arg;
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


