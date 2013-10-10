define(["dojo/_base/connect", "dojo/_base/declare", "./PlotAction", 
	"dojo/fx", "dojo/fx/easing", "dojox/gfx/matrix", "dojox/gfx/fx"], 
	function(hub, declare, PlotAction, df, dfe, m, gf){

	return declare(PlotAction, {
		// summary:
		//		Create a shaking action for use on an element in a chart.

		// shiftX: Number?
		//		The amount in horizontal pixels to shift the plot element.  Default is 3.
		shiftX: 3,

		// shiftY: Number?
		//		The amount in vertical pixels to shift the plot element.  Default is 3.
		shiftY: 3,

		constructor: function(chart, plot, params){
			// summary:
			//		Create the shaking action and connect it to the plot.
			// chart: dcharting/Chart
			//		The chart this action belongs to.
			// plot: String?
			//		The plot this action is attached to.  If not passed, "default" is assumed.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			this.connect();
		},

		process: function(o){
			// summary:
			//		Process the action on the given object.
			// o: dojox/gfx/shape.Shape
			//		The object on which to process the slice moving action.
			if(!o.shape || !(o.type in this.overOutEvents)){ return; }

			var run = this.plot.indexOf(o.run), index = o.index, vector = [], anim;

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

			var kwArgs = {
				shape:     o.shape,
				duration:  this.duration,
				easing:    this.easing,
				transform: [
					{name: "translate", start: [this.shiftX, this.shiftY], end: [0, 0]},
					m.identity
				]
			};
			if(o.shape){
				vector.push(gf.animateTransform(kwArgs));
			}
			if(o.oultine){
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
