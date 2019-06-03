

	// The ground image is scaled and placed horizontally such that it takes the entire width
	//	of the diagram. It is scaled and placed vertically such that the lower half of the
	//	image goes from the the bottom edge of the diagram to the horizon level, and the upper
	//	half of the image is above that. This setup allows a wavy horizon.
	// As the horizon parameter gets smaller the image is vertically compressed. When the horizon
	//	parameter is zero the ground image is hidden.
	// The above scaling rules mean that the image usually does not preserve its aspect ratio.
	// If groundImageSrc is the empty string no ground graphics will be drawn (unlike
	//	the moon and sun images).


	getGroundImageSrc() {
		return this._groundImageSrc;
	}

	setGroundImageSrc(arg, warnings) {
		this._groundImageSrc = this.validateGroundImageSrc(arg, warnings);
		this._needs_replaceGroundImage = true;
	}

	validateGroundImageSrc(arg, warnings) {
		return this.validateImageSrc(arg, warnings);
	}

	_replaceGroundImage() {
		
		this._needsUpdateLayout = true;

		if (typeof this._groundImageSrc === 'string' && this._groundImageSrc !== '') {

			let newGround = document.createElementNS(svgNS, 'image');
			newGround.setAttributeNS(xlinkNS, 'href', this._groundImageSrc);
			newGround.setAttribute('preserveAspectRatio', 'none');
			newGround.setAttribute('width', '100%');

			if (this._ground !== undefined) {
				this._foregroundGroup.replaceChild(newGround, this._ground);
				this._ground = newGround;
			} else {
				this._foregroundGroup.appendChild(newGround);
				this._ground = newGround;
			}
		} else {
			if (this._ground !== undefined) {
				this._foregroundGroup.removeChild(this._ground);
				this._ground = undefined;
			}
		}
		
		this._needs_replaceGroundImage = false;
	}
