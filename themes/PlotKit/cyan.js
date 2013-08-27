define(["./base", "../utils"], function(base, utils){
	var cyan = base.clone();
	cyan.chart.fill = cyan.plotarea.fill = "#e6f1f5";
	cyan.colors = utils.defineColors({hue: 194, saturation: 60, low: 40, high: 88});
	
	return cyan;
});
