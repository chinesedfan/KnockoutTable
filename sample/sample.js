function getUrlParam(name, targetStr) {
    var target = targetStr || window.location.search + window.location.hash,
        reg = new RegExp('[\\?#&]' + name + '=([^\\?#&]*)(\\?|#|&|$)', 'i'),
        matches = reg.exec(target);

    return matches ? decodeURIComponent(matches[1]) : '';
}

var test = getUrlParam('test') || '0';
var options = {
	"0": { data: WC2014Data },
	"1": {
		needbus: false,
		cell: { width: 50, height: 30, padding: 60 },
	    linker: { input: { offset: 5, height: 100 }, output: { height: 50 } },
	    data: SimCityData
	}
};

var table = new MergeDiagram($('.J_container'), options[test]);
table.draw();