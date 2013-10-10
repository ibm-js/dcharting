define(["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/window", "dojo/sniff",
	"./ChartAction", "./_IndicatorElement", "dojo/_base/event", "dojo/_base/array"],
	function(lang, declare, hub, win, has, ChartAction, IndicatorElement, eventUtil, arr){

	return declare(ChartAction, {
		// summary:
		//		Create a mouse indicator action. You can drag mouse over the chart to display a data indicator.

		// series: dcharting/Series
		//		Target series name for this action.
		series: null,
		// autoScroll: Boolean?
		//		Whether when moving indicator the chart is automatically scrolled. Default is true.
		autoScroll: true,
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
		// mouseOver: Boolean?
		//		Whether the mouse indicator is enabled on mouse over or on mouse drag. Default is false.
		mouseOver: false,

		constructor: function(chart, plot, params){
			// summary:
			//		Create an mouse indicator action and connect it.
			// chart: dcharting/Chart
			//		The chart this action applies to.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			this._listeners = this.mouseOver?[{eventName: "onmousemove", methodName: "onMouseMove"}]:
				[{eventName: "onmousedown", methodName: "onMouseDown"}];
			this._handles = [];
			this.connect();
		},
		
		_disconnectHandles: function(){
			if(has("ie")){
				this.chart.domNode.releaseCapture();
			}
			arr.forEach(this._handles, hub.disconnect);
			this._handles = [];
		},

		connect: function(){
			// summary:
			//		Connect this action to the chart. This adds a indicator plot
			//		to the chart that's why Chart.render() must be called after connect.
			this.inherited(arguments);
			// add plot with unique name
			this.chart.addPlot(this._uPlot = new IndicatorElement({ inter: this }));
		},

		disconnect: function(){
			// summary:
			//		Disconnect this action from the chart.
			if(this._isMouseDown){
				this.onMouseUp();
			}
			this.chart.removePlot(this._uPlot);
			this.inherited(arguments);
			this._disconnectHandles();
		},

		onChange: function(event){
			// summary:
			//		Called when the indicator value changed.
			// event:
			//		An event with a start property containing the {x, y} data points of the mouse indicator. It also
			// 		contains a label property containing the displayed text.
		},

		onMouseDown: function(event){
			// summary:
			//		Called when mouse is down on the chart.
			this._isMouseDown = true;
			
			// we now want to capture mouse move events everywhere to avoid
			// stop scrolling when going out of the chart window
			if(has("ie")){
				this._handles.push(hub.connect(this.chart.domNode, "onmousemove", this, "onMouseMove"));
				this._handles.push(hub.connect(this.chart.domNode, "onmouseup", this, "onMouseUp"));
				this.chart.domNode.setCapture();
			}else{
				this._handles.push(hub.connect(win.doc, "onmousemove", this, "onMouseMove"));
				this._handles.push(hub.connect(win.doc, "onmouseup", this, "onMouseUp"));
			}	
			
			this._onMouseSingle(event);
		},

		onMouseMove: function(event){
			// summary:
			//		Called when the mouse is moved on the chart.
			if(this._isMouseDown || this.mouseOver){
				this._onMouseSingle(event);
			}
		},

		_onMouseSingle: function(event){
			var plot = this._uPlot;
			plot.pageCoord  = {x: event.pageX, y: event.pageY};
			plot.dirty = true;
			this.chart.render();
			eventUtil.stop(event);
		},

		onMouseUp: function(event){
			// summary:
			//		Called when mouse is up on the chart.
			var plot = this._uPlot;
			plot.stopTrack();
			this._isMouseDown = false;
			this._disconnectHandles();
			plot.pageCoord = null;
			plot.dirty = true;
			this.chart.render();
		}
	});
});
