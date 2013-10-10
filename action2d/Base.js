define(["dojo/_base/lang", "dojo/_base/declare", "dojo/Evented"],
	function(lang, declare, Evented){

	return declare(Evented, {
		// summary:
		//		Base action class for plot and chart actions.
	
		constructor: function(chart, plot, params){
			// summary:
			//		Create a new base action.  This can either be a plot or a chart action.
			// chart: dcharting/Chart
			//		The chart this action applies to.
			// plot: dcharting/plot2d/Base?
			//		Optional target plot for this action. If not provided use the first plot of the chart.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			this.chart = chart;
			this.plot = plot ? plot : this.chart.plots[0];
			lang.mixin(this, params);
		},
	
		connect: function(){
			// summary:
			//		Connect this action to the plot or the chart.
		},
	
		disconnect: function(){
			// summary:
			//		Disconnect this action from the plot or the chart.
		},
		
		destroy: function(){
			// summary:
			//		Do any cleanup needed when destroying parent elements.
			this.disconnect();
		}
	});

});
