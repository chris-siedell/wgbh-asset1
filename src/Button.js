

export default class Button {


	constructor(initParams) {

		this._button = document.createElement('button');


		this.setParams(initParams);
	}

	setParams(params) {

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
			this._button.textContent = params.text;
		}

	}

	setHandler(func) {
		this._button.onclick = func;
	}


	getElement() {
		return this._button;
	}

	setEnabled(arg) {
		this._button.setAttribute('disabled', !arg);
	}

}


