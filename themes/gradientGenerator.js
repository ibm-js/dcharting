define(["dojo/_base/lang", "dojo/_base/array", "dcolor/Color", "./utils"],
	function(lang, arr, Color, utils){
	
	var gg = {};

	gg.generateFills = function(colors, fillPattern, lumFrom, lumTo){
		// summary:
		//		generates 2-color gradients using pure colors, a fill pattern, and two luminance values
		// colors: Array
		//		Array of colors to generate gradients for each.
		// fillPattern: Object
		//		Gradient fill descriptor which colors list will be generated.
		// lumFrom: Number
		//		Initial luminance value (0-100).
		// lumTo: Number
		//		Final luminance value (0-100).
		return colors.map(function(c){	// Array
			return utils.generateHslGradient(c, fillPattern, lumFrom, lumTo);
		});
	};
	
	gg.updateFills = function(themes, fillPattern, lumFrom, lumTo){
		// summary:
		//		transforms solid color fills into 2-color gradients using a fill pattern, and two luminance values
		// themes: Array
		//		Array of mini-themes (usually series themes or marker themes), which fill will be transformed.
		// fillPattern: Object
		//		Gradient fill descriptor which colors list will be generated.
		// lumFrom: Number
		//		Initial luminance value (0-100).
		// lumTo: Number
		//		Final luminance value (0-100).
		themes.forEach(function(t){
			if(t.fill && !t.fill.type){
				t.fill = utils.generateHslGradient(t.fill, fillPattern, lumFrom, lumTo);
			}
		});
	};
	
	gg.generateMiniTheme = function(colors, fillPattern, lumFrom, lumTo, lumStroke){
		// summary:
		//		generates mini-themes with 2-color gradients using colors, a fill pattern, and three luminance values
		// colors: Array
		//		Array of colors to generate gradients for each.
		// fillPattern: Object
		//		Gradient fill descriptor which colors list will be generated.
		// lumFrom: Number
		//		Initial luminance value (0-100).
		// lumTo: Number
		//		Final luminance value (0-100).
		// lumStroke: Number
		//		Stroke luminance value (0-100).
		return colors.map(function(c){	// Array
			c = new Color(c);
			return {
				fill:   utils.generateHslGradient(c, fillPattern, lumFrom, lumTo),
				stroke: {color: utils.generateHslColor(c, lumStroke)}
			};
		});
	};
	
	gg.generateGradientByIntensity = function(color, intensityMap){
		// summary:
		//		generates gradient colors using an intensity map
		// color: dojo.Color
		//		Color to use to generate gradients.
		// intensityMap: Array
		//		Array of tuples {o, i}, where o is a gradient offset (0-1),
		//		and i is an intensity (0-255).
		color = new Color(color);
		return intensityMap.map(function(stop){	// Array
			var s = stop.i / 255;
			return {
				offset: stop.o,
				color:  new Color([color.r * s, color.g * s, color.b * s, color.a])
			};
		});
	};
	
	return gg;
});
