define(["dojo/_base/lang", "dojo/_base/declare", "dojo/Evented"],
	function(lang, declare, Evented){

	return declare(Evented, {
		// summary:
		//		Base action class for plot and chart actions.
	
		constructor: function(chart, plot){
			// summary:
			//		Create a new base action.  This can either be a plot or a chart action.
			// chart: dcharting/Chart
			//		The chart this action applies to.
			// plot: String|dcharting/plot2d/Base?
			//		Optional target plot for this action.  Default is "default".
			this.chart = chart;
			this.plot = plot ? (lang.isString(plot) ? this.chart.getPlot(plot) : plot) : this.chart.getPlot("default");
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
