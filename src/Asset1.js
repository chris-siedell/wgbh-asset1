/*
Asset1
WGBH
astro.unl.edu
2019-05-13
*/

	
import SkyDiagram from './SkyDiagram/SkyDiagram.js';

var versionNum = '0.1';
var versionDateStr = '2019-05-13-1827';


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

	if (typeof window.WGBH !== 'object') {
		window.WGBH = {};
	}
	
	if (window.WGBH.Asset1 === undefined) {
		window.WGBH.Asset1 = Asset1;
	}
}


