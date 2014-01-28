define(["dojo/_base/declare", "dcolor/Color",
		"dcolor/utils", "dojo/_base/connect", "./PlotAction", "dojox/gfx/fx"],
	function(declare, Color, utils, hub, PlotAction, dgf){

	var DEFAULT_SATURATION  = 100,	// %
		DEFAULT_LUMINOSITY1 = 75,	// %
		DEFAULT_LUMINOSITY2 = 50,	// %
		cc = function(color){
			return function(){ return color; };
		},

		hl = function(color){
			var a = new Color(color),
				x = utils.toHsl(a);
			if(x.s == 0){
				x.l = x.l < 50 ? 100 : 0;
			}else{
				x.s = DEFAULT_SATURATION;
				if(x.l < DEFAULT_LUMINOSITY2){
					x.l = DEFAULT_LUMINOSITY1;
				}else if(x.l > DEFAULT_LUMINOSITY1){
					x.l = DEFAULT_LUMINOSITY2;
				}else{
					x.l = x.l - DEFAULT_LUMINOSITY2 > DEFAULT_LUMINOSITY1 - x.l ?
						DEFAULT_LUMINOSITY2 : DEFAULT_LUMINOSITY1;
				}
			}
			var rcolor = utils.fromHsl(x);
			rcolor.a = a.a;
			return rcolor;
		};

	return declare(PlotAction, {
		// summary:
		//		Creates a highlighting action on a plot, where an element on that plot
		//		has a highlight on it.

		// highlight: dcolor/Color?|String
		//		A color used to highlight the plot element. A color string can be used. Default is null.
		highlight: null,
		// highlightFunc: Function?
		//		An optional function used to compute the highlighting color. It takes precedence over setting the
		// 		highlight property. When null a default function is computed that is using the highlight color if available or automatically
		// 		computing a color if not.  Default is null.
		highlightFunc:  null,

		constructor: function(chart, plot, params){
			// summary:
			//		Create the highlighting action and connect it to the plot.
			// chart: dcharting/Chart
			//		The chart this action belongs to.
			// plot: String?
			//		The plot this action is attached to.  If not passed, "default" is assumed.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			if(!params || !params.highlightFunc){
				this.highlightFunc = this.highlight ? cc(this.highlight) : hl;
			}
			this.connect();
		},

		process: function(o){
			// summary:
			//		Process the action on the given object.
			// o: dojox/gfx/shape.Shape
			//		The object on which to process the highlighting action.
			if(!o.shape || !(o.type in this.overOutEvents)){ return; }

			// if spider let's deal only with poly
			if(o.element == "spider_circle" || o.element == "spider_plot"){
				return;
			}

			var run = this.plot.series.indexOf(o.run), index = o.index, anim;

			if(run in this.anim){
				anim = this.anim[run][index];
			}else{
				this.anim[run] = {};
			}

			if(anim){
				anim.action.stop(true);
			}else{
				var color = o.shape.getFill();
				if(!color || !(color instanceof Color)){
					return;
				}
				this.anim[run][index] = anim = {
					start: color,
					end:   this.highlightFunc(color)
				};
			}

			var start = anim.start, end = anim.end;
			if(o.type == "onmouseout"){
				// swap colors
				var t = start;
				start = end;
				end = t;
			}

			anim.action = dgf.animateFill({
				shape:    o.shape,
				duration: this.duration,
				easing:   this.easing,
				color:    {start: start, end: end}
			});
			if(o.type == "onmouseout"){
				hub.connect(anim.action, "onEnd", this, function(){
					if(this.anim[run]){
						delete this.anim[run][index];
					}
				});
			}
			anim.action.play();
		}
	});

});
