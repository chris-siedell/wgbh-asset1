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
		if (sunPosition <= 0.5) {
			this._skyBottomStop.setAttribute('stop-color', this._dayBottomColor);
			this._skyTopStop.setAttribute('stop-color', this._dayTopColor);
			this._foregroundGroup.setAttribute('filter', 'none');
		} else {
			this._skyBottomStop.setAttribute('stop-color', this._nightBottomColor);
			this._skyTopStop.setAttribute('stop-color', this._nightTopColor);
			this._foregroundGroup.setAttribute('filter', 'url(#foreground-filter)');
		}



	setNightForegroundShading(arg) {
		this._nightForegroundShading = this.validateNightForegroundShading(arg);
		let n = String(this._nightForegroundShading);
		this._foregroundFilterMatrix.setAttribute('values', n + ' 0 0 0 0  0 ' + n + ' 0 0 0  0 0 ' + n + ' 0 0  0 0 0 1 0');
	}




	validateNightForegroundShading(arg) {
		arg = this.validateNumber(arg, 'nightForegroundShading');
		if (arg < 0) {
			arg = 0;
		} else if (arg > 1) {
			arg = 1;
		}
		return arg;
	}


	validateNumber(arg, paramName) {
		if (typeof arg !== 'number') {
			arg = Number(arg);
		}
		if (!Number.isFinite(arg)) {
			throw new Error(paramName + ' must be a valid number.');
		}
		return arg;
	}
