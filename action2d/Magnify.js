define(["dojo/_base/connect", "dojo/_base/declare", "./PlotAction", "dojox/gfx/matrix", "dojox/gfx/fx", "dojo/fx"],
	function(Hub, declare, PlotAction, m, gf, df){

	return declare(PlotAction, {
		// summary:
		//		Create an action that magnifies the object the action is applied to.

		// scale: Number?
		//		The amount to magnify the given object to.  Default is 2.
		scale:    2,

		constructor: function(chart, plot, params){
			// summary:
			//		Create the magnifying action.
			// chart: dcharting/Chart
			//		The chart this action belongs to.
			// plot: String?
			//		The plot to apply the action to. If not passed, "default" is assumed.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			this.connect();
		},

		process: function(o){
			// summary:
			//		Process the action on the given object.
			// o: dojox/gfx/shape.Shape
			//		The object on which to process the magnifying action.
			if(!o.shape || !(o.type in this.overOutEvents) ||
				!("cx" in o) || !("cy" in o)){ return; }

			// if spider deal only with circle
			if(o.element == "spider_plot" || o.element == "spider_poly"){
				return;
			}

			var run = this.plot.series.indexOf(o.run), index = o.index, vector = [], anim, init, scale;

			if(run in this.anim){
				anim = this.anim[run][index];
			}else{
				this.anim[run] = {};
			}

			if(anim){
				anim.action.stop(true);
			}else{
				this.anim[run][index] = anim = {};
			}

			if(o.type == "onmouseover"){
				init  = m.identity;
				scale = this.scale;
			}else{
				init  = m.scaleAt(this.scale, o.cx, o.cy);
				scale = 1 / this.scale;
			}

			var kwArgs = {
				shape:    o.shape,
				duration: this.duration,
				easing:   this.easing,
				transform: [
					{name: "scaleAt", start: [1, o.cx, o.cy], end: [scale, o.cx, o.cy]},
					init
				]
			};
			if(o.shape){
				vector.push(gf.animateTransform(kwArgs));
			}
			if(o.outline){
				kwArgs.shape = o.outline;
				vector.push(gf.animateTransform(kwArgs));
			}
			if(o.shadow){
				kwArgs.shape = o.shadow;
				vector.push(gf.animateTransform(kwArgs));
			}

			if(!vector.length){
				delete this.anim[run][index];
				return;
			}

			anim.action = df.combine(vector);
			if(o.type == "onmouseout"){
				Hub.connect(anim.action, "onEnd", this, function(){
					if(this.anim[run]){
						delete this.anim[run][index];
					}
				});
			}
			anim.action.play();
		}
	});
	
});
