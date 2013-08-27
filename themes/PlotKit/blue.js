define(["./base", "../utils"], function(pk, utils){
	pk.blue = pk.base.clone();
	pk.blue.chart.fill = pk.blue.plotarea.fill = "#e7eef6";
	pk.blue.colors = utils.defineColors({hue: 217, saturation: 60, low: 40, high: 88});
	
	return pk.blue;
});
