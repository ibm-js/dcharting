define(["dojo/_base/connect", "dojo/_base/declare", "./PlotAction", "dojo/fx/easing", "dojox/gfx/matrix", "dojox/gfx/fx"],
	function(hub, declare, PlotAction, dfe, m, gf){

	return declare(PlotAction, {
		// summary:
		//		Create an action for a pie chart that moves and scales a pie slice.

		// scale: Number?
		//		The amount to scale the pie slice.  Default is 1.05.
		scale: 1.05,
		// shift: Number?
		//		The amount in pixels to shift the pie slice.  Default is 7.
		shift: 7,

		constructor: function(chart, plot, params){
			// summary:
			//		Create the slice moving action and connect it to the plot.
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
			if(!o.shape || o.element != "slice" || !(o.type in this.overOutEvents)){ return; }

			if(!this.angles){
				// calculate the running total of slice angles
				var startAngle = m._degToRad(o.plot.opt.startAngle);
				var sum = 0;
				if(typeof o.run.data[0] === "number"){
					this.angles = o.run.data;
				}else{
					this.angles = o.run.data.map(function(item){
						return item.y;
					});
				}
				this.angles = this.angles.map(function(item){
					var previousSum = sum;
					sum = sum + item;
					return previousSum;
				});
				this.angles = this.angles.map(function(item){
					return (2 * Math.PI * item) / sum + startAngle;
				});
				this.angles.push(2 * Math.PI + startAngle);
			}

			var index = o.index, anim, startScale, endScale, startOffset, endOffset,
				angle = (this.angles[index] + this.angles[index + 1]) / 2,
				rotateTo0  = m.rotateAt(-angle, o.cx, o.cy),
				rotateBack = m.rotateAt( angle, o.cx, o.cy);

			anim = this.anim[0] && this.anim[0][index];

			if(anim){
				anim.action.stop(true);
			}else{
				this.anim[0] = {};
				this.anim[0][index] = anim = {};
			}

			if(o.type == "onmouseover"){
				startOffset = 0;
				endOffset   = this.shift;
				startScale  = 1;
				endScale    = this.scale;
			}else{
				startOffset = this.shift;
				endOffset   = 0;
				startScale  = this.scale;
				endScale    = 1;
			}

			anim.action = gf.animateTransform({
				shape:    o.shape,
				duration: this.duration,
				easing:   this.easing,
				transform: [
					rotateBack,
					{name: "translate", start: [startOffset, 0], end: [endOffset, 0]},
					{name: "scaleAt",   start: [startScale, o.cx, o.cy],  end: [endScale, o.cx, o.cy]},
					rotateTo0
				]
			});

			if(o.type == "onmouseout"){
				hub.connect(anim.action, "onEnd", this, function(){
					delete this.anim[0][index];
				});
			}
			anim.action.play();
		},

		reset: function(){
			delete this.angles;
		}
	});
});
