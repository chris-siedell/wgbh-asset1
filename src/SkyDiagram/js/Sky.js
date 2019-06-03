/*
Sky.js
2019-06-02
*/


export default class Sky {


	constructor() {


	}


}


			dayBottomColor: '#29abe2',
			dayTopColor: '#155ac7',
			nightBottomColor: '#323052',
			nightTopColor: '#030305',

		let defs = document.createElementNS(svgNS, 'defs');
		main.appendChild(defs);
		
		let skyGradient = document.createElementNS(svgNS, 'linearGradient');
		skyGradient.setAttribute('id', 'sky-gradient');
		skyGradient.setAttribute('gradientTransform', 'rotate(-90, 1, 0)');
		defs.appendChild(skyGradient);

		this._skyBottomStop = document.createElementNS(svgNS, 'stop');
		this._skyBottomStop.setAttribute('offset', '0');
		skyGradient.appendChild(this._skyBottomStop);

		this._skyTopStop = document.createElementNS(svgNS, 'stop');
		this._skyTopStop.setAttribute('offset', '1');
		skyGradient.appendChild(this._skyTopStop);

		let sky = document.createElementNS(svgNS, 'rect');
		sky.setAttribute('x', '0');
		sky.setAttribute('y', '0');
		sky.setAttribute('rx', '0');
		sky.setAttribute('ry', '0');
		sky.setAttribute('width', '100%');
		sky.setAttribute('height', '100%');
		sky.setAttribute('fill', 'url(#sky-gradient)');
		main.appendChild(sky);


