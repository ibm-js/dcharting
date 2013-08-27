define(["./base", "../utils"], function(base, utils){
	var red = base.clone();
	red.chart.fill = red.plotarea.fill = "#f5e6e6";
	red.colors = utils.defineColors({hue: 1, saturation: 60, low: 40, high: 88});
	
	return red;
});
