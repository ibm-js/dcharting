define(["./base", "../utils"], function(base, utils){
	var blue = base.clone();
	blue.chart.fill = blue.plotarea.fill = "#e7eef6";
	blue.colors = utils.defineColors({hue: 217, saturation: 60, low: 40, high: 88});
	
	return blue;
});
