define(["dojo/_base/lang", "dojo/_base/array", "dojo/_base/Color", "dcolor/utils"],
	function (lang, arr, Color, utils){

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

		/*=====
		 var __DefineColorArgs = {
		 // summary:
		 //		The arguments object that can be passed to define colors for a theme.
		 // num: Number?
		 //		The number of colors to generate.  Defaults to 5.
		 // colors: String[]|dojo/_base/Color[]?
		 //		A pre-defined set of colors; this is passed through to the Theme directly.
		 // hue: Number?
		 //		A hue to base the generated colors from (a number from 0 - 359).
		 // saturation: Number?
		 //		If a hue is passed, this is used for the saturation value (0 - 100).
		 // low: Number?
		 //		An optional value to determine the lowest value used to generate a color (HSV model)
		 // high: Number?
		 //		An optional value to determine the highest value used to generate a color (HSV model)
		 // base: String|dojo/_base/Color?
		 //		A base color to use if we are defining colors
		 // generator: String?
		 //		The generator function name from dcharting/themes/utils.
		 };
		 =====*/

		defineColors: function(kwArgs){
			// summary:
			//		Generate a set of colors for the theme based on keyword
			//		arguments.
			// kwArgs: __DefineColorArgs
			//		The arguments object used to define colors.
			// returns: dojo/_base/Color[]
			//		An array of colors for use in a theme.
			//
			// example:
			//	|	var colors = utils.defineColors({
			//	|		base: "#369",
			//	|		generator: "compound"
			//	|	});
			//
			// example:
			//	|	var colors = utils.defineColors({
			//	|		hue: 60,
			//	|		saturation: 90,
			//	|		low: 30,
			//	|		high: 80
			//	|	});
			kwArgs = kwArgs || {};
			var l, c = [], n = kwArgs.num || 5;	// the number of colors to generate
			if(kwArgs.colors){
				// we have an array of colors predefined, so fix for the number of series.
				l = kwArgs.colors.length;
				for(var i = 0; i < n; i++){
					c.push(kwArgs.colors[i % l]);
				}
				return c;	//	dojo.Color[]
			}
			if(kwArgs.hue){
				// single hue, generate a set based on brightness
				var s = kwArgs.saturation || 100,	// saturation
					st = kwArgs.low || 30,
					end = kwArgs.high || 90;
				// we'd like it to be a little on the darker side.
				l = (end + st) / 2;
				// alternately, use "shades"
				return result.generate(
					utils.fromHsv(kwArgs.hue, s, l), "monochromatic"
				);
			}
			if(kwArgs.generator){
				//	pass a base color and the name of a generator
				return result.generate(kwArgs.base, kwArgs.generator);
			}
			return c;	//	dojo.Color[]
		},

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
			var hsl = utils.toHsl(color),
				result = utils.fromHsl(hsl.h, hsl.s, luminance);
			result.a = color.a;	// add missing opacity
			return result;
		},

		generateHslGradient: function (color, fillPattern, lumFrom, lumTo){
			color = new Color(color);
			var hsl = utils.toHsl(color),
				colorFrom = utils.fromHsl(hsl.h, hsl.s, lumFrom),
				colorTo = utils.fromHsl(hsl.h, hsl.s, lumTo);
			colorFrom.a = colorTo.a = color.a;	// add missing opacity
			return result.generateGradient(fillPattern, colorFrom, colorTo);	// Object
		},

		generators: {
			analogous: function (/* __analogousArgs */args){
				// summary:
				//		Create a 5 color palette based on the analogous rules as implemented at
				//		http://kuler.adobe.com.
				var high = args.high || 60, 	//	delta between base hue and highest hue (subtracted from base)
					low = args.low || 18,		//	delta between base hue and lowest hue (added to base)
					base = lang.isString(args.base)?new Color(args.base):args.base,
					hsv = utils.toHsv(base);

				//	generate our hue angle differences
				var h = [
					(hsv.h + low + 360) % 360,
					(hsv.h + Math.round(low / 2) + 360) % 360,
					hsv.h,
					(hsv.h - Math.round(high / 2) + 360) % 360,
					(hsv.h - high + 360) % 360
				];

				var s1 = Math.max(10, (hsv.s <= 95)?hsv.s + 5:(100 - (hsv.s - 95))),
					s2 = (hsv.s > 1)?hsv.s - 1:21 - hsv.s,
					v1 = (hsv.v >= 92)?hsv.v - 9:Math.max(hsv.v + 9, 20),
					v2 = (hsv.v <= 90)?Math.max(hsv.v + 5, 20):(95 + Math.ceil((hsv.v - 90) / 2)),
					s = [ s1, s2, hsv.s, s1, s1 ],
					v = [ v1, v2, hsv.v, v1, v2 ];

				return new arr.map(h, function (hue, i){
					return utils.fromHsv(hue, s[i], v[i]);
				});
			},

			monochromatic: function (/* __generatorArgs */args){
				// summary:
				//		Create a 5 color palette based on the monochromatic rules as implemented at
				//		http://kuler.adobe.com.
				var base = lang.isString(args.base)?new Color(args.base):args.base,
					hsv = utils.toHsv(base);

				//	figure out the saturation and value
				var s1 = (hsv.s - 30 > 9)?hsv.s - 30:hsv.s + 30,
					s2 = hsv.s,
					v1 = rangeDiff(hsv.v, 20, 100),
					v2 = (hsv.v - 20 > 20)?hsv.v - 20:hsv.v + 60,
					v3 = (hsv.v - 50 > 20)?hsv.v - 50:hsv.v + 30;

				return [
					utils.fromHsv(hsv.h, s1, v1),
					utils.fromHsv(hsv.h, s2, v3),
					base,
					utils.fromHsv(hsv.h, s1, v3),
					utils.fromHsv(hsv.h, s2, v2)
				];
			},

			triadic: function (/* __generatorArgs */args){
				// summary:
				//		Create a 5 color palette based on the triadic rules as implemented at
				//		http://kuler.adobe.com.
				var base = lang.isString(args.base)?new Color(args.base):args.base,
					hsv = utils.toHsv(base);

				var h1 = (hsv.h + 57 + 360) % 360,
					h2 = (hsv.h - 157 + 360) % 360,
					s1 = (hsv.s > 20)?hsv.s - 10:hsv.s + 10,
					s2 = (hsv.s > 90)?hsv.s - 10:hsv.s + 10,
					s3 = (hsv.s > 95)?hsv.s - 5:hsv.s + 5,
					v1 = (hsv.v - 20 > 20)?hsv.v - 20:hsv.v + 20,
					v2 = (hsv.v - 30 > 20)?hsv.v - 30:hsv.v + 30,
					v3 = (hsv.v - 30 > 70)?hsv.v - 30:hsv.v + 30;

				return [
					utils.fromHsv(h1, s1, hsv.v),
					utils.fromHsv(hsv.h, s2, v2),
					base,
					utils.fromHsv(h2, s2, v1),
					utils.fromHsv(h2, s3, v3)
				];
			},

			complementary: function (/* __generatorArgs */args){
				// summary:
				//		Create a 5 color palette based on the complementary rules as implemented at
				//		http://kuler.adobe.com.
				var base = lang.isString(args.base)?new Color(args.base):args.base,
					hsv = utils.toHsv(base);

				var h1 = ((hsv.h * 2) + 137 < 360)?(hsv.h * 2) + 137:Math.floor(hsv.h / 2) - 137,
					s1 = Math.max(hsv.s - 10, 0),
					s2 = rangeDiff(hsv.s, 10, 100),
					s3 = Math.min(100, hsv.s + 20),
					v1 = Math.min(100, hsv.v + 30),
					v2 = (hsv.v > 20)?hsv.v - 30:hsv.v + 30;

				return [
					utils.fromHsv(hsv.h, s1, v1),
					utils.fromHsv(hsv.h, s2, v2),
					base,
					utils.fromHsv(h1, s3, v2),
					utils.fromHsv(h1, hsv.s, hsv.v)
				];
			},

			splitComplementary: function (/* __splitComplementaryArgs */args){
				// summary:
				//		Create a 5 color palette based on the split complementary rules as implemented at
				//		http://kuler.adobe.com.
				var base = lang.isString(args.base)?new Color(args.base):args.base,
					dangle = args.da || 30,
					hsv = utils.toHsv(base);

				var baseh = ((hsv.h * 2) + 137 < 360)?(hsv.h * 2) + 137:Math.floor(hsv.h / 2) - 137,
					h1 = (baseh - dangle + 360) % 360,
					h2 = (baseh + dangle) % 360,
					s1 = Math.max(hsv.s - 10, 0),
					s2 = rangeDiff(hsv.s, 10, 100),
					s3 = Math.min(100, hsv.s + 20),
					v1 = Math.min(100, hsv.v + 30),
					v2 = (hsv.v > 20)?hsv.v - 30:hsv.v + 30;

				return [
					utils.fromHsv(h1, s1, v1),
					utils.fromHsv(h1, s2, v2),
					base,
					utils.fromHsv(h2, s3, v2),
					utils.fromHsv(h2, hsv.s, hsv.v)
				];
			},

			compound: function (/* __generatorArgs */args){
				// summary:
				//		Create a 5 color palette based on the compound rules as implemented at
				//		http://kuler.adobe.com.
				var base = lang.isString(args.base)?new Color(args.base):args.base,
					hsv = utils.toHsv(base);

				var h1 = ((hsv.h * 2) + 18 < 360)?(hsv.h * 2) + 18:Math.floor(hsv.h / 2) - 18,
					h2 = ((hsv.h * 2) + 120 < 360)?(hsv.h * 2) + 120:Math.floor(hsv.h / 2) - 120,
					h3 = ((hsv.h * 2) + 99 < 360)?(hsv.h * 2) + 99:Math.floor(hsv.h / 2) - 99,
					s1 = (hsv.s - 40 > 10)?hsv.s - 40:hsv.s + 40,
					s2 = (hsv.s - 10 > 80)?hsv.s - 10:hsv.s + 10,
					s3 = (hsv.s - 25 > 10)?hsv.s - 25:hsv.s + 25,
					v1 = (hsv.v - 40 > 10)?hsv.v - 40:hsv.v + 40,
					v2 = (hsv.v - 20 > 80)?hsv.v - 20:hsv.v + 20,
					v3 = Math.max(hsv.v, 20);

				return [
					utils.fromHsv(h1, s1, v1),
					utils.fromHsv(h1, s2, v2),
					base,
					utils.fromHsv(h2, s3, v3),
					utils.fromHsv(h3, s2, v2)
				];
			},

			shades: function (/* __generatorArgs */args){
				// summary:
				//		Create a 5 color palette based on the shades rules as implemented at
				//		http://kuler.adobe.com.
				var base = lang.isString(args.base)?new Color(args.base):args.base,
					hsv = utils.toHsv(base);

				var s = (hsv.s == 100 && hsv.v == 0)?0:hsv.s,
					v1 = (hsv.v - 50 > 20)?hsv.v - 50:hsv.v + 30,
					v2 = (hsv.v - 25 >= 20)?hsv.v - 25:hsv.v + 55,
					v3 = (hsv.v - 75 >= 20)?hsv.v - 75:hsv.v + 5,
					v4 = Math.max(hsv.v - 10, 20);

				return [
					new utils.fromHsv(hsv.h, s, v1),
					new utils.fromHsv(hsv.h, s, v2),
					base,
					new utils.fromHsv(hsv.h, s, v3),
					new utils.fromHsv(hsv.h, s, v4)
				];
			}
		},
		generate: function (/* String|dojo/_base/Color */base, /* Function|String */type){
			// summary:
			//		Generate a new Palette using any of the named functions in
			//		dcharting.themes.utils.generators or an optional function definition.  Current
			//		generators include "analogous", "monochromatic", "triadic", "complementary",
			//		"splitComplementary", and "shades".
			if(lang.isFunction(type)){
				return type({ base: base });
			}else if(result.generators[type]){
				return result.generators[type]({ base: base });
			}
			throw new Error("dcharting.themes.utils.generate: the specified generator ('" + type + "') does not exist.");
		}
	};

	return result;
});
