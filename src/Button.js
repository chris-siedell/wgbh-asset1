/*
Button.js
wgbh-asset1
astro.unl.edu
2019-06-21
*/


export default class Button {


	constructor(initParams) {
		// initParams:
		//	title - required
		//	iconSrc - optional
		//	text - required
		// 	specificClass - optional
		
		this._button = document.createElement('button');
		this._button.classList.add('wgbh-asset1-button');

		this._button.setAttribute('aria-label', initParams.title);
		this._button.setAttribute('title', initParams.title);

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
		this._label.textContent = initParams.text;
		this._contents.appendChild(this._label);
	}

	getElement() {
		return this._button;
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
		if (arg) {
			this._button.style.display = 'block';
		} else {
			this._button.style.display = 'none';
		}
	}

}


