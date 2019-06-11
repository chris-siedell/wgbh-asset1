/*
Button.js
wgbh-asset1
astro.unl.edu
2019-06-10
*/


export default class Button {


	constructor(initParams) {

		this._button = document.createElement('button');

		this.setParams(initParams);
	}


	setParams(params) {

		// TODO: this is written to work once -- no updates!

		if (params.width !== undefined) {
			this._button.style.width = params.width + 'px';
		}

		if (params.height !== undefined) {
			this._button.style.height = params.height + 'px';
		}

		if (params.title !== undefined) {
			this._button.setAttribute('aria-label', params.title);
			this._button.setAttribute('title', params.title);
		}

		if (params.text !== undefined) {

			if (params.icon !== undefined) {

				let icon = document.createElement('img');
				icon.src = 'icons/' + params.icon + '.svg';
				this._button.appendChild(icon);

				let text = document.createElement('div');
				text.textContent = params.text;
				this._button.appendChild(text);

			} else {

				let text = document.createElement('div');
				text.textContent = params.text;
				this._button.appendChild(text);

			}
		}

	}


	addCSSClass(className) {
		this._button.classList.add(className);
	}


	setHandler(func) {
		this._button.addEventListener('click', (e) => {
			e.preventDefault();
			func();
		});
	}


	getElement() {
		return this._button;
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


