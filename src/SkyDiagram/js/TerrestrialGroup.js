		// The foreground filter applies the nighttime shading to everything
		//	that is on the earth (i.e. the ground and foreground objects).

		let foregroundFilter = document.createElementNS(svgNS, 'filter');
		foregroundFilter.setAttribute('id', 'foreground-filter');
		main.appendChild(foregroundFilter);

		this._foregroundFilterMatrix = document.createElementNS(svgNS, 'feColorMatrix');
		this._foregroundFilterMatrix.setAttribute('in', 'SourceGraphic');
		this._foregroundFilterMatrix.setAttribute('type', 'matrix');
		this._foregroundFilterMatrix.setAttribute('values', '0.5 0 0 0 0  0 0.5 0 0 0  0 0 0.5 0 0  0 0 0 1 0');
		foregroundFilter.appendChild(this._foregroundFilterMatrix);
		// The element _ground will be created and appended to _foregroundGroup in _replaceGroundImage.
		// Any additional foreground images will be appended to _foregroundGroup in _updateForegroundImages.

			nightForegroundShading: 0.5,

