define(["dojo/_base/declare", "./Default"], 
  function(declare, Default){

	return declare(Default, {
		// summary:
		//		Represents an area chart.  See dcharting/plot2d/Default for details.
		constructor: function(){
			// summary:
			//		The constructor for an Area chart.
			this.opt.lines = true;
			this.opt.areas = true;
		}
	});
});
