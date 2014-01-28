define(["dojo/_base/lang", "dcolor/Color"],
	function (lang, Color){

	//	helper functions
	function rangeDiff(val, low, high){
		//	given the value in a range from 0 to high, find the equiv
		//		using the range low to high.
		return high-((high-val)*((high-low)/high));
	}

	var result = {
		// summary:
		//		A Theme is a pre-defined object, primarily JSON-based, that makes up the definitions to
		//		style a chart. It extends Theme with additional features like color definition by
		//		palettes and gradients definition.

		generateGradient: function (fillPattern, colorFrom, colorTo){
			var fill = lang.delegate(fillPattern);
			fill.colors = [
				{offset: 0, color: colorFrom},
				{offset: 1, color: colorTo}
			];
			return fill;
		},

		generateHslColor: function (color, luminance){
			color = new Color(color);
			var hsl = color.toHslaArray();
			return Color.fromHslaArray([hsl[0], hsl[1], luminance, hsl[3]]);
		},

		generateHslGradient: function (color, fillPattern, lumFrom, lumTo){
			color = new Color(color);
			var hsl = color.toHslaArray(),
				colorFrom = Color.fromHslaArray([hsl[0], hsl[1], lumFrom, hsl[3]]),
				colorTo = Color.fromHslaArray([hsl[0], hsl[1], lumTo, hsl[3]]);
			return result.generateGradient(fillPattern, colorFrom, colorTo);	// Object
		}
	};

	return result;
});
