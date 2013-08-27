define(["./base", "../utils"], function(base, utils){
	var green = base.clone();
	green.chart.fill = green.plotarea.fill = "#eff5e6";
	green.colors = utils.defineColors({hue: 82, saturation: 60, low: 40, high: 88});
	
	return green;
});
