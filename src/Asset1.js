/*
Asset1
WGBH
astro.unl.edu
2019-05-19
*/

	
import SkyDiagram from './SkyDiagram/SkyDiagram.js';

var versionNum = '0.1';
var versionDateStr = '2019-05-19-xxxx';


class Asset1 {

	constructor(rootElement) {
		console.log('WGBHAsset1\n version: ' + versionNum + '\n build date: ' + versionDateStr);

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
	}
}

