/*
Asset1
WGBH
astro.unl.edu
2019-05-19
*/

	
import SkyDiagram from './SkyDiagram/SkyDiagram.js';

var versionNum = '0.0';
var versionDateStr = '2019-05-20-xxxx';


class Asset1 {

	constructor(rootElement) {

		this._diagram = new SkyDiagram(rootElement);
	}

	getElement() {
		return this._diagram.getElement();
	}

	getParams() {
		return this._diagram.getParams();
	}

	setParams(params) {
		this._diagram.setParams(params);
	}

	update() {
		this._diagram.update();
	}

}


if (typeof window !== 'undefined') {
	if (window.WGBHAsset1 === undefined) {
		window.WGBHAsset1 = Asset1;
		console.log('Component loaded: WGBHAsset1 (version: ' + versionNum + ', build: ' + versionDateStr + ')');
	}
}

