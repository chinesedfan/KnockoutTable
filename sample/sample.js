//var data = WC2014Data;
var data = SimCityData;

var table = new KnockoutTable($('.J_container'), {
	data: data
});
table.draw();