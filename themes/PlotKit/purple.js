define(["./base", "../utils"], function(base, utils){
	var purple = base.clone();
	purple.chart.fill = purple.plotarea.fill = "#eee6f5";
	purple.colors = utils.defineColors({hue: 271, saturation: 60, low: 40, high: 88});
	
	return purple;
});
