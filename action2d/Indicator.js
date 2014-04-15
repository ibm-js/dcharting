define(["dojo/_base/declare", "dpointer/events", "./ChartAction", "./_IndicatorElement"],
	function(declare, events, ChartAction, IndicatorElement){
	return declare(ChartAction, {
		// summary:
		//		Create a pointer indicator action. You can point over the chart to display a data indicator.

		// series: String
		//		Target series name for this action.
		series: "",
		// autoScroll: Boolean?
		//		Whether when moving indicator the chart is automatically scrolled. Default is true.
		autoScroll: true,
		// dualIndicator: Boolean?
		//		Whether when using two pointer points a dual indicator is displayed or not. Default is false.
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
		//		`secondDataPoint` is only useful for dual pointer indicators not single indicators.
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
		// pointerOver: Boolean?
		//		Whether the single indicator is starting with a pointerdown event or straight with a pointermove
		onDown: true,

		constructor: function(chart, plot, params){
			// summary:
			//		Create a new indicator action and connect it.
			// chart: dcharting/Chart
			//		The chart this action applies to.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			this._listeners = this.onDown ? [{eventName: "pointerdown", methodName: "pointerDownHandler"}] :[];
			this._listeners = this._listeners.concat([
				{eventName: "pointermove", methodName: "pointerMoveHandler"},
				{eventName: "pointerup", methodName: "pointerUpHandler"},
				{eventName: "pointercancel", methodName: "pointerUpHandler"}
			]);
			this._pInfo = [];
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
				this.pointerUpHandler();
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

		pointerDownHandler: function(event){
			// summary:
			//		Called when pointer is down on the chart.
			if(!this._pInfo[0]){
				this._pInfo[0] = {
					id: event.pointerId,
					x: event.pageX,
					y: event.pageY
				};
				// ensure we always receive events for this pointer event
				events.setPointerCapture(event.target, event.pointerId);
				this._singlePointer(this._pInfo[0].x, this._pInfo[0].y, true);
			}else if(this.dualIndicator && !this._pInfo[1]){
				this._pInfo[1] = {
					id: event.pointerId,
					x: event.pageX,
					y: event.pageY
				};
				// ensure we always receive events for this pointer event
				events.setPointerCapture(event.target, event.pointerId);
				this._dualPointer(this._pInfo[0].x, this._pInfo[0].y,this._pInfo[1].x, this._pInfo[1].y);
			}
			return false;
		},

		pointerMoveHandler: function(event){
			// summary:
			//		Called when pointer is moved on the chart.
			if(!this._pInfo[0] && !this.onDown){
				this._pInfo[0] = {
					id: event.pointerId,
					x: event.pageX,
					y: event.pageY
				};
			}
			if (this._pInfo[0] && event.pointerId == this._pInfo[0].id) {
				this._pInfo[0].x = event.pageX;
				this._pInfo[0].y = event.pageY;
			} else {
				if (this.dualIndicator && this._pInfo[1]  && (event.pointerId == this._pInfo[1].id)) {
					this._pInfo[1].x = event.pageX;
					this._pInfo[1].y = event.pageY;
				}
			}
			if (this._pInfo[0] && this._pInfo[1]) {
				this._dualPointer(this._pInfo[0].x, this._pInfo[0].y, this._pInfo[1].x, this._pInfo[1].y);
			} else if (this._pInfo[0]) {
				this._singlePointer(this._pInfo[0].x, this._pInfo[0].y);
			}
		},

		_singlePointer: function(x, y, delayed){
			if(this.chart._delayedRenderHandle && !delayed){
				// we have pending rendering from a previous call, let's sync
				this.chart.render();
			}
			var plot = this._uPlot;
			plot.pageCoord  = {x: x, y: y};
			plot.dirty = true;
			if(delayed){
				this.chart.delayedRender();
			}else{
				this.chart.render();
			}
		},

		_dualPointer: function(event, x1, y1, x2, y2){
			// sync
			if(this.chart._delayedRenderHandle){
				// we have pending rendering from a previous call, let's sync
				this.chart.render();
			}
			var plot = this._uPlot;
			plot.pageCoord = {x: x1, y: y1};
			plot.secondCoord = {x: x2, y: y2};
			plot.dirty = true;
			this.chart.render();
			event.preventDefault();
			event.stopPropagation();
		},

		pointerUpHandler: function(){
			// summary:
			//		Called when pointer is up or canceled on the chart.
			var plot = this._uPlot;
			if (event.pointerId == this._pInfo[0].id) {
				this._pInfo.splice(0, 1);
				if (this._pInfo.length == 0) {
					plot.pageCoord = null;
					plot.stopTrack();
				} else {
					plot.pageCoord = plot.secondCoord;
					this.secondCoord = null;
				}
			} else if (this.pointerId == this._pInfo[1].id) {
				this._pInfo.splice(1, 1);
			}
			plot.dirty = true;
			this.chart.delayedRender();
		}
	});
});
