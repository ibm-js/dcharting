define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojox/gfx",
		"../Element", "./common", "../axis2d/common", "dojo/has"],
	function(declare, lang, arr, gfx, Element, common, ac, has){
	var Base = declare(Element, {

		// fixed: Boolean?
		//		Whether a fixed precision must be applied to data values for display. Default is true.
		fixed:			true,

		// precision: Number?
		//		The precision at which to round data values for display. Default is 0.
		precision:		1,

		// htmlLabels: Boolean?
		//		Whether or not to use HTML to render slice labels. Default is true.
		htmlLabels:		true,

		// tooltipFunc: Function?
		//		An optional function used to compute tooltip text for this plot. It takes precedence over
		//		the default function when available.
		//	|		function tooltipFunc(o) { return "text"; }
		//		`o`is the event object that triggered the tooltip.
		tooltipFunc: null,

		// summary:
		//		Base class for all plot types.
		constructor: function(params){
			// summary:
			//		Create a base plot for charting.
			// params: Object|null
			//		Hash of initialization parameters for the element.
			//		The hash can contain any of the elements's properties, excluding read-only properties.
	
			// TODO does not work in markup
			lang.mixin(this, params);
			this.type = "Plot";
		},
		clear: function(){
			// summary:
			//		Clear out all of the information tied to this plot.
			// returns: dojox.charting.plot2d.Base
			//		A reference to this plot for functional chaining.
			this.series = [];
			this.dirty = true;
			return this;	//	dcharting/plot2d/Base
		},
		setAxis: function(axis){
			// summary:
			//		Set an axis for this plot.
			// axis: dojox.charting.axis2d.Base
			//		The axis to set.
			// returns: dcharting/plot2d/Base
			//		A reference to this plot for functional chaining.
			return this;	//	dcharting/plot2d/Base
		},
		assignAxes: function(axes){
			// summary:
			//		From an array of axes pick the ones that correspond to this plot and
			//		assign them to the plot using setAxis method.
			// axes: Array
			//		An array of dcharting/axis2d/Base
			// tags:
			//		protected
			arr.forEach(this.axes, function(axis){
				if(this[axis]){
					this.setAxis(axes[this[axis]]);
				}
			}, this);
		},
		addSeries: function(run){
			// summary:
			//		Add a data series to this plot.
			// run: dojox.charting.Series
			//		The series to be added.
			// returns: dcharting/plot2d/Base
			//		A reference to this plot for functional chaining.
			this.series.push(run);
			return this;	//	dcharting/plot2d/Base
		},
		getSeriesStats: function(){
			// summary:
			//		Calculate the min/max on all attached series in both directions.
			// returns: Object
			//		{hmin, hmax, vmin, vmax} min/max in both directions.
			return common.collectSimpleStats(this.series);
		},
		calculateAxes: function(dim){
			// summary:
			//		Stub function for running the axis calculations (deprecated).
			// dim: Object
			//		An object of the form { width, height }
			// returns: dcharting/plot2d/Base
			//		A reference to this plot for functional chaining.
			this.initializeScalers(dim, this.getSeriesStats());
			return this;	//	dcharting/plot2d/Base
		},
		initializeScalers: function(){
			// summary:
			//		Does nothing.
			return this;
		},
		isDataDirty: function(){
			// summary:
			//		Returns whether or not any of this plot's data series need to be rendered.
			// returns: Boolean
			//		Flag indicating if any of this plot's series are invalid and need rendering.
			return arr.some(this.series, function(item){ return item.dirty; });	//	Boolean
		},
		render: function(dim, offsets){
			// summary:
			//		Render the plot on the chart.
			// dim: Object
			//		An object of the form { width, height }.
			// offsets: Object
			//		An object of the form { l, r, t, b }.
			// returns: dcharting/plot2d/Base
			//		A reference to this plot for functional chaining.
			return this;	//	dcharting/plot2d/Base
		},
		renderLabel: function(group, x, y, label, theme, block, align){
			var elem = ac.createText[this.htmlLabels && gfx.renderer != "vml" ? "html" : "gfx"]
				(this.chart, group, x, y, align?align:"middle", label, theme.series.font, theme.series.fontColor);
			// if the label is inside we need to avoid catching events on it this would prevent action on
			// chart elements
			if(block){
				// TODO this won't work in IE neither in VML nor in HTML
				// a solution would be to catch the event on the label and refire it to the element
				// possibly using elementFromPoint or having it already available
				if(this.htmlLabels && gfx.renderer != "vml"){
					// we have HTML labels, let's use pointEvents on the HTML node
					elem.style.pointerEvents = "none";
				}else if(elem.rawNode){
					// we have SVG labels, let's use pointerEvents on the SVG or VML node
					elem.rawNode.style.pointerEvents = "none";
				}
				// else we have Canvas, we need do nothing, as Canvas text won't catch events
			}
			if(this.htmlLabels && gfx.renderer != "vml"){
				this.htmlElements.push(elem);
			}

			return elem;
		},
		getRequiredColors: function(){
			// summary:
			//		Get how many data series we have, so we know how many colors to use.
			// returns: Number
			//		The number of colors needed.
			return this.series.length;	//	Number
		},
		_getLabel: function(number){
			return common.getLabel(number, this.fixed, this.precision);
		}
	});
	if(has("dojo-bidi")){
		Base.extend({
			_checkOrientation: function(group, dim, offsets){
				this.chart.applyMirroring(this.group, dim, offsets);
			}		
		});
	}
	return Base;
});
