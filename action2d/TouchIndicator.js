define(["dojo/_base/declare", "dojo/_base/event", "dojo/touch", "./ChartAction", "./_IndicatorElement"],
	function(declare, eventUtil, touch, ChartAction, IndicatorElement){
	return declare(ChartAction, {
		// summary:
		//		Create a touch indicator action. You can touch over the chart to display a data indicator.

		// series: String
		//		Target series name for this action.
		series: "",
		// autoScroll: Boolean?
		//		Whether when moving indicator the chart is automatically scrolled. Default is true.
		autoScroll: true,
		// dualIndicator: Boolean?
		//		Whether when using two touch points a dual indicator is displayed or not. Default is false.
		dualIndicator: false,
		// lines: Boolean?
		//		Whether the indicator lines are visible or not. Default is true.
		lines: true,
		// labels: Boolean?
		//		Whether the indicator label is visible or not. Default is true.
		labels: true,
		// markers: Boolean?
		//		Whether the indicator markers are visible or not. Default is true.
		markers: true,
		// offset: {x, y}?
		//		A pair of (x, y) pixel coordinate to specify the offset between the end of the indicator line and the
		//		position at which the labels are rendered. Default is no offset which means it is automatically computed.
		offset: null,
		// start: Boolean?
		//		Whether the label is rendered at the start or end of the indicator. Default is false meaning end of
		//		the line.
		start: false,
		// vertical: Boolean?
		//		Whether the indicator is vertical or not. Default is true.
		vertical: true,
		// fixed: Boolean?
		//		Whether a fixed precision must be applied to data values for display. Default is true.
		fixed: true,
		// precision: Number?
		//		The precision at which to round data values for display. Default is 0.
		precision: 0,
		// lineStroke: dojo/gfx/Stroke?
		//		An optional stroke to use for indicator line.
		lineStroke: undefined,
		// lineOutline: dojo/gfx/Stroke?
		//		An optional outline to use for indicator line.
		lineOutline: undefined,
		// lineShadow: dojo/gfx/Stroke?
		//		An optional shadow to use for indicator line.
		lineShadow: undefined,
		// stroke: dojox/gfx/Stroke?
		//		An optional stroke to use for indicator label background.
		stroke: undefined,
		// outline: dojox/gfx/Stroke?
		//		An optional outline to use for indicator label background.
		outline: undefined,
		// shadow: dojox/gfx/Stroke?
		//		An optional shadow to use for indicator label background.
		shadow: undefined,
		// fill: dojox/gfx/Fill?
		//		An optional fill to use for indicator label background.
		fill: undefined,
		// fillFunc: Function?
		//		An optional function to use to compute label background fill. It takes precedence over
		//		fill property when available.
		fillFunc:  null,
		// labelFunc: Function?
		//		An optional function to use to compute label text. It takes precedence over
		//		the default text when available.
		//	|		function labelFunc(firstDataPoint, secondDataPoint, fixed, precision) {}
		//		`firstDataPoint` is the `{x, y}` data coordinates pointed by the mouse.
		//		`secondDataPoint` is only useful for dual touch indicators not mouse indicators.
		//		`fixed` is true if fixed precision must be applied.
		//		`precision` is the requested precision to be applied.
		labelFunc: null,
		// font: String?
		//		A font definition to use for indicator label background.
		font:		null,
		// fontColor: String|dojo.Color?
		//		The color to use for indicator label background.
		fontColor:	null,
		// markerStroke: dojox/gfx/Stroke?
		//		An optional stroke to use for indicator marker.
		markerStroke: undefined,
		// markerOutline: dojox/gfx/Stroke?
		//		An optional outline to use for indicator marker.
		markerOutline: undefined,
		// markerShadow: dojox/gfx/Stroke?
		//		An optional shadow to use for indicator marker.
		markerShadow: undefined,
		//, markerFill: dojox/gfx/Fill?
		//		An optional fill to use for indicator marker.
		markerFill: undefined,
		// markerSymbol: String?
		//		An optional symbol string to use for indicator marker.
		markerSymbol: undefined,

		constructor: function(chart, plot, params){
			// summary:
			//		Create a new touch indicator action and connect it.
			// chart: dcharting/Chart
			//		The chart this action applies to.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			this._listeners = [
				{eventName: touch.press, methodName: "onTouchStart"},
				{eventName: touch.move, methodName: "onTouchMove"},
				{eventName: touch.release, methodName: "onTouchEnd"},
				{eventName: touch.cancel, methodName: "onTouchEnd"}
			];
			this.connect();
		},
		
		connect: function(){
			// summary:
			//		Connect this action to the chart. This adds a indicator plot
			//		to the chart that's why Chart.render() must be called after connect.
			this.inherited(arguments);
			// add plot with unique name
			this.chart.addPlot(this._uPlot = new IndicatorElement({inter: this}));
		},

		disconnect: function(){
			// summary:
			//		Disconnect this action from the chart.
			var plot = this._uPlot;
			if(plot.pageCoord){
				// we might still have something drawn on the screen
				this.onTouchEnd();
			}
			this.chart.removePlot(this._uPlot);
			this.inherited(arguments);
		},

		onChange: function(event){
			// summary:
			//		Called when the indicator value changed.
			// event:
			//		An event with a start and end properties containing the {x, y} data points of the first and
			//		second (if available) touch indicators. It also contains a label property containing the displayed
			//		text.
		},

		onTouchStart: function(event){
			// summary:
			//		Called when touch is started on the chart.
			if(!event.touches || event.touches.length == 1){
				this._onTouchSingle(event, true);
			}else if(this.dualIndicator && event.touches.length == 2){
				this._onTouchDual(event);
			}
		},

		onTouchMove: function(event){
			// summary:
			//		Called when touch is moved on the chart.
			if(!event.touches || event.touches.length == 1){
				this._onTouchSingle(event);
			}else if(this.dualIndicator && event.touches.length == 2){
				this._onTouchDual(event);
			}
		},

		_onTouchSingle: function(event, delayed){
			if(this.chart._delayedRenderHandle && !delayed){
				// we have pending rendering from a previous call, let's sync
				this.chart.render();
			}
			var plot = this._uPlot;
			plot.pageCoord  = {x: event.touches?event.touches[0].pageX:event.pageX, y: event.touches?event.touches[0].pageY:event.pageY};
			plot.dirty = true;
			if(delayed){
				this.chart.delayedRender();
			}else{
				this.chart.render();
			}
			eventUtil.stop(event);
		},
		
		_onTouchDual: function(event){
			// sync
			if(this.chart._delayedRenderHandle){
				// we have pending rendering from a previous call, let's sync
				this.chart.render();
			}
			var plot = this._uPlot;
			plot.pageCoord = {x: event.touches[0].pageX, y: event.touches[0].pageY};
			plot.secondCoord = {x: event.touches[1].pageX, y: event.touches[1].pageY};
			plot.dirty = true;
			this.chart.render();
			eventUtil.stop(event);
		},

		onTouchEnd: function(event){
			// summary:
			//		Called when touch is ended or canceled on the chart.
			var plot = this._uPlot;
			plot.stopTrack();
			plot.pageCoord = null;
			plot.secondCoord = null;
			plot.dirty = true;
			this.chart.delayedRender();
		}
	});
});
