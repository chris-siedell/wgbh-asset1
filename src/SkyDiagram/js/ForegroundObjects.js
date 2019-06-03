
		this._foregroundGroup = document.createElementNS(svgNS, 'g');
		main.appendChild(this._foregroundGroup);




		this.addForegroundObject({
			url: 'graphics/tree.svg',
			x: 0,//0.25,
			y: 0,//0.5,
			cx: 0.5,
			cy: 1.0,
			width: 0.1,
			aspectRatio: 150/175,
		});



	addForegroundObject(fobj) {

		// fobj must be an object with the following parameters:
		//	- url: the object's image URL,
		//	- x, y: the relative position of the object's origin,
		//	- width: the relative width of the object,
		//	- aspectRatio: defined as relativeWidth/relativeHeight, and
		//	- cx, cy (optional): the offset of the object's center, as fractions of its width
		//		and height; if undefined, the default is the upper-left corner at <0,0>.

		// The position is defined such that:
		//  x = 0.0 corresponds to the left horizon point (the horizon and path intersection),
		//	x = 1.0 corresponds to the right horizon point,
		//	y = 0.0 corresponds to the horizon level, and
		//	y = 1.0 corresponds to the bottom edge of the diagram.
		// So the position is defined in a left-hand system.
		// If the horizon parameter is 0 all y-values are essentially ignored and the foreground
		//	objects will be placed at the bottom of the diagram.	

		// The width is defined as a fraction of the distance between the left horizon point
		//  and the right horizon point. E.g. if there are 400px between the two points and
		//	width is set to the 0.1, the foreground object will be 40px wide.
		// The height of the object is scaled automatically to preserve the aspect ratio.

		let image = document.createElementNS(svgNS, 'image');
		image.setAttributeNS(xlinkNS, 'href', fobj.url);
		image.setAttribute('preserveAspectRatio', 'xMinYMin');
		this._foregroundGroup.appendChild(image);

		let copy = {};
		copy.url = fobj.url;
		copy.x = fobj.x;
		copy.y = fobj.y;
		copy.cx = fobj.cx;
		copy.cy = fobj.cy;
		copy.width = fobj.width;
		copy.aspectRatio = fobj.aspectRatio;
		copy.image = image;

		this._foregroundObjects.push(copy);
	}


