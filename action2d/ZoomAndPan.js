define(["dojo/_base/lang", "dojo/_base/connect", "dojo/_base/declare", "dojo/sniff",
	"./ChartAction", "../Element", "dpointer/events", "../plot2d/common"],
	function(lang, hub, declare, has, ChartAction, Element, events, common){

	var sUnit = 120;
	var keyTests = {
		none: function(event){
			return !event.ctrlKey && !event.altKey && !event.shiftKey;
		},
		ctrl: function(event){
			return event.ctrlKey && !event.altKey && !event.shiftKey;
		},
		alt: function(event){
			return !event.ctrlKey && event.altKey && !event.shiftKey;
		},
		shift: function(event){
			return !event.ctrlKey && !event.altKey && event.shiftKey;
		}
	};

	var GlassView = declare(Element, {
		// summary:
		//		Private internal class used by ZoomAndPan actions.
		// tags:
		//		private
		constructor: function(chart){
		},
		render: function(){
			if(!this.isDirty()){
				return;
			}
			this.cleanGroup();
			this.group.createRect({width: this.chart.dim.width, height: this.chart.dim.height}).setFill("rgba(0,0,0,0)");
		},
		clear: function(){
			// summary:
			//		Clear out any parameters set on this plot.
			// returns: GlassView
			//		The reference to this plot for functional chaining.
			this.dirty = true;
			// glass view needs to be above
			if(this.chart.plots[this.chart.plots.length - 1] != this){
				this.chart.movePlotToFront(this);
			}
			return this;	//	GlassView
		},
		getSeriesStats: function(){
			// summary:
			//		Returns default stats (irrelevant for this type of plot).
			// returns: Object
			//		{hmin, hmax, vmin, vmax} min/max in both directions.
			return lang.delegate(common.defaultStats);
		},
		initializeScalers: function(){
			// summary:
			//		Does nothing (irrelevant for this type of plot).
			return this;
		},
		isDirty: function(){
			// summary:
			//		Return whether or not this plot needs to be redrawn.
			// returns: Boolean
			//		If this plot needs to be rendered, this will return true.
			return this.dirty;
		}
	});

	return declare(ChartAction, {
		// summary:
		//		Create a pointer zoom and pan action.
		//		You can zoom out or in the data window with pinch and spread gestures or using mouse wheel.
		// 		You can scroll using drag gesture.
		//		This is possible to navigate between a fit window and a zoom one using double click/tap gesture.
		//

		// axis: String?
		//		Target axis name for this action.  Default is "x".
		axis: "x",
		// scaleFactor: Number?
		//		The scale factor applied on mouse wheel zoom.  Default is 1.2.
		scaleFactor: 1.2,
		// maxScale: Number?
		//		The max scale factor accepted by this chart action.  Default is 100.
		maxScale: 100,
		// enableScroll: Boolean?
		//		Whether drag gesture should scroll the chart.  Default is true.
		enableScroll: true,
		// enableZoom: Boolean?
		//		Whether touch pinch and spread gesture as well as using the mouse wheel should zoom out or in the chart.  Default is true.
		enableZoom: true,
		// enableDoubleClickZoom: Boolean?
		//		Whether a double click gesture should toggle between fit and zoom on the chart.  Default is true.
		enableDoubleClickZoom: true,
		// enableKeyZoom: Boolean?
		//		Whether a keyZoomModifier + + or keyZoomModifier + - key press should zoom in our out on the chart.  Default is true.
		enableKeyZoom: true,
		// keyZoomModifier: String?
		//		Which keyboard modifier should used for keyboard zoom in and out. This should be one of "alt", "ctrl", "shift" or "none" for no m
		keyZoomModifier: "ctrl",

		constructor: function(chart, plot, params){
			// summary:
			//		Create a new zoom and pan action and connect it.
			// chart: dcharting/Chart
			//		The chart this action applies to.
			// params: Object|null
			//		Hash of initialization parameters for the action.
			//		The hash can contain any of the action's properties, excluding read-only properties.
			this._listeners = [
				{eventName: "pointerdown", methodName: "pointerDownHandler"}
			];
			if(this.enableZoom) {
				this._listeners.push({eventName: "wheel", methodName: "wheelHandler"});
			}
			if(this.enableDoubleClickZoom){
				this._listeners.push({eventName: "dblclick", methodName: "dblClickHandler"});
			}
			if(this.enableKeyZoom){
				this._listeners.push({eventName: "keypress", methodName: "keyPressHandler"});
			}
			this._handles = [];
			this._pInfo = [];
			this.connect();
		},

		connect: function(){
			// summary:
			//		Connect this action to the chart. On iOS this adds a new glass view plot
			//		to the chart that's why Chart.render() must be called after connect.
			this.inherited(arguments);
			// this is needed to workaround issue on iOS Safari + SVG, because a touch down action
			// started above a item that is removed during the touch action will stop
			// dispatching touch events!
			// TODO check if still necessary
			if(this.chart.surface.declaredClass.indexOf("svg")!=-1){
				this.chart.addPlot(this._uPlot = new GlassView());
			}
			if(this.enableKeyZoom){
				// we want to be able to get focus to receive key events 
				this.chart.domNode.tabIndex = 0;
				// if one doesn't want a focus border he can do something like
				// dojo.style(this.chart.domNode, "outline", "none");
			}
		},

		disconnect: function(){
			// summary:
			//		Disconnect this action from the chart.
			if(this.chart.surface.declaredClass.indexOf("svg")!=-1){
				this.chart.removePlot(this._uPlot);
			}
			if(this.enableKeyZoom){
				// we don't need anymore to be able to get focus to receive key events 
				this.chart.domNode.tabIndex = -1;
			}
			this.inherited(arguments);
			this._disconnectHandles();
		},

		_disconnectHandles: function(){
			this._handles.forEach(hub.disconnect);
			this._handles = [];
		},

		pointerDownHandler: function(event){
			// summary:
			//		Called when pointer is own on the chart.

			// we always want to be above regular plots and not clipped
			var chart = this.chart, axis = chart.getAxis(this.axis);
			if((this.enableZoom || this.enableScroll) && chart._delayedRenderHandle){
				// we have pending rendering from a scroll, let's sync
				chart.render();
			}
			this._startPageCoord = {x: event.pageX, y: event.pageY};
			if((this.enableScroll || this.enableZoom) && !this._pInfo[0]) {
				this._pInfo[0] = {
					id: event.pointerId,
					x: event.pageX,
					y: event.pageY
				};
				this._handles.push(hub.connect(this.chart.domNode, "pointerdown", this, "pointerMoveHandler"));
				this._handles.push(hub.connect(this.chart.domNode, "pointerup", this, "pointerEndHandler"));
				// ensure we always receive events for this pointer event
				events.setPointerCapture(event.target, event.pointerId);
				// TODO pass pInfo?
				this._startScroll(axis);
				chart.domNode.focus();
				// needed for Android, otherwise will get a touch cancel while swiping
//				event.preventDefault();
//				event.stopPropagation();
			} else if(this.enableZoom && !this._pInfo[1]) {
				this._pInfo[1] = {
					id: event.pointerId,
					x: event.pageX,
					y: event.pageY
				};
				this._endPageCoord =  {x: event.pageX, y: event.pageY};
				var middlePageCoord = {x: (this._startPageCoord.x + this._endPageCoord.x) / 2,
					y: (this._startPageCoord.y + this._endPageCoord.y) / 2};
				var scaler = axis.getScaler();
				this._initScale = axis.getWindowScale();
				var t = this._initData =  this.plot.toData();
				this._middleCoord = t(middlePageCoord)[this.axis];
				this._startCoord = scaler.bounds.from;
				this._endCoord = scaler.bounds.to;
			}
		},

		pointerMoveHandler: function(event){
			// summary:
			//		Called when pointer is moved on the chart.
			var chart = this.chart, axis = chart.getAxis(this.axis);
			var pAttr = axis.vertical?"pageY":"pageX",
				attr = axis.vertical?"y":"x";
			if (this._pInfo[0] && event.pointerId == this._pInfo[0].id) {
				this._pInfo[0].x = event.pageX;
				this._pInfo[0].y = event.pageY;
			} else {
				if (this.enableZoom && this._pInfo[1]  && (event.pointerId == this._pInfo[1].id)) {
					this._pInfo[1].x = event.pageX;
					this._pInfo[1].y = event.pageY;
				}
			}
			if(this.enableZoom && this._pInfo[0] && this._pInfo[1]){
				var newMiddlePageCoord = {x: (this._pInfo[1].x + this._pInfo[0].x) / 2,
											y: (this._pInfo[1].y + this._pInfo[0].y) / 2};
				var scale = (this._endPageCoord[attr] - this._startPageCoord[attr]) /
					(this._pInfo[1][attr] - this._pInfo[0][attr]);

				if(this._initScale / scale > this.maxScale){
					return;
				}

				var newMiddleCoord = this._initData(newMiddlePageCoord)[this.axis];

				var newStart = scale * (this._startCoord - newMiddleCoord)  + this._middleCoord,
				newEnd = scale * (this._endCoord - newMiddleCoord) + this._middleCoord;
				chart.zoomIn(this.axis, [newStart, newEnd]);
				// avoid browser pan
//				event.preventDefault();
//				event.stopPropagation();
			}else if(this.enableScroll && this._pInfo[0]){
				var delta = this._getDelta(event);
				chart.setAxisWindow(this.axis, this._lastScale, this._initOffset - delta / this._lastFactor / this._lastScale);
				chart.delayedRender();
				// avoid browser pan
//				event.preventDefault();
//				event.stopPropagation();
			}
		},

		pointerEndHandler: function(event){
			// summary:
			//		Called when pointer is up on the chart.
			var chart = this.chart, axis = chart.getAxis(this.axis);
			if (event.pointerId == this._pInfo[0].id) {
				this._pInfo.splice(0, 1);
				if (this.enableScroll && this._pInfo.length == 1) {
					// we are back to 1 pointer, start back scroll mode
					this._startPageCoord = {x: this._pInfo[0].pageX, y: this._pInfo[0].pageY};
					this._startScroll(axis);
				} else if (this._pInfo.length == 0) {
					this._disconnectHandles();
				}
			} else if (this.pointerId == this._pInfo[1].id) {
				this._pInfo.splice(1, 1);
			}
		},

		_startScroll: function(axis){
			var bounds = axis.getScaler().bounds;
			this._initOffset = axis.getWindowOffset();
			// we keep it because of delay rendering we might now always have access to the
			// information to compute it
			this._lastScale = axis.getWindowScale();
			this._lastFactor = bounds.span / (bounds.upper - bounds.lower);
		},

		dblClickHandler: function(event){
			// summary:
			//		Called when double tap is performed on the chart.
			var chart = this.chart, axis = chart.getAxis(this.axis);
			var scale = 1 / this.scaleFactor;
			// are we fit?
			if(axis.getWindowScale()==1){
				// fit => zoom
				var scaler = axis.getScaler(), start = scaler.bounds.from, end = scaler.bounds.to,
				oldMiddle = (start + end) / 2, newMiddle = this.plot.toData(this._startPageCoord)[this.axis],
				newStart = scale * (start - oldMiddle) + newMiddle, newEnd = scale * (end - oldMiddle) + newMiddle;
				chart.zoomIn(this.axis, [newStart, newEnd]);
			}else{
				// non fit => fit
				chart.setAxisWindow(this.axis, 1, 0);
				chart.render();
			}
//			event.preventDefault();
//			event.stopPropagation();
		},

		wheelHandler: function(event){
			// summary:
			//		Called when wheel is used on the chart.
			var scroll = event.deltaY / sUnit;
			this._zoom(scroll, event);
		},

		keyPressHandler: function(event){
			// summary:
			//		Called when a key is pressed on the chart.
			if(keyTests[this.keyZoomModifier](event)){
				if(event.keyChar == "+" || event.keyCode == keys.NUMPAD_PLUS){
					this._zoom(1, event);
				}else if(event.keyChar == "-" || event.keyCode == keys.NUMPAD_MINUS){
					this._zoom(-1, event);
				}
			}
		},

		_zoom: function(scroll, event){
			var scale = (scroll < 0 ? Math.abs(scroll)*this.scaleFactor :
				1 / (Math.abs(scroll)*this.scaleFactor));
			var chart = this.chart, axis = chart.getAxis(this.axis);
			// after wheel reset event position exactly if we could start a new scroll action
			var cscale = axis.getWindowScale();
			if(cscale / scale > this.maxScale){
				return;
			}
			var scaler = axis.getScaler(), start = scaler.bounds.from, end = scaler.bounds.to;
			// keep mouse pointer as transformation center if available otherwise center
			var middle = (event.type == "keypress") ? (start + end) / 2 :
				this.plot.toData({x: event.pageX, y: event.pageY})[this.axis];
			var newStart = scale * (start - middle) + middle, newEnd = scale * (end - middle) + middle;
			chart.zoomIn(this.axis, [newStart, newEnd]);
			// do not scroll browser
//			event.preventDefault();
//			event.stopPropagation();
		},

		_getDelta: function(event){
			var axis = this.chart.getAxis(this.axis),
			    pAttr = axis.vertical?"pageY":"pageX",
				attr = axis.vertical?"y":"x";
			var delta = axis.vertical?(this._startPageCoord[attr] - this._pInfo[0][attr]):
				(this._pInfo[0][attr] - this._startPageCoord[attr]);
			if (has("dojo-bidi")) {
				delta = delta * (this.chart.isRightToLeft()? -1 : 1);
			}
			return delta;
		}
	});
});
