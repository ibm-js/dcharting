define(["dojo/_base/declare", "dojo/dom-style",
	"dojo/dom", "dojo/dom-geometry", "dojo/dom-construct","dojo/_base/Color", "dojo/sniff", "dijit/_WidgetBase",
	"./Element", "./Theme", "./Series", "./axis2d/common", "dojox/gfx/shape",
	"dojox/gfx", "dojo/has!dojo-bidi?./bidi/Chart"],
	function(declare, domStyle,
	 		 dom, domGeom, domConstruct, Color, has, _WidgetBase,
	 		 Element, Theme, Series, common, shape,
	 		 g, BidiChart){
	/*=====
	var __ChartCtorArgs = {
		// summary:
		//		The keyword arguments that can be passed in a Chart constructor.
		// margins: Object?
		//		Optional margins for the chart, in the form of { l, t, r, b}.
		// stroke: dojox.gfx.Stroke?
		//		An optional outline/stroke for the chart.
		// fill: dojox.gfx.Fill?
		//		An optional fill for the chart.
		// delayInMs: Number
		//		Delay in ms for delayedRender(). Default: 200.
	};
	=====*/

	/*=====
	var __SeriesCtorArgs = {
		// summary:
		//		An optional arguments object that can be used in the Series constructor.
		// plot: String?
		//		The plot (by name) that this series belongs to.
	};
	=====*/

	/*=====
	var __BaseAxisCtorArgs = {
		// summary:
		//		Optional arguments used in the definition of an invisible axis.
		// vertical: Boolean?
		//		A flag that says whether an axis is vertical (i.e. y axis) or horizontal. Default is false (horizontal).
		// min: Number?
		//		The smallest value on an axis. Default is 0.
		// max: Number?
		//		The largest value on an axis. Default is 1.
	};
	=====*/

	var clear = function(item){item.clear()},
		purgeGroup = function(item){item.purgeGroup()},
		destroy = function(item){item.destroy()},
		makeClean = function(item){item.dirty = false},
		makeDirty = function(item){item.dirty = true};

	var Chart = declare(_WidgetBase, {
		// summary:
		//		The main chart object in dcharting.  This will create a two dimensional
		//		chart based on dojox.gfx.
		//
		// description:
		//		dcharting/Chart is the primary object used for any kind of charts.  It
		//		is simple to create--just pass it a node reference, which is used as the
		//		container for the chart--and a set of optional keyword arguments and go.
		//
		//		Note that like most of dojox.gfx, most of dcharting/Chart's methods are
		//		designed to return a reference to the chart itself, to allow for functional
		//		chaining.  This makes defining everything on a Chart very easy to do.
		//
		// example:
		//		Create an area chart, with smoothing.
		//	|	require(["dcharting/Chart", "dcharting/themes/Shrooms", "dcharting/plot2d/Areas", ...],
		// 	|		function(Chart, Shrooms, Areas, ...){
		//	|		new Chart(node)
		//	|			.addPlot("default", { type: Areas, tension: "X" })
		//	|			.setTheme(Shrooms)
		//	|			.addSeries("Series A", [1, 2, 0.5, 1.5, 1, 2.8, 0.4])
		//	|			.addSeries("Series B", [2.6, 1.8, 2, 1, 1.4, 0.7, 2])
		//	|			.addSeries("Series C", [6.3, 1.8, 3, 0.5, 4.4, 2.7, 2])
		//	|			.render();
		//	|	});
		//
		// example:
		//		The form of data in a data series can take a number of forms: a simple array,
		//		an array of objects {x,y}, or something custom (as determined by the plot).
		//		Here's an example of a Candlestick chart, which expects an object of
		//		{ open, high, low, close }.
		//	|	require(["dcharting/Chart", "dcharting/plot2d/Candlesticks", ...],
		// 	|		function(Chart, Candlesticks, ...){
		//	|		new Chart(node)
		//	|			.addPlot("default", {type: Candlesticks, gap: 1})
		//	|			.addAxis("x", {fixLower: "major", fixUpper: "major", includeZero: true})
		//	|			.addAxis("y", {vertical: true, fixLower: "major", fixUpper: "major", natural: true})
		//	|			.addSeries("Series A", [
		//	|					{ open: 20, close: 16, high: 22, low: 8 },
		//	|					{ open: 16, close: 22, high: 26, low: 6, mid: 18 },
		//	|					{ open: 22, close: 18, high: 22, low: 11, mid: 21 },
		//	|					{ open: 18, close: 29, high: 32, low: 14, mid: 27 },
		//	|					{ open: 29, close: 24, high: 29, low: 13, mid: 27 },
		//	|					{ open: 24, close: 8, high: 24, low: 5 },
		//	|					{ open: 8, close: 16, high: 22, low: 2 },
		//	|					{ open: 16, close: 12, high: 19, low: 7 },
		//	|					{ open: 12, close: 20, high: 22, low: 8 },
		//	|					{ open: 20, close: 16, high: 22, low: 8 },
		//	|					{ open: 16, close: 22, high: 26, low: 6, mid: 18 },
		//	|					{ open: 22, close: 18, high: 22, low: 11, mid: 21 },
		//	|					{ open: 18, close: 29, high: 32, low: 14, mid: 27 },
		//	|					{ open: 29, close: 24, high: 29, low: 13, mid: 27 },
		//	|					{ open: 24, close: 8, high: 24, low: 5 },
		//	|					{ open: 8, close: 16, high: 22, low: 2 },
		//	|					{ open: 16, close: 12, high: 19, low: 7 },
		//	|					{ open: 12, close: 20, high: 22, low: 8 },
		//	|					{ open: 20, close: 16, high: 22, low: 8 },
		//	|					{ open: 16, close: 22, high: 26, low: 6 },
		//	|					{ open: 22, close: 18, high: 22, low: 11 },
		//	|					{ open: 18, close: 29, high: 32, low: 14 },
		//	|					{ open: 29, close: 24, high: 29, low: 13 },
		//	|					{ open: 24, close: 8, high: 24, low: 5 },
		//	|					{ open: 8, close: 16, high: 22, low: 2 },
		//	|					{ open: 16, close: 12, high: 19, low: 7 },
		//	|					{ open: 12, close: 20, high: 22, low: 8 },
		//	|					{ open: 20, close: 16, high: 22, low: 8 }
		//	|				],
		//	|				{ stroke: { color: "green" }, fill: "lightgreen" }
		//	|			)
		//	|			.render();
		//	|	});
		
		// theme: dcharting/Theme?
		//		An optional theme to use for styling the chart.
		// axes: dcharting/axis2d/Base{}?
		//		A map of axes for use in plotting a chart.
		// stack: dcharting/plot2d/Base[]
		//		A stack of plotters.
		// plots: dcharting/plot2d/Base{}
		//		A map of plotter indices
		// series: dcharting/Series[]
		//		The stack of data runs used to create plots.
		// runs: dcharting/Series{}
		//		A map of series indices
		// margins: Object?
		//		The margins around the chart. Default is { l:10, t:10, r:10, b:10 }.
		// stroke: dojox.gfx.Stroke?
		//		The outline of the chart (stroke in vector graphics terms).
		// fill: dojox.gfx.Fill?
		//		The color for the chart.
		// node: DOMNode
		//		The container node passed to the constructor.
		// surface: dojox/gfx/shape.Surface
		//		The main graphics surface upon which a chart is drawn.
		// dirty: Boolean
		//		A boolean flag indicating whether or not the chart needs to be updated/re-rendered.
		// htmlLabels: Boolean
		//		A boolean flag indicating whether or not it should try to use HTML-based labels for the title or not.
		//		The default is true.  The only caveat is IE and Opera browsers will always use GFX-based labels.

		constructor: function(/* __ChartCtorArgs? */kwArgs){
			// summary:
			//		The constructor for a new Chart.  Initializes all parameters used for a chart.
			// returns: dcharting/Chart
			//		The newly created chart.

			// initialize parameters
			// TODO: should be done by standard _WidgetBase mechanism...
			if(!kwArgs){ kwArgs = {}; }
			this.margins   = kwArgs.margins ? kwArgs.margins : {l: 10, t: 10, r: 10, b: 10};
			this.stroke    = kwArgs.stroke;
			this.fill      = kwArgs.fill;
			this.delayInMs = kwArgs.delayInMs || 200;
			this.title     = kwArgs.title;
			this.titleGap  = kwArgs.titleGap;
			this.titlePos  = kwArgs.titlePos;
			this.titleFont = kwArgs.titleFont;
			this.titleFontColor = kwArgs.titleFontColor;
			this.chartTitle = null;
			this.htmlLabels = true;
			if("htmlLabels" in kwArgs){
				this.htmlLabels = kwArgs.htmlLabels;
			}

			// default initialization
			this.theme = null;
			this.axes = {};		// map of axes
			this.plots = [];	// stack of plotters
			this.series = [];	// stack of data runs
			this.dirty = true;
		},
		buildRendering: function(){
			this.inherited(arguments);
			// create a surface
			var box = domGeom.getMarginBox(this.domNode);
			this.surface = g.createSurface(this.domNode, box.w || 400, box.h || 300);
			if(this.surface.declaredClass.indexOf("vml") == -1){
				// except if vml use native clipping
				this._nativeClip = true;
			}
		},
		startup: function(){
			this.render();
		},
		destroy: function(){
			// summary:
			//		Cleanup when a chart is to be destroyed.
			// returns: void
			this.series.forEach(destroy);
			this.series.forEach(destroy);
			for(var axis in this.axes){
				this.axes[axis].destroy();
			}
			this.surface.destroy();
			if(this.chartTitle && this.chartTitle.tagName){
				// destroy title if it is a DOM node
				domConstruct.destroy(this.chartTitle);
			}
		},
		getCoords: function(){
			// summary:
			//		Get the coordinates and dimensions of the containing DOMNode, as
			//		returned by dojo.coords.
			// returns: Object
			//		The resulting coordinates of the chart.  See dojo.coords for details.
			var node = this.domNode;
			var s = domStyle.getComputedStyle(node), coords = domGeom.getMarginBox(node, s);
			var abs = domGeom.position(node, true);
			coords.x = abs.x;
			coords.y = abs.y;
			return coords;	//	Object
		},
		_setThemeAttr: function(theme){
			// summary:
			//		Set a theme of the chart.
			// theme: dcharting/Theme
			//		The theme to be used for visual rendering.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			this._set("theme", theme.clone());
			this.dirty = true;
			return this;	//	dcharting/Chart
		},
		addAxis: function(name, axis){
			// summary:
			//		Add an axis to the chart, for rendering.
			// name: String
			//		The name of the axis.
			// kwArgs: __BaseAxisCtorArgs?
			//		An optional keyword arguments object for use in defining details of an axis.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			axis.name = name;
			axis.chart = this;
			axis.dirty = true;
			this.axes[name] = axis;
			this.dirty = true;
			return this;	//	dcharting/Chart
		},
		getAxis: function(name){
			// summary:
			//		Get the given axis, by name.
			// name: String
			//		The name the axis was defined by.
			// returns: dcharting/axis2d/Default
			//		The axis as stored in the chart's axis map.
			return this.axes[name];	//	dcharting/axis2d/Default
		},
		removeAxis: function(name){
			// summary:
			//		Remove the axis that was defined using name.
			// name: String
			//		The axis name, as defined in addAxis.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.axes){
				// destroy the axis
				this.axes[name].destroy();
				delete this.axes[name];
				// mark the chart as dirty
				this.dirty = true;
			}
			return this;	//	dcharting/Chart
		},
		addPlot: function(plot){
			// summary:
			//		Add a new plot to the chart, defined by name and using the optional keyword arguments object.
			//		Note that dcharting assumes the main plot to be called "default"; if you do not have
			//		a plot called "default" and attempt to add data series to the chart without specifying the
			//		plot to be rendered on, you WILL get errors.
			// name: String
			//		The name of the plot to be added to the chart.  If you only plan on using one plot, call it "default".
			// kwArgs: dcharting/plot2d/__PlotCtorArgs
			//		An object with optional parameters for the plot in question.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			plot.dirty = true;
			plot.chart = this;
			this.plots.push(plot);
			this.dirty = true;
			return this;	//	dcharting/Chart
		},
		removePlot: function(plot){
			// summary:
			//		Remove the plot defined using name from the chart's plot stack.
			// name: String
			//		The name of the plot as defined using addPlot.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
				// get the index and remove the name
			var index = this.plots.indexOf(plot);
			if(index != -1){
				// destroy the plot
				plot.destroy();
				// remove the plot from the stack
				this.plots.splice(index, 1);
				// remove all related series
				var ns = this.series.filter(function(run){ return run.plot != plot; });
				if(ns.length < this.series.length){
					// kill all removed series
					this.series.forEach(function(run){
						if(run.plot == plot){
							run.destroy();
						}
					});
					this.series = ns;
				}
				// mark the chart as dirty
				this.dirty = true;
			}
			return this;	//	dcharting/Chart
		},
		getPlotOrder: function(){
			// summary:
			//		Returns an array of plot names in the current order
			//		(the top-most plot is the first).
			// returns: Array
			return this.plots;
		},
		setPlotOrder: function(newOrder){
			// summary:
			//		Sets new order of plots. newOrder cannot add or remove
			//		plots. Wrong names, or dups are ignored.
			// newOrder: Array
			//		Array of plot names compatible with getPlotOrder().
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			this.plots = newOrder;
			this.dirty = true;
			return this;	//	dcharting/Chart
		},
		movePlotToFront: function(plot){
			// summary:
			//		Moves a given plot to front.
			// name: String
			//		Plot's name to move.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			var index = this.plots.indexOf(plot);
			if(index != -1){
				var newOrder = this.getPlotOrder();
				newOrder.splice(index, 1);
				newOrder.unshift(plot);
				return this.setPlotOrder(newOrder);	//	dcharting/Chart
			}
			return this;	//	dcharting/Chart
		},
		movePlotToBack: function(plot){
			// summary:
			//		Moves a given plot to back.
			// name: String
			//		Plot's name to move.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			var index = this.plots.indexOf(plot);
			if(index != -1){
				var newOrder = this.getPlotOrder();
				newOrder.splice(index, 1);
				newOrder.push(plot);
				return this.setPlotOrder(newOrder);	//	dcharting/Chart
			}
			return this;	//	dcharting/Chart
		},
		addSeries: function(series){
			// summary:
			//		Add a data series to the chart for rendering.
			// series: Series
			//		The data series
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			series.chart = this;
			this.series.push(series);
			this.dirty = true;
			// fix min/max
			if(!("ymin" in series) && "min" in series){ series.ymin = series.min; }
			if(!("ymax" in series) && "max" in series){ series.ymax = series.max; }
			return this;	//	dcharting/Chart
		},
		removeSeries: function(series){
			// summary:
			//		Remove the series defined by name from the chart.
			// name: String
			//		The name of the series as defined by addSeries.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			var index = this.series.indexOf(series);
			if(index != -1){
				// destroy the run
				series.destroy();
				// remove the run from the stack of series
				this.series.splice(index, 1);
				this.dirty = true;
			}
			return this;	//	dcharting/Chart
		},
		updateSeries: function(series, data, offsets){
			// summary:
			//		Update the given series with a new set of 	data points.
			// name: String
			//		The name of the series as defined in addSeries.
			// data: Array|Object
			//		The array of data points (either numbers or objects) that
			//		represents the data to be drawn. Or it can be an object. In
			//		the latter case, it should have a property "data" (an array),
			//		destroy(), and setSeriesObject().
			// offsets: Boolean?
			//		If true recomputes the offsets of the chart based on the new
			//		data. This is useful if the range of data is drastically changing
			//		and offsets need to be recomputed.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			var index = this.series.indexOf(series);
			if(index != -1){
				series.update(data);
				if(offsets){
					this.dirty = true;
				}else{
					this._invalidateDependentPlots(series.plot, false);
					this._invalidateDependentPlots(series.plot, true);
				}
			}
			return this;	//	dcharting/Chart
		},
		getSeriesOrder: function(plotName){
			// summary:
			//		Returns an array of series names in the current order
			//		(the top-most series is the first) within a plot.
			// plotName: String
			//		Plot's name.
			// returns: Array
			return this.series;
		},
		setSeriesOrder: function(newOrder){
			// summary:
			//		Sets new order of series within a plot. newOrder cannot add
			//		or remove series. Wrong names, or dups are ignored.
			// newOrder: Array
			//		Array of series names compatible with getPlotOrder(). All
			//		series should belong to the same plot.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			this.series = newOrder;
			this.dirty = true;
			return this;	//	dcharting/Chart
		},
		moveSeriesToFront: function(name){
			// summary:
			//		Moves a given series to front of a plot.
			// name: String
			//		Series' name to move.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.runs){
				var index = this.runs[name],
					newOrder = this.getSeriesOrder(this.series[index].plot);
				if(name != newOrder[0]){
					newOrder.splice(index, 1);
					newOrder.unshift(name);
					return this.setSeriesOrder(newOrder);	//	dcharting/Chart
				}
			}
			return this;	//	dcharting/Chart
		},
		moveSeriesToBack: function(name){
			// summary:
			//		Moves a given series to back of a plot.
			// name: String
			//		Series' name to move.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			if(name in this.runs){
				var index = this.runs[name],
					newOrder = this.getSeriesOrder(this.series[index].plot);
				if(name != newOrder[newOrder.length - 1]){
					newOrder.splice(index, 1);
					newOrder.push(name);
					return this.setSeriesOrder(newOrder);	//	dcharting/Chart
				}
			}
			return this;	//	dcharting/Chart
		},
		resize: function(width, height){
			// summary:
			//		Resize the chart to the dimensions of width and height.
			// description:
			//		Resize the chart and its surface to the width and height dimensions.
			//		If a single argument of the form {w: value1, h: value2} is provided take that argument as the dimensions to use.
			//		Finally if no argument is provided, resize the surface to the marginBox of the chart.
			// width: Number|Object?
			//		The new width of the chart or the box definition.
			// height: Number?
			//		The new height of the chart.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			switch(arguments.length){
				// case 0, do not resize the div, just the surface
				case 1:
					// argument, override node box
					domGeom.setMarginBox(this.domNode, width);
					break;
				case 2:
					// argument, override node box
					domGeom.setMarginBox(this.domNode, {w: width, h: height});
					break;
			}
			// in all cases take back the computed box
			var box = domGeom.getMarginBox(this.domNode);
			var d = this.surface.getDimensions();
			if(d.width != box.w || d.height != box.h){
				// and set it on the surface
				this.surface.setDimensions(box.w, box.h);
				this.dirty = true;
				return this.render();	//	dcharting/Chart
			}else{
				return this;
			}
		},
		getGeometry: function(){
			// summary:
			//		Returns a map of information about all axes in a chart and what they represent
			//		in terms of scaling (see dcharting/axis2d/Default.getScaler).
			// returns: Object
			//		An map of geometry objects, a one-to-one mapping of axes.
			var ret = {}, axis;
			for(var k in this.axes){
				axis = this.axes[k];
				if(axis.initialized()){
					ret[axis.name] = {
						name:		axis.name,
						vertical:	axis.vertical,
						scaler:		axis.scaler,
						ticks:		axis.ticks
					};
				}
			}
			return ret;	//	Object
		},
		setAxisWindow: function(name, scale, offset, zoom){
			// summary:
			//		Zooms an axis and all dependent plots. Can be used to zoom in 1D.
			// name: String
			//		The name of the axis as defined by addAxis.
			// scale: Number
			//		The scale on the target axis.
			// offset: Number
			//		Any offest, as measured by axis tick
			// zoom: Boolean|Object?
			//		The chart zooming animation trigger.  This is null by default,
			//		e.g. {duration: 1200}, or just set true.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			var axis = this.axes[name];
			if(axis){
				axis.setWindow(scale, offset);
				this.plots.forEach(function(plot){
					if(plot.hAxis == name || plot.vAxis == name){
						plot.zoom = zoom;
					}
				});
			}
			return this;	//	dcharting/Chart
		},
		setWindow: function(sx, sy, dx, dy, zoom){
			// summary:
			//		Zooms in or out any plots in two dimensions.
			// sx: Number
			//		The scale for the x axis.
			// sy: Number
			//		The scale for the y axis.
			// dx: Number
			//		The pixel offset on the x axis.
			// dy: Number
			//		The pixel offset on the y axis.
			// zoom: Boolean|Object?
			//		The chart zooming animation trigger.  This is null by default,
			//		e.g. {duration: 1200}, or just set true.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			if(!("plotArea" in this)){
				this.calculateGeometry();
			}
			var axis;
			for(var k in this.axes){
				var scale, offset, bounds = axis.getScaler().bounds,
					s = bounds.span / (bounds.upper - bounds.lower);
				axis = this.axes[k];
				if(axis.vertical){
					scale  = sy;
					offset = dy / s / scale;
				}else{
					scale  = sx;
					offset = dx / s / scale;
				}
				axis.setWindow(scale, offset);
			}
			this.plots.forEach(function(plot){ plot.zoom = zoom; });
			return this;	//	dcharting/Chart
		},
		zoomIn:	function(name, range, delayed){
			// summary:
			//		Zoom the chart to a specific range on one axis.  This calls render()
			//		directly as a convenience method.
			// name: String
			//		The name of the axis as defined by addAxis.
			// range: Array
			//		The end points of the zoom range, measured in axis ticks.
			var axis = this.axes[name];
			if(axis){
				var scale, offset, bounds = axis.getScaler().bounds;
				var lower = Math.min(range[0],range[1]);
				var upper = Math.max(range[0],range[1]);
				lower = range[0] < bounds.lower ? bounds.lower : lower;
				upper = range[1] > bounds.upper ? bounds.upper : upper;
				scale = (bounds.upper - bounds.lower) / (upper - lower);
				offset = lower - bounds.lower;
				this.setAxisWindow(name, scale, offset);
				if(delayed){
					this.delayedRender();
				}else{
					this.render();
				}
			}
		},
		calculateGeometry: function(){
			// summary:
			//		Calculate the geometry of the chart based on the defined axes of
			//		a chart.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			if(this.dirty){
				return this.fullGeometry();
			}

			// calculate geometry
			var dirty = this.plots.filter(function(plot){
					return plot.dirty ||
						(plot.hAxis && this.axes[plot.hAxis].dirty) ||
						(plot.vAxis && this.axes[plot.vAxis].dirty);
				}, this);
			calculateAxes(dirty, this.plotArea);

			return this;	//	dcharting/Chart
		},
		fullGeometry: function(){
			// summary:
			//		Calculate the full geometry of the chart.  This includes passing
			//		over all major elements of a chart (plots, axes, series, container)
			//		in order to ensure proper rendering.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			this._makeDirty();

			// clear old values
			this.plots.forEach(clear);

			// rebuild new connections, and add defaults

			// set up a theme
			if(!this.theme){
				this.set("theme", new Theme());
			}

			// assign series
			this.series.forEach(function(run){
				if(run.plot){
					run.plot.addSeries(run);
				}else{
					// if no plot is specified, assign series to all plots that support series
					this.plots.forEach(function(plot){
						plot.addSeries && plot.addSeries(run);
					});
				}
			}, this);
			// assign axes
			this.plots.forEach(function(plot){
				if(plot.assignAxes){
					plot.assignAxes(this.axes);
				}
			}, this);

			// calculate geometry

			// 1st pass
			var dim = this.dim = this.surface.getDimensions();
			dim.width  = g.normalizedLength(dim.width);
			dim.height = g.normalizedLength(dim.height);
			for(k in this.axes){
				this.axes[k].clear();
			}
			calculateAxes(this.plots, dim);

			var i, k, axis;
			// assumption: we don't have stacked axes yet
			var offsets = this.offsets = {l: 0, r: 0, t: 0, b: 0}, o;
			// chart mirroring starts
			var self = this;
			for(var i in this.axes){
				axis = this.axes[i];
				if(has("dojo-bidi")){
					self._resetLeftBottom(axis);
				}
				o = axis.getOffsets();
				for(k in o){
					offsets[k] = Math.max(o[k], offsets[k]);
				}
			};
			// chart mirroring ends
			// add title area
			if(this.title){
				this.titleGap = (this.titleGap==0) ? 0 : this.titleGap || this.theme.chart.titleGap || 20;
				this.titlePos = this.titlePos || this.theme.chart.titlePos || "top";
				this.titleFont = this.titleFont || this.theme.chart.titleFont;
				this.titleFontColor = this.titleFontColor || this.theme.chart.titleFontColor || "black";
				var tsize = g.normalizedLength(g.splitFontString(this.titleFont).size);
				offsets[this.titlePos == "top" ? "t" : "b"] += (tsize + this.titleGap);
			}
			// add margins
			for (k in this.margins){
				offsets[k] += this.margins[k];
			}

			// 2nd pass with realistic dimensions
			this.plotArea = {
				width: dim.width - offsets.l - offsets.r,
				height: dim.height - offsets.t - offsets.b
			};
			for(var axis in this.axes){
				this.axes[axis].clear();
			}
			calculateAxes(this.plots, this.plotArea);

			return this;	//	dcharting/Chart
		},
		render: function(){
			// summary:
			//		Render the chart according to the current information defined.  This should
			//		be the last call made when defining/creating a chart, or if data within the
			//		chart has been changed.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.

			// do we have a delayed renderer pending? If yes we need to clear it
			if(this._delayedRenderHandle){
				clearTimeout(this._delayedRenderHandle);
				this._delayedRenderHandle = null;
			}
			
			if(this.theme){
				this.theme.clear();
			}

			if(this.dirty){
				return this.fullRender();
			}

			this.calculateGeometry();

			// (used to be: go over the stack backwards) we now go forward
			for(var i = 0; i < this.plots.length; i++){
				this.plots[i].render(this.dim, this.offsets);
			}

			// go over axes
			for(var axis in this.axes){
				this.axes[axis].render(this.dim, this.offsets);
			}

			this._makeClean();

			return this;	//	dcharting/Chart
		},
		fullRender: function(){
			// summary:
			//		Force a full rendering of the chart, including full resets on the chart itself.
			//		You should not call this method directly unless absolutely necessary.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.

			// calculate geometry
			this.fullGeometry();
			var offsets = this.offsets, dim = this.dim;
			var w = Math.max(0, dim.width  - offsets.l - offsets.r),
				h = Math.max(0, dim.height - offsets.t - offsets.b);

			// clear old shapes
			this.series.forEach(purgeGroup);
			for(var axis in this.axes){
				this.axes[axis].purgeGroup();
			}
			this.plots.forEach(purgeGroup);
			var children = this.surface.children;
			// starting with 1.9 the registry is optional and thus dispose is
			if(shape.dispose){
				for(var i = 0; i < children.length;++i){
					shape.dispose(children[i]);
				}
			}
			if(this.chartTitle && this.chartTitle.tagName){
				// destroy title if it is a DOM node
			    domConstruct.destroy(this.chartTitle);
			}
			this.surface.clear();
			this.chartTitle = null;

			this._renderChartBackground(dim, offsets);
			if(this._nativeClip){
				this._renderPlotBackground(dim, offsets, w, h);
			}else{
				// VML
				this._renderPlotBackground(dim, offsets, w, h);
			}

			// (used to be: go over the stack backwards) we now go forward
			for(var i = 0; i < this.plots.length; i++){
				this.plots[i].render(dim, offsets);
			}

			if(!this._nativeClip){
				// VML, matting-clipping
				this._renderChartBackground(dim, offsets);
			}

			//create title: Whether to make chart title as a widget which extends dcharting/Element?
			if(this.title){
				var forceHtmlLabels = (g.renderer == "canvas") && this.htmlLabels,
					labelType = forceHtmlLabels || !has("ie") && !has("opera") && this.htmlLabels ? "html" : "gfx",
					tsize = g.normalizedLength(g.splitFontString(this.titleFont).size);
				this.chartTitle = common.createText[labelType](
					this,
					this.surface,
					dim.width/2,
					this.titlePos=="top" ? tsize + this.margins.t : dim.height - this.margins.b,
					"middle",
					this.title,
					this.titleFont,
					this.titleFontColor
				);
			}

			// go over axes
			for(var axis in this.axes){
				this.axes[axis].render(dim, offsets);
			}

			this._makeClean();

			return this;	//	dcharting/Chart
		},
		_renderChartBackground: function(dim, offsets){
			var t = this.theme, rect;
			// chart background
			var fill   = this.fill   !== undefined ? this.fill   : (t.chart && t.chart.fill);
			var stroke = this.stroke !== undefined ? this.stroke : (t.chart && t.chart.stroke);

			// TRT: support for "inherit" as a named value in a theme.
			if(fill == "inherit"){
				//	find the background color of the nearest ancestor node, and use that explicitly.
				var node = this.domNode;
				fill = new Color(domStyle.get(node, "backgroundColor"));
				while(fill.a==0 && node!=document.documentElement){
					fill = new Color(domStyle.get(node, "backgroundColor"));
					node = node.parentNode;
				}
			}

			if(fill){
				if(this._nativeClip){
					fill = Element.prototype._shapeFill(Element.prototype._plotFill(fill, dim),
						{ x:0, y: 0, width: dim.width + 1, height: dim.height + 1 });
					this.surface.createRect({ width: dim.width + 1, height: dim.height + 1 }).setFill(fill);
				}else{
					// VML
					fill = Element.prototype._plotFill(fill, dim, offsets);
					if(offsets.l){	// left
						rect = {
							x: 0,
							y: 0,
							width:  offsets.l,
							height: dim.height + 1
						};
						this.surface.createRect(rect).setFill(Element.prototype._shapeFill(fill, rect));
					}
					if(offsets.r){	// right
						rect = {
							x: dim.width - offsets.r,
							y: 0,
							width:  offsets.r + 1,
							height: dim.height + 2
						};
						this.surface.createRect(rect).setFill(Element.prototype._shapeFill(fill, rect));
					}
					if(offsets.t){	// top
						rect = {
							x: 0,
							y: 0,
							width:  dim.width + 1,
							height: offsets.t
						};
						this.surface.createRect(rect).setFill(Element.prototype._shapeFill(fill, rect));
					}
					if(offsets.b){	// bottom
						rect = {
							x: 0,
							y: dim.height - offsets.b,
							width:  dim.width + 1,
							height: offsets.b + 2
						};
						this.surface.createRect(rect).setFill(Element.prototype._shapeFill(fill, rect));
					}
				}
			}
			if(stroke){
				this.surface.createRect({
					width:  dim.width - 1,
					height: dim.height - 1
				}).setStroke(stroke);
			}
		},
		_renderPlotBackground: function(dim, offsets, w, h){
			var t = this.theme;

			// draw a plot background
			var fill   = t.plotarea && t.plotarea.fill;
			var stroke = t.plotarea && t.plotarea.stroke;
			// size might be neg if offsets are bigger that chart size this happens quite often at
			// initialization time if the chart widget is used in a BorderContainer
			// this will fail on IE/VML
			var rect = {
				x: offsets.l - 1, y: offsets.t - 1,
				width:  w + 2,
				height: h + 2
			};
			if(fill){
				fill = Element.prototype._shapeFill(Element.prototype._plotFill(fill, dim, offsets), rect);
				this.surface.createRect(rect).setFill(fill);
			}
			if(stroke){
				this.surface.createRect({
					x: offsets.l, y: offsets.t,
					width:  w + 1,
					height: h + 1
				}).setStroke(stroke);
			}
		},
		delayedRender: function(){
			// summary:
			//		Delayed render, which is used to collect multiple updates
			//		within a delayInMs time window.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.

			if(!this._delayedRenderHandle){
				this._delayedRenderHandle = setTimeout(this.render.bind(this), this.delayInMs);
			}

			return this;	//	dcharting/Chart
		},
		fireEvent: function(seriesName, eventName, index){
			// summary:
			//		Fires a synthetic event for a series item.
			// seriesName: String
			//		Series name.
			// eventName: String
			//		Event name to simulate: onmouseover, onmouseout, onclick.
			// index: Number
			//		Valid data value index for the event.
			// returns: dcharting/Chart
			//		A reference to the current chart for functional chaining.
			if(seriesName in this.runs){
				var plotName = this.series[this.runs[seriesName]].plot;
				if(plotName in this.plots){
					var plot = this.stack[this.plots[plotName]];
					if(plot){
						plot.fireEvent(seriesName, eventName, index);
					}
				}
			}
			return this;	//	dcharting/Chart
		},
		_makeClean: function(){
			// reset dirty flags
			for(var axis in this.axes){
				makeClean(this.axes[axis]);
			}
			this.plots.forEach(makeClean);
			this.series.forEach(makeClean);
			this.dirty = false;
		},
		_makeDirty: function(){
			// reset dirty flags
			for(var axis in this.axes){
				makeDirty(this.axes[axis]);
			}
			this.plots.forEach(makeDirty);
			this.series.forEach(makeDirty);
			this.dirty = true;
		},
		// TODO (not by plotName)
		_invalidateDependentPlots: function(plotName, /* Boolean */ verticalAxis){
			if(plotName in this.plots){
				var plot = this.stack[this.plots[plotName]], axis,
					axisName = verticalAxis ? "vAxis" : "hAxis";
				if(plot[axisName]){
					axis = this.axes[plot[axisName]];
					if(axis && axis.dependOnData()){
						axis.dirty = true;
						// find all plots and mark them dirty
						this.stack.forEach(function(p){
							if(p[axisName] && p[axisName] == plot[axisName]){
								p.dirty = true;
							}
						});
					}
				}else{
					plot.dirty = true;
				}
			}
		},
		setDir : function(dir){
			return this; 
		},
		_resetLeftBottom: function(axis){
		},
		formatTruncatedLabel: function(element, label, labelType){			
		}
	});

	function hSection(stats){
		return {min: stats.hmin, max: stats.hmax};
	}

	function vSection(stats){
		return {min: stats.vmin, max: stats.vmax};
	}

	function hReplace(stats, h){
		stats.hmin = h.min;
		stats.hmax = h.max;
	}

	function vReplace(stats, v){
		stats.vmin = v.min;
		stats.vmax = v.max;
	}

	function combineStats(target, source){
		if(target && source){
			target.min = Math.min(target.min, source.min);
			target.max = Math.max(target.max, source.max);
		}
		return target || source;
	}

	function calculateAxes(stack, plotArea){
		var plots = {}, axes = {};
		stack.forEach(function(plot){
			var stats = plots[plot.name] = plot.getSeriesStats();
			if(plot.hAxis){
				axes[plot.hAxis] = combineStats(axes[plot.hAxis], hSection(stats));
			}
			if(plot.vAxis){
				axes[plot.vAxis] = combineStats(axes[plot.vAxis], vSection(stats));
			}
		});
		stack.forEach(function(plot){
			var stats = plots[plot.name];
			if(plot.hAxis){
				hReplace(stats, axes[plot.hAxis]);
			}
			if(plot.vAxis){
				vReplace(stats, axes[plot.vAxis]);
			}
			plot.initializeScalers(plotArea, stats);
		});
	}
	
	return has("dojo-bidi")? declare([Chart, BidiChart]) : Chart;
});
