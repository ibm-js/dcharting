define(["dojo/_base/connect", "dojo/_base/declare", "./Base", "dojo/fx/easing"],
	function(hub, declare, Base, dfe){

	return declare(Base, {
		// summary:
		//		Base action class for plot actions.

		// duration: Number?
		//		The duration of the action in milliseconds. Default is 400.
		duration: 400,
		// easing: dojox/fx/easing/*?
		//		An easing object (see dojo/fx/easing) for use in an animation.  The
		//		default is dojo/fx/easing/backOut.
		easing:   dfe.backOut,

		overOutEvents: {onmouseover: 1, onmouseout: 1},

		constructor: function(chart, plot, params){
			// summary:
			//		Create a new base PlotAction.
			// chart: dcharting/Chart
			//		The chart this action applies to.
			// plot: String?
			//		The name of the plot this action belongs to.  If none is passed "default" is assumed.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			this.anim = {};
		},

		connect: function(){
			// summary:
			//		Connect this action to the given plot.
			this.handle = this.plot.connect(this, "process");
		},

		disconnect: function(){
			// summary:
			//		Disconnect this action from the given plot, if connected.
			if(this.handle){
				hub.disconnect(this.handle);
				this.handle = null;
			}
		},

		reset: function(){
			// summary:
			//		Reset the action.
		},

		destroy: function(){
			// summary:
			//		Do any cleanup needed when destroying parent elements.
			this.inherited(arguments);
			for (var k in this.anim) {
				for (var l in this.anim[k]) {
					this.anim[k][l].stop(true);
				}
			}
			this.anim = {};
		}
	});
});
