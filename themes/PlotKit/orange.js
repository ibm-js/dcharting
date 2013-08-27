define(["./base", "../utils"], function(base, utils){
	var orange = base.clone();
	orange.chart.fill = orange.plotarea.fill = "#f5eee6";
	orange.colors = utils.defineColors({hue: 31, saturation: 60, low: 40, high: 88});
	
	return orange;
});
